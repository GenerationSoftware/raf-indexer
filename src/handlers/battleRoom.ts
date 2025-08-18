import { ponder } from "ponder:registry";
import { battle, party, battleRoomData, partyRoomBattle } from "ponder:schema";

// BattleRoom: BattleCreated
ponder.on("BattleRoom:BattleCreated" as any, async ({ event, context }: any) => {
  const actAddress = event.args.act.toLowerCase();
  const partyId = event.args.partyId.toString();
  const roomId = BigInt(event.args.roomId || 0);
  const battleAddress = event.args.battle.toLowerCase();
  
  // Extract BattleRoomData from event
  const data = event.args.data;
  const monsterIndex1 = data ? BigInt(data.monsterIndex1 || 0) : BigInt(0);

  console.log("BATTLE CREATED", {
    actAddress: actAddress,
    partyId: partyId,
    roomId: roomId.toString(),
    battleAddress: battleAddress,
    monsterIndex1: monsterIndex1.toString()
  });

  // Store BattleRoom specific data
  await context.db
    .insert(battleRoomData)
    .values({
      id: `${actAddress}-${partyId}-${roomId}`,
      actAddress: actAddress,
      partyId: partyId,
      roomId: roomId,
      monsterIndex1: monsterIndex1,
      battleAddress: battleAddress,
      createdAt: event.block.timestamp,
      startedAt: BigInt(0),
    })
    .onConflictDoUpdate({
      monsterIndex1: monsterIndex1,
      battleAddress: battleAddress,
      createdAt: event.block.timestamp,
    });

  // Create partyRoomBattle link
  const partyRoomBattleId = `${actAddress}-${partyId}-${roomId}-${battleAddress}`;
  await context.db
    .insert(partyRoomBattle)
    .values({
      id: partyRoomBattleId,
      partyId: `${actAddress}-${partyId}`,
      battleAddress: battleAddress,
      roomId: roomId,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      createdAt: event.block.timestamp,
    });

  // Update the party state to IN_ROOM
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
      state: BigInt(2), // IN_ROOM - battles are created when entering a room
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: BigInt(0), // Will be updated by onConflictDoUpdate
      endedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      roomId: roomId,
      state: BigInt(2), // IN_ROOM
    });

  const init = {
    createdAt: event.block.timestamp,
    enforceAdjacency: false,
    turnTimerEnabled: false
  }

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
      currentTurn: BigInt(0),
      teamAStarts: false,
      teamACount: BigInt(0),
      teamBCount: BigInt(0),
      teamAEliminated: BigInt(0),
      teamBEliminated: BigInt(0),
      winner: BigInt(0),
      gameStartedAt: BigInt(0),
      gameEndedAt: BigInt(0),
      // Turn struct fields - will be updated by GameStartedEvent
      currentTurnStartedAt: BigInt(0),
      currentTurnDuration: BigInt(0),
      currentTurnEndTurnCount: BigInt(0),
      currentTurnRandomNumber: BigInt(0),
      ...init
    })
    .onConflictDoUpdate(init);
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

  // Update the battleRoomData startedAt timestamp
  await context.db
    .insert(battleRoomData)
    .values({
      id: `${actAddress}-${partyId}-${roomId}`,
      actAddress: actAddress,
      partyId: partyId,
      roomId: roomId,
      monsterIndex1: BigInt(0), // Will be kept from onConflictDoUpdate
      battleAddress: "", // Will be kept from onConflictDoUpdate
      createdAt: BigInt(0), // Will be kept from onConflictDoUpdate
      startedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      startedAt: event.block.timestamp,
    });

  // Get the battle address for this party and room from battleRoomData
  const battleRoomInfo = await context.db.find(battleRoomData, {
    id: `${actAddress}-${partyId}-${roomId}`
  });

  if (battleRoomInfo && battleRoomInfo.battleAddress) {
    // Update the battle's gameStartedAt timestamp
    await context.db
      .insert(battle)
      .values({
        id: battleRoomInfo.battleAddress,
        owner: "",
        operator: "",
        joinDeadlineAt: BigInt(0),
        turnDuration: BigInt(0),
        turnTimerEnabled: false,
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
        // Turn struct fields - will be updated by GameStartedEvent
        currentTurnStartedAt: BigInt(0),
        currentTurnDuration: BigInt(0),
        currentTurnEndTurnCount: BigInt(0),
        currentTurnRandomNumber: BigInt(0),
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