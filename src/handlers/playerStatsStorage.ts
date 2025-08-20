import { ponder } from "ponder:registry";
import { battlePlayer, battle } from "ponder:schema";
import PlayerStatsStorageAbi from "../contracts/abis/PlayerStatsStorage.json";

// PlayerStatsStorage: PlayerStatUpdatedEvent
ponder.on("PlayerStatsStorage:PlayerStatUpdatedEvent" as any, async ({ event, context }: any) => {
  console.log("PLAYER STAT UPDATED", {
    operator: event.args.operator.toLowerCase(),
    playerId: event.args.playerId.toString(),
    teamA: event.args.stats.teamA,
    turn: event.args.stats.turn,
    statsData: event.args.stats.stats
  });

  // The operator (battle address) is now directly in the event args
  const battleAddress = event.args.operator.toLowerCase();
  
  if (!battleAddress) {
    console.log("No operator found in event");
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

// PlayerStatsStorage: PlayerStatsClonedEvent
ponder.on("PlayerStatsStorage:PlayerStatsClonedEvent" as any, async ({ event, context }: any) => {
  console.log("PLAYER STATS CLONED", {
    fromOperator: event.args.fromOperator.toLowerCase(),
    fromPlayerId: event.args.fromPlayerId.toString(),
    toOperator: event.args.toOperator.toLowerCase(),
    toPlayerId: event.args.toPlayerId.toString()
  });

  // Handle cloning of player stats from one operator/player to another
  // This might be used when transferring stats between battles or contexts
  const fromBattlePlayerId = event.args.fromOperator.toLowerCase() + "-" + event.args.fromPlayerId.toString();
  const toBattlePlayerId = event.args.toOperator.toLowerCase() + "-" + event.args.toPlayerId.toString();

  // Get the source player stats
  const sourcePlayer = await context.db.find(battlePlayer, { id: fromBattlePlayerId });
  
  if (sourcePlayer && sourcePlayer.statsData) {
    // Find or create the target player
    const targetPlayer = await context.db.find(battlePlayer, { id: toBattlePlayerId });
    
    if (targetPlayer) {
      // Update the target player with cloned stats
      await context.db
        .insert(battlePlayer)
        .values({
          id: targetPlayer.id,
          battleAddress: targetPlayer.battleAddress,
          playerId: targetPlayer.playerId,
          character: targetPlayer.character,
          locationX: targetPlayer.locationX,
          locationY: targetPlayer.locationY,
          teamA: targetPlayer.teamA,
          joinedAt: targetPlayer.joinedAt,
          eliminated: targetPlayer.eliminated,
          eliminatedAt: targetPlayer.eliminatedAt,
          statsLastUpdatedTurn: sourcePlayer.statsLastUpdatedTurn,
          statsData: sourcePlayer.statsData,
        })
        .onConflictDoUpdate({
          statsLastUpdatedTurn: sourcePlayer.statsLastUpdatedTurn,
          statsData: sourcePlayer.statsData,
        });

      console.log("CLONED BATTLE PLAYER STATS", {
        from: fromBattlePlayerId,
        to: toBattlePlayerId,
        statsData: sourcePlayer.statsData
      });
    }
  }
});