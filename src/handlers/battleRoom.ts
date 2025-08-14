import { ponder } from "ponder:registry";
import { battle, party, actRoom } from "ponder:schema";

// BattleRoom: BattleCreated
ponder.on("BattleRoom:BattleCreated" as any, async ({ event, context }: any) => {
  const actAddress = event.args.act.toLowerCase();
  const partyId = event.args.partyId.toString();
  const roomId = BigInt(event.args.roomId || 0);
  const battleAddress = event.args.battle.toLowerCase();

  console.log("BATTLE CREATED", {
    actAddress: actAddress,
    partyId: partyId,
    roomId: roomId.toString(),
    battleAddress: battleAddress
  });

  // Update the party with the battle address
  await context.db
    .insert(party)
    .values({
      id: actAddress + "-" + partyId,
      actAddress: actAddress,
      partyId: partyId,
      leader: "", // Will be updated by onConflictDoUpdate
      isPublic: false, // Will be updated by onConflictDoUpdate
      inviter: "", // Will be updated by onConflictDoUpdate
      roomId: roomId,
      battleAddress: battleAddress,
      state: BigInt(2), // IN_ROOM - battles are created when entering a room
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: BigInt(0), // Will be updated by onConflictDoUpdate
      endedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      battleAddress: battleAddress,
    });

  // Update the actRoom with the battle address
  await context.db
    .insert(actRoom)
    .values({
      id: actAddress + "-" + roomId.toString(),
      actAddress: actAddress,
      roomId: roomId,
      roomType: BigInt(0), // Will be updated by onConflictDoUpdate
      monsterIndex1: BigInt(0), // Will be updated by onConflictDoUpdate
      monsterIndex2: BigInt(0), // Will be updated by onConflictDoUpdate
      monsterIndex3: BigInt(0), // Will be updated by onConflictDoUpdate
      battle: battleAddress,
      revealedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      battle: battleAddress,
    });

  // Create the battle entity
  await context.db
    .insert(battle)
    .values({
      id: battleAddress,
      owner: "", // Could be fetched from contract if needed
      operator: "", // Could be fetched from contract if needed
      joinDeadlineAt: BigInt(0), // Will be set from Battle contract events
      turnDuration: BigInt(0), // Will be set from Battle contract events
      deckConfiguration: "", // Will be set from Battle contract events
      playerStatsStorage: "", // Will be set from Battle contract events
      enforceAdjacency: false, // Will be set from Battle contract events
      currentTurn: BigInt(0),
      teamAStarts: false,
      teamACount: BigInt(0),
      teamBCount: BigInt(0),
      teamAEliminated: BigInt(0),
      teamBEliminated: BigInt(0),
      winner: BigInt(0),
      gameStartedAt: BigInt(0),
      gameEndedAt: BigInt(0),
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      createdAt: event.block.timestamp,
    });
});

// BattleRoom: BattleStarted
ponder.on("BattleRoom:BattleStarted" as any, async ({ event, context }: any) => {
  const actAddress = event.args.act.toLowerCase();
  const partyId = event.args.partyId.toString();
  const roomId = BigInt(event.args.roomId || 0);

  console.log("BATTLE STARTED", {
    actAddress: actAddress,
    partyId: partyId,
    roomId: roomId.toString()
  });

  // Get the battle address for this party and room
  const partyData = await context.db.find(party, {
    id: actAddress + "-" + partyId
  });

  if (partyData && partyData.battleAddress) {
    // Update the battle's gameStartedAt timestamp
    await context.db
      .insert(battle)
      .values({
        id: partyData.battleAddress,
        owner: "",
        operator: "",
        joinDeadlineAt: BigInt(0),
        turnDuration: BigInt(0),
        deckConfiguration: "",
        playerStatsStorage: "",
        enforceAdjacency: false,
        currentTurn: BigInt(1), // Battle starts at turn 1
        teamAStarts: false,
        teamACount: BigInt(0),
        teamBCount: BigInt(0),
        teamAEliminated: BigInt(0),
        teamBEliminated: BigInt(0),
        winner: BigInt(0),
        gameStartedAt: event.block.timestamp,
        gameEndedAt: BigInt(0),
        createdAt: BigInt(0),
      })
      .onConflictDoUpdate({
        gameStartedAt: event.block.timestamp,
        currentTurn: BigInt(1),
      });
  }
});

// BattleRoom: OwnershipTransferred
ponder.on("BattleRoom:OwnershipTransferred" as any, async ({ event, context }: any) => {
  console.log("BATTLEROOM OWNERSHIP TRANSFERRED", {
    contractAddress: event.log.address.toLowerCase(),
    previousOwner: event.args.previousOwner.toLowerCase(),
    newOwner: event.args.newOwner.toLowerCase()
  });
  // BattleRoom ownership transfers don't need to be tracked in our schema
});

// BattleRoom: OperatorTransferred
ponder.on("BattleRoom:OperatorTransferred" as any, async ({ event, context }: any) => {
  console.log("BATTLEROOM OPERATOR TRANSFERRED", {
    contractAddress: event.log.address.toLowerCase(),
    previousOperator: event.args.previousOperator.toLowerCase(),
    newOperator: event.args.newOperator.toLowerCase()
  });
  // BattleRoom operator transfers don't need to be tracked in our schema
});