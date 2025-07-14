import { ponder } from "ponder:registry";
import { character, characterCard } from "ponder:schema";

// Character: OwnershipTransferred
ponder.on("Character:OwnershipTransferred", async ({ event, context }) => {
  await context.db
    .insert(character)
    .values({
      id: event.log.address.toLowerCase(),
      owner: event.args.newOwner.toLowerCase()
    })
    .onConflictDoUpdate({
      owner: event.args.newOwner.toLowerCase(),
    });
});

// Character: OperatorTransferred
ponder.on("Character:OperatorTransferred", async ({ event, context }) => {
  await context.db
    .insert(character)
    .values({
      id: event.log.address.toLowerCase(),
      operator: event.args.newOperator.toLowerCase()
    })
    .onConflictDoUpdate({
      operator: event.args.newOperator.toLowerCase(),
    });
});

// Character: ActivatedCard
ponder.on("Character:ActivatedCard", async ({ event, context }) => {
  console.log("CHARACTER ACTIVATED CARD", {
    characterAddress: event.log.address.toLowerCase(),
    cardId: event.args.cardId.toString(),
    deck: event.args.deck.toLowerCase(),
    tokenId: event.args.tokenId.toString()
  });

  await context.db
    .insert(characterCard)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.cardId.toString(),
      characterAddress: event.log.address.toLowerCase(),
      cardId: event.args.cardId,
      deck: event.args.deck.toLowerCase(),
      tokenId: event.args.tokenId,
      activatedAt: event.block.timestamp,
      deactivatedAt: BigInt(0),
      isActive: true,
    })
    .onConflictDoUpdate({
      deck: event.args.deck.toLowerCase(),
      tokenId: event.args.tokenId,
      activatedAt: event.block.timestamp,
      isActive: true,
    });
});

// Character: DeactivatedCard
ponder.on("Character:DeactivatedCard", async ({ event, context }) => {
  console.log("CHARACTER DEACTIVATED CARD", {
    characterAddress: event.log.address.toLowerCase(),
    cardId: event.args.cardId.toString(),
    deck: event.args.deck.toLowerCase(),
    tokenId: event.args.tokenId.toString()
  });

  const cardId = event.log.address.toLowerCase() + "-" + event.args.cardId.toString();

  // Mark the card as deactivated
  await context.db
    .insert(characterCard)
    .values({
      id: cardId,
      characterAddress: event.log.address.toLowerCase(),
      cardId: event.args.cardId,
      deck: event.args.deck.toLowerCase(),
      tokenId: event.args.tokenId,
      activatedAt: BigInt(0),
      deactivatedAt: event.block.timestamp,
      isActive: false,
    })
    .onConflictDoUpdate({
      deactivatedAt: event.block.timestamp,
      isActive: false,
    });
});