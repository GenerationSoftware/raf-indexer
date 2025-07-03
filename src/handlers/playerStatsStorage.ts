import { ponder } from "ponder:registry";
import { battlePlayer, battle, playerStatsStorage } from "ponder:schema";
import PlayerStatsStorageAbi from "../contracts/abis/PlayerStatsStorage.json";

// PlayerStatsStorage: PlayerStatUpdatedEvent
ponder.on("PlayerStatsStorage:PlayerStatUpdatedEvent", async ({ event, context }) => {
  console.log("PLAYER STAT UPDATED", {
    playerId: event.args.playerId.toString(),
    teamA: event.args.stats.teamA,
    turn: event.args.stats.turn,
    statsData: event.args.stats.stats
  });

  // Read the operator from the PlayerStatsStorage contract (this is the battle address)
  let battleAddress = "";
  try {
    const operatorResult = await context.client.readContract({
      address: event.log.address as `0x${string}`,
      abi: PlayerStatsStorageAbi,
      functionName: "operator",
      args: []
    });
    battleAddress = operatorResult?.toLowerCase() || "";
    console.log("PLAYER STATS STORAGE OPERATOR", {
      playerStatsStorage: event.log.address.toLowerCase(),
      battleAddress: battleAddress
    });
  } catch (error) {
    console.log("Failed to read PlayerStatsStorage operator:", error);
    return;
  }

  if (!battleAddress) {
    console.log("No operator found for PlayerStatsStorage:", event.log.address.toLowerCase());
    return;
  }

  // Now find the specific battlePlayer record using battle address and playerId
  const battlePlayerId = battleAddress + "-" + event.args.playerId.toString();
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
      statsLastUpdatedTurn: BigInt(event.args.stats.turn),
      statsData: event.args.stats.stats,
    })
    .onConflictDoUpdate({
      statsLastUpdatedTurn: BigInt(event.args.stats.turn),
      statsData: event.args.stats.stats,
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