import { ponder } from "ponder:registry";
import { battle } from "ponder:schema";

// BattleFactory: CreatedGame
ponder.on("BattleFactory:CreatedGame" as any, async ({ event, context }: any) => {
  console.log("BATTLE CREATED", {
    gameAddress: event.args.gameAddress.toLowerCase(),
    owner: event.args.owner.toLowerCase(),
    operator: event.args.operator.toLowerCase(),
    startAt: event.args.startAt.toString(),
    turnDuration: event.args.turnDuration.toString(),
    deckConfiguration: event.args.deckConfiguration.toLowerCase(),
    playerStatsStorage: event.args.playerStatsStorage.toLowerCase()
  });

  await context.db
    .insert(battle)
    .values({
      id: event.args.gameAddress.toLowerCase(),
      owner: event.args.owner.toLowerCase(),
      operator: event.args.operator.toLowerCase(),
      joinDeadlineAt: event.args.startAt, // startAt is the join deadline
      turnDuration: event.args.turnDuration,
      turnTimerEnabled: true, // Default value, actual value would need to be read from contract
      deckConfiguration: event.args.deckConfiguration.toLowerCase(),
      playerStatsStorage: event.args.playerStatsStorage.toLowerCase(),
      enforceAdjacency: true, // Default value, actual value would need to be read from contract
      currentTurn: BigInt(0),
      teamAStarts: false, // Will be set when game starts
      teamACount: BigInt(0),
      teamBCount: BigInt(0),
      teamAEliminated: BigInt(0),
      teamBEliminated: BigInt(0),
      winner: BigInt(0),
      gameStartedAt: BigInt(0),
      gameEndedAt: BigInt(0),
      createdAt: event.block.timestamp,
      // Turn struct fields - will be updated by GameStartedEvent
      currentTurnStartedAt: BigInt(0),
      currentTurnDuration: BigInt(0),
      currentTurnEndTurnCount: BigInt(0),
      currentTurnRandomNumber: BigInt(0),
    })
    .onConflictDoUpdate({
      owner: event.args.owner.toLowerCase(),
      operator: event.args.operator.toLowerCase(),
      joinDeadlineAt: event.args.startAt,
      turnDuration: event.args.turnDuration,
      deckConfiguration: event.args.deckConfiguration.toLowerCase(),
      playerStatsStorage: event.args.playerStatsStorage.toLowerCase(),
    });
});