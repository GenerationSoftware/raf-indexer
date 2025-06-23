import { ponder } from "ponder:registry";
import { basicDeckCard } from "ponder:schema";

ponder.on("BasicDeck:Minted", async ({ event, context }) => {

  await context.db
    .insert(basicDeckCard)
    .values({
      id: `${event.log.address.toLowerCase()}-${event.args.tokenId.toString()}`,
      deckAddress: event.log.address.toLowerCase(),
      tokenId: event.args.tokenId,
      owner: event.args.to.toLowerCase(),
      mintedAt: event.block.timestamp,
      actionType: event.args.actionType,
    })
    .onConflictDoUpdate({
      deckAddress: event.log.address.toLowerCase(),
      owner: event.args.to.toLowerCase(),
      mintedAt: event.block.timestamp,
      actionType: event.args.actionType,
    });

});

// BasicDeck: Transfer
ponder.on("BasicDeck:Transfer", async ({ event, context }) => {
  await context.db
    .insert(basicDeckCard)
    .values({
      id: `${event.log.address.toLowerCase()}-${event.args.tokenId.toString()}`,
      deckAddress: event.log.address.toLowerCase(),
      tokenId: event.args.tokenId,
      owner: event.args.to.toLowerCase(),
      transferredAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      owner: event.args.to.toLowerCase(),
      transferredAt: event.block.timestamp
    });
});