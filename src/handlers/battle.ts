import { ponder } from "ponder:registry";
import { 
  battle, 
  battlePlayer, 
  playerAction 
} from "ponder:schema";
import PlayerStatsStorageAbi from "../contracts/abis/PlayerStatsStorage.json";
import BattleAbi from "../contracts/abis/Battle.json";

// Battle: PlayerJoinedEvent
ponder.on("Battle:PlayerJoinedEvent", async ({ event, context }) => {
  console.log("BATTLE PLAYER JOINED", {
    battleAddress: event.log.address.toLowerCase(),
    playerId: event.args.playerId.toString(),
    locationX: event.args.locationX.toString(),
    locationY: event.args.locationY.toString(),
    character: event.args.character.toLowerCase()
  });

  // Get the battle record to find the PlayerStatsStorage contract
  const battleRecord = await context.db.find(battle, { id: event.log.address.toLowerCase() });
  
  // Fetch current player stats from PlayerStatsStorage contract
  let currentStats = {
    teamA: false,
    turn: 0,
    stats: "0x"
  };
  
  if (battleRecord?.playerStatsStorage) {
    try {
      const statsResult = await context.client.readContract({
        address: battleRecord.playerStatsStorage as `0x${string}`,
        abi: PlayerStatsStorageAbi,
        functionName: "get",
        args: [event.args.playerId]
      });
      
      currentStats = {
        teamA: statsResult.teamA,
        turn: statsResult.turn,
        stats: statsResult.stats
      };
      
      console.log("FETCHED PLAYER STATS", {
        playerId: event.args.playerId.toString(),
        stats: currentStats
      });
    } catch (error) {
      console.log("Failed to fetch player stats:", error);
      // Use default values if fetch fails
    }
  }

  // Create or update battle player record
  await context.db
    .insert(battlePlayer)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.playerId.toString(),
      battleAddress: event.log.address.toLowerCase(),
      playerId: event.args.playerId,
      character: event.args.character.toLowerCase(),
      locationX: event.args.locationX,
      locationY: event.args.locationY,
      teamA: event.args.locationX === BigInt(0), // Team A is column 0
      joinedAt: event.block.timestamp,
      eliminated: false,
      eliminatedAt: BigInt(0),
      // Set stats from PlayerStatsStorage contract
      statsLastUpdatedTurn: BigInt(currentStats.turn),
      statsData: currentStats.stats,
    })
    .onConflictDoUpdate({
      character: event.args.character.toLowerCase(),
      locationX: event.args.locationX,
      locationY: event.args.locationY,
      joinedAt: event.block.timestamp,
      // Update stats on conflict as well
      statsLastUpdatedTurn: BigInt(currentStats.turn),
      statsData: currentStats.stats,
    });

  // Update battle team counts
  const isTeamA = event.args.locationX === BigInt(0);
  const battleForTeamCount = await context.db.find(battle, { id: event.log.address.toLowerCase() });
  
  if (battleForTeamCount) {
    await context.db
      .insert(battle)
      .values({
        id: event.log.address.toLowerCase(),
        teamACount: isTeamA ? (battleForTeamCount.teamACount || BigInt(0)) + BigInt(1) : battleForTeamCount.teamACount,
        teamBCount: !isTeamA ? (battleForTeamCount.teamBCount || BigInt(0)) + BigInt(1) : battleForTeamCount.teamBCount,
      })
      .onConflictDoUpdate({
        teamACount: isTeamA ? (battleForTeamCount.teamACount || BigInt(0)) + BigInt(1) : battleForTeamCount.teamACount,
        teamBCount: !isTeamA ? (battleForTeamCount.teamBCount || BigInt(0)) + BigInt(1) : battleForTeamCount.teamBCount,
      });
  }
});

// Battle: PlayerActionEvent
ponder.on("Battle:PlayerActionEvent", async ({ event, context }) => {
  console.log("BATTLE PLAYER ACTION", {
    battleAddress: event.log.address.toLowerCase(),
    playerId: event.args.playerId.toString(),
    card: event.args.card.toString(),
    cardActionParams: event.args.cardActionParams
  });

  // Get current battle state to determine turn
  const battleRecord = await context.db.find(battle, { id: event.log.address.toLowerCase() });
  const currentTurn = battleRecord?.currentTurn || BigInt(0);

  // Use multicall to get battle state information
  const [teamAEliminated, teamBEliminated, winner, gameState] = await context.client.multicall({
    multicallAddress: "0xca11bde05977b3631167028862be2a173976ca11",
    contracts: [
      {
        address: event.log.address as `0x${string}`,
        abi: BattleAbi,
        functionName: "teamAEliminated",
      },
      {
        address: event.log.address as `0x${string}`,
        abi: BattleAbi,
        functionName: "teamBEliminated",
      },
      {
        address: event.log.address as `0x${string}`,
        abi: BattleAbi,
        functionName: "winner",
      },
      {
        address: event.log.address as `0x${string}`,
        abi: BattleAbi,
        functionName: "getGameState",
      },
    ],
  });

  // Insert the player action record
  await context.db
    .insert(playerAction)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.playerId.toString() + "-" + currentTurn.toString() + "-" + event.transaction.hash + "-" + event.log.logIndex.toString(),
      battleAddress: event.log.address.toLowerCase(),
      playerId: event.args.playerId,
      turn: currentTurn,
      cardIndex: event.args.card,
      cardActionParams: event.args.cardActionParams,
      actionedAt: event.block.timestamp,
    });

  // Update the battle record with the latest state
  await context.db
    .insert(battle)
    .values({
      id: event.log.address.toLowerCase(),
      teamAEliminated: teamAEliminated.result as bigint,
      teamBEliminated: teamBEliminated.result as bigint,
      winner: gameState.result == 4n ? winner.result as bigint : null, 
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      teamAEliminated: teamAEliminated.result as bigint,
      teamBEliminated: teamBEliminated.result as bigint,
      winner: gameState.result == 4n ? winner.result as bigint : null, 
    });
});

// Battle: GameStartedEvent
ponder.on("Battle:GameStartedEvent", async ({ event, context }) => {
  console.log("BATTLE GAME STARTED", {
    battleAddress: event.log.address.toLowerCase(),
    startedAt: event.args.startedAt.toString(),
    teamAStarts: event.args.teamAStarts
  });

  await context.db
    .insert(battle)
    .values({
      id: event.log.address.toLowerCase(),
      gameStartedAt: event.args.startedAt,
      teamAStarts: event.args.teamAStarts,
      currentTurn: BigInt(1),
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      gameStartedAt: event.args.startedAt,
      teamAStarts: event.args.teamAStarts,
      currentTurn: BigInt(1),
    });
});

// Battle: GameEndedEvent
ponder.on("Battle:GameEndedEvent", async ({ event, context }) => {
  console.log("BATTLE GAME ENDED", {
    battleAddress: event.log.address.toLowerCase(),
    endedAt: event.args.endedAt.toString(),
    winner: event.args.winner.toString()
  });

  await context.db
    .insert(battle)
    .values({
      id: event.log.address.toLowerCase(),
      gameEndedAt: event.args.endedAt,
      winner: event.args.winner,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      gameEndedAt: event.args.endedAt,
      winner: event.args.winner,
    });
});

// Battle: NextTurnEvent
ponder.on("Battle:NextTurnEvent", async ({ event, context }) => {
  console.log("BATTLE NEXT TURN", {
    battleAddress: event.log.address.toLowerCase(),
    turn: event.args.turn.toString()
  });

  // Update battle current turn
  await context.db
    .insert(battle)
    .values({
      id: event.log.address.toLowerCase(),
      currentTurn: event.args.turn,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      currentTurn: event.args.turn,
    });
});

// Battle: EndedTurnEvent
ponder.on("Battle:EndedTurnEvent", async ({ event, context }) => {
  console.log("BATTLE TURN ENDED", {
    battleAddress: event.log.address.toLowerCase(),
    turn: event.args.turn.toString(),
    playerId: event.args.playerId.toString()
  });

  // Record the turn end
  await context.db
    .insert(battlePlayer)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.playerId.toString(),
      lastEndedTurn: event.args.turn
    })
    .onConflictDoUpdate({
      lastEndedTurn: event.args.turn
    });
});

// Battle: OwnershipTransferred
ponder.on("Battle:OwnershipTransferred", async ({ event, context }) => {
  console.log("BATTLE OWNERSHIP TRANSFERRED", {
    battleAddress: event.log.address.toLowerCase(),
    previousOwner: event.args.previousOwner.toLowerCase(),
    newOwner: event.args.newOwner.toLowerCase()
  });

  await context.db
    .insert(battle)
    .values({
      id: event.log.address.toLowerCase(),
      owner: event.args.newOwner.toLowerCase(),
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      owner: event.args.newOwner.toLowerCase(),
    });
});

// Battle: OperatorTransferred
ponder.on("Battle:OperatorTransferred", async ({ event, context }) => {
  console.log("BATTLE OPERATOR TRANSFERRED", {
    battleAddress: event.log.address.toLowerCase(),
    previousOperator: event.args.previousOperator.toLowerCase(),
    newOperator: event.args.newOperator.toLowerCase()
  });

  await context.db
    .insert(battle)
    .values({
      id: event.log.address.toLowerCase(),
      operator: event.args.newOperator.toLowerCase(),
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      operator: event.args.newOperator.toLowerCase(),
    });
});