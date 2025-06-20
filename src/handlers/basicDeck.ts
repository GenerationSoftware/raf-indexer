import { ponder } from "ponder:registry";
import { basicDeckCard } from "ponder:schema";

// BasicDeck: Transfer
ponder.on("BasicDeck:Transfer", async ({ event, context }) => {
  await context.db
    .insert(basicDeckCard)
    .values({
      id: `${event.log.address.toLowerCase()}-${event.args.tokenId.toString()}`,
      deckId: event.log.address.toLowerCase(),
      tokenId: event.args.tokenId,
      owner: event.args.to.toLowerCase(),
      baseUri: "",
      mintedAt: event.block.timestamp,
      transferredAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      set: {
        owner: event.args.to.toLowerCase(),
        transferredAt: event.block.timestamp,
      },
    });
});

// BasicDeck: BaseUriSet
ponder.on("BasicDeck:BaseUriSet", async ({ event, context }) => {
  await context.db
    .insert(basicDeckCard)
    .values({
      id: `${event.log.address.toLowerCase()}-unknown`, // tokenId unknown here
      deckId: event.log.address.toLowerCase(),
      tokenId: BigInt(0),
      owner: "",
      baseUri: event.args.uri,
      mintedAt: event.block.timestamp,
      transferredAt: BigInt(0),
    })
    .onConflictDoUpdate({
      set: {
        baseUri: event.args.uri,
      },
    });
}); 