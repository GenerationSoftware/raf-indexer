import { ponder } from "ponder:registry";
import { battlePlayer, battle, playerStatsStorage } from "ponder:schema";

// PlayerStatsStorage: PlayerStatUpdatedEvent
ponder.on("PlayerStatsStorage:PlayerStatUpdatedEvent", async ({ event, context }) => {
  console.log("PLAYER STAT UPDATED", {
    playerId: event.args.playerId.toString(),
    teamA: event.args.stats.teamA,
    turn: event.args.stats.turn,
    statsData: event.args.stats.stats
  });

  // The challenge here is that we need to find the battlePlayer record to update
  // But we only have the playerId from the event, not the battle address
  // We'll need to find all battlePlayer records with this playerId and update them
  // This assumes playerId is unique across all battles, or we update all instances

  // Find the battle that uses this PlayerStatsStorage contract
  // The PlayerStatsStorage operator is the Battle contract
  const battleRecord = await context.db.find(battle, { 
    playerStatsStorage: event.log.address.toLowerCase() 
  });

  if (!battleRecord) {
    console.log("No battle found for PlayerStatsStorage:", event.log.address.toLowerCase());
    return;
  }

  // Now find the specific battlePlayer record
  const battlePlayerId = battleRecord.id + "-" + event.args.playerId.toString();
  const existingPlayer = await context.db.find(battlePlayer, { id: battlePlayerId });

  if (!existingPlayer) {
    console.log("No battlePlayer found with ID:", battlePlayerId);
    return;
  }

  // Update the battlePlayer with new stats
  await context.db
    .insert(battlePlayer)
    .values({
      id: existingPlayer.id,
      battleAddress: existingPlayer.battleAddress,
      playerId: existingPlayer.playerId,
      character: existingPlayer.character,
      locationX: existingPlayer.locationX,
      locationY: existingPlayer.locationY,
      teamA: existingPlayer.teamA,
      joinedAt: existingPlayer.joinedAt,
      eliminated: existingPlayer.eliminated,
      eliminatedAt: existingPlayer.eliminatedAt,
      statsTurn: BigInt(event.args.stats.turn),
      statsData: event.args.stats.stats,
      statsUpdatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      statsTurn: BigInt(event.args.stats.turn),
      statsData: event.args.stats.stats,
      statsUpdatedAt: event.block.timestamp,
    });

  console.log("UPDATED BATTLE PLAYER STATS", {
    battlePlayerId,
    playerId: event.args.playerId.toString(),
    turn: event.args.stats.turn,
    statsData: event.args.stats.stats
  });
});

// PlayerStatsStorage: OwnershipTransferred
ponder.on("PlayerStatsStorage:OwnershipTransferred", async ({ event, context }) => {
  console.log("PLAYER STATS STORAGE OWNERSHIP TRANSFERRED", {
    previousOwner: event.args.previousOwner.toLowerCase(),
    newOwner: event.args.newOwner.toLowerCase()
  });

  // Create or update PlayerStatsStorage entity
  await context.db
    .insert(playerStatsStorage)
    .values({
      id: event.log.address.toLowerCase(),
      trustedForwarder: "", // Will be set if we have this info
      owner: event.args.newOwner.toLowerCase(),
      operator: "", // Will be set when OperatorTransferred is called
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      owner: event.args.newOwner.toLowerCase(),
    });
});

// PlayerStatsStorage: OperatorTransferred
ponder.on("PlayerStatsStorage:OperatorTransferred", async ({ event, context }) => {
  console.log("PLAYER STATS STORAGE OPERATOR TRANSFERRED", {
    previousOperator: event.args.previousOperator.toLowerCase(),
    newOperator: event.args.newOperator.toLowerCase()
  });

  // Create or update PlayerStatsStorage entity
  await context.db
    .insert(playerStatsStorage)
    .values({
      id: event.log.address.toLowerCase(),
      trustedForwarder: "", // Will be set if we have this info
      owner: "", // Will be set when OwnershipTransferred is called
      operator: event.args.newOperator.toLowerCase(),
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      operator: event.args.newOperator.toLowerCase(),
    });
});