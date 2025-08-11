import { ponder } from "ponder:registry";
import { standardDeckCard } from "ponder:schema";

ponder.on("StandardDeck:Minted" as any, async ({ event, context }: any) => {

  await context.db
    .insert(standardDeckCard)
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

// StandardDeck: Transfer
ponder.on("StandardDeck:Transfer" as any, async ({ event, context }: any) => {
  await context.db
    .insert(standardDeckCard)
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