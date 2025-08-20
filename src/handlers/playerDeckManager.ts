import { ponder } from "ponder:registry";
import { playerDeck, playerDeckCard } from "ponder:schema";

ponder.on("PlayerDeckManager:DeckCreated" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const owner = event.args.owner.toLowerCase();
  const cardCount = event.args.cardCount;

  const id = `${playerDeckManagerAddress}-${deckId}`;

  console.log("DECK CREATED", {
    deckId: deckId.toString(),
    owner: owner,
    cardCount: cardCount.toString()
  });

  await context.db
    .insert(playerDeck)
    .values({
      id,
      playerDeckManagerAddress,
      deckId: BigInt(deckId),
      owner,
      createdAt: event.block.timestamp,
      destroyedAt: 0n,
      isActive: true,
    })
    .onConflictDoUpdate({
      owner,
      createdAt: event.block.timestamp,
      isActive: true,
    });
});

ponder.on("PlayerDeckManager:DeckDestroyed" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const owner = event.args.owner.toLowerCase();

  const id = `${playerDeckManagerAddress}-${deckId}`;

  console.log("DECK DESTROYED", {
    deckId: deckId.toString(),
    owner: owner
  });

  await context.db
    .insert(playerDeck)
    .values({
      id,
      playerDeckManagerAddress,
      deckId: BigInt(deckId),
      owner,
      createdAt: 0n,
      destroyedAt: event.block.timestamp,
      isActive: false,
    })
    .onConflictDoUpdate({
      destroyedAt: event.block.timestamp,
      isActive: false,
    });
});

ponder.on("PlayerDeckManager:CardAddedToDrawPile" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const cardId = event.args.cardId;
  const deck = event.args.deck.toLowerCase();
  const actionType = event.args.actionType;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;
  const cardEntityId = `${playerDeckId}-${cardId}`;

  console.log("CARD ADDED TO DRAW PILE", {
    deckId: deckId.toString(),
    cardId: cardId.toString(),
    deck: deck,
    actionType: actionType.toString()
  });

  await context.db
    .insert(playerDeckCard)
    .values({
      id: cardEntityId,
      playerDeckId,
      deckAddress: deck,
      cardIndex: BigInt(cardId),
      actionType: BigInt(actionType),
      location: "draw",
      addedAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      deckAddress: deck,
      actionType: BigInt(actionType),
      location: "draw",
      updatedAt: event.block.timestamp,
    });
});

ponder.on("PlayerDeckManager:CardAddedToHand" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const cardId = event.args.cardId;
  const deck = event.args.deck.toLowerCase();
  const actionType = event.args.actionType;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;
  const cardEntityId = `${playerDeckId}-${cardId}`;

  console.log("CARD ADDED TO HAND", {
    deckId: deckId.toString(),
    cardId: cardId.toString(),
    deck: deck,
    actionType: actionType.toString()
  });

  await context.db
    .insert(playerDeckCard)
    .values({
      id: cardEntityId,
      playerDeckId,
      deckAddress: deck,
      cardIndex: BigInt(cardId),
      actionType: BigInt(actionType),
      location: "hand",
      addedAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      deckAddress: deck,
      actionType: BigInt(actionType),
      location: "hand",
      updatedAt: event.block.timestamp,
    });
});

ponder.on("PlayerDeckManager:CardAddedToDiscardPile" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const cardId = event.args.cardId;
  const deck = event.args.deck.toLowerCase();
  const actionType = event.args.actionType;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;
  const cardEntityId = `${playerDeckId}-${cardId}`;

  console.log("CARD ADDED TO DISCARD PILE", {
    deckId: deckId.toString(),
    cardId: cardId.toString(),
    deck: deck,
    actionType: actionType.toString()
  });

  await context.db
    .insert(playerDeckCard)
    .values({
      id: cardEntityId,
      playerDeckId,
      deckAddress: deck,
      cardIndex: BigInt(cardId),
      actionType: BigInt(actionType),
      location: "discard",
      addedAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      deckAddress: deck,
      actionType: BigInt(actionType),
      location: "discard",
      updatedAt: event.block.timestamp,
    });
});

ponder.on("PlayerDeckManager:CardRemoved" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const cardId = event.args.cardId;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;
  const cardEntityId = `${playerDeckId}-${cardId}`;

  console.log("CARD REMOVED", {
    deckId: deckId.toString(),
    cardId: cardId.toString()
  });

  await context.db
    .insert(playerDeckCard)
    .values({
      id: cardEntityId,
      playerDeckId,
      deckAddress: "", // This needs to be populated from contract data
      cardIndex: BigInt(cardId),
      actionType: 0n, // This needs to be populated from contract data
      location: "removed",
      addedAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      location: "removed",
      updatedAt: event.block.timestamp,
    });
});

ponder.on("PlayerDeckManager:CardExhausted" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const cardId = event.args.cardId;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;
  const cardEntityId = `${playerDeckId}-${cardId}`;

  console.log("CARD EXHAUSTED", {
    deckId: deckId.toString(),
    cardId: cardId.toString()
  });

  await context.db
    .insert(playerDeckCard)
    .values({
      id: cardEntityId,
      playerDeckId,
      deckAddress: "", // This needs to be populated from contract data
      cardIndex: BigInt(cardId),
      actionType: 0n, // This needs to be populated from contract data
      location: "exhausted",
      addedAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      location: "exhausted",
      updatedAt: event.block.timestamp,
    });
});

ponder.on("PlayerDeckManager:ExhaustedCardsAddedToDrawPile" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const count = event.args.count;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;

  console.log("EXHAUSTED CARDS ADDED TO DRAW PILE", {
    deckId: deckId.toString(),
    count: count.toString()
  });

  // Update all exhausted cards to draw pile
  // Note: This would require fetching all exhausted cards for this deck
  // and updating their location to "draw"
  // Since we don't have the specific card IDs, we might need to track this differently
});

ponder.on("PlayerDeckManager:CardDrawn" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const cardId = event.args.cardId;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;
  const cardEntityId = `${playerDeckId}-${cardId}`;

  console.log("CARD DRAWN", {
    deckId: deckId.toString(),
    cardId: cardId.toString()
  });

  await context.db
    .insert(playerDeckCard)
    .values({
      id: cardEntityId,
      playerDeckId,
      deckAddress: "", // This needs to be populated from contract data
      cardIndex: BigInt(cardId),
      actionType: 0n, // This needs to be populated from contract data
      location: "hand",
      addedAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      location: "hand",
      updatedAt: event.block.timestamp,
    });
});

ponder.on("PlayerDeckManager:CardsDrawn" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const cardIds = event.args.cardIds;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;

  console.log("CARDS DRAWN", {
    deckId: deckId.toString(),
    cardIds: cardIds.map((id: any) => id.toString())
  });

  // Update multiple cards to hand
  for (const cardId of cardIds) {
    const cardEntityId = `${playerDeckId}-${cardId}`;
    
    await context.db
      .insert(playerDeckCard)
      .values({
        id: cardEntityId,
        playerDeckId,
        deckAddress: "", // This needs to be populated from contract data
        cardIndex: BigInt(cardId),
        actionType: 0n, // This needs to be populated from contract data
        location: "hand",
        addedAt: event.block.timestamp,
        updatedAt: event.block.timestamp,
      })
      .onConflictDoUpdate({
        location: "hand",
        updatedAt: event.block.timestamp,
      });
  }
});

ponder.on("PlayerDeckManager:CardDiscarded" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const cardId = event.args.cardId;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;
  const cardEntityId = `${playerDeckId}-${cardId}`;

  console.log("CARD DISCARDED", {
    deckId: deckId.toString(),
    cardId: cardId.toString()
  });

  await context.db
    .insert(playerDeckCard)
    .values({
      id: cardEntityId,
      playerDeckId,
      deckAddress: "", // This needs to be populated from contract data
      cardIndex: BigInt(cardId),
      actionType: 0n, // This needs to be populated from contract data
      location: "discard",
      addedAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      location: "discard",
      updatedAt: event.block.timestamp,
    });
});

ponder.on("PlayerDeckManager:HandDiscarded" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;

  console.log("HAND DISCARDED", {
    deckId: deckId.toString()
  });

  // Update all cards in hand to discard pile
  // Note: This would require fetching all cards in hand for this deck
  // and updating their location to "discard"
  // Since we don't have the specific card IDs, we might need to track this differently
});

ponder.on("PlayerDeckManager:HandDiscardedAndRedrawn" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  const drawnCards = event.args.drawnCards;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;

  console.log("HAND DISCARDED AND REDRAWN", {
    deckId: deckId.toString(),
    drawnCards: drawnCards.map((id: any) => id.toString())
  });

  // First discard the hand (we'd need to know which cards were in hand)
  // Then add the newly drawn cards to hand
  for (const cardId of drawnCards) {
    const cardEntityId = `${playerDeckId}-${cardId}`;
    
    await context.db
      .insert(playerDeckCard)
      .values({
        id: cardEntityId,
        playerDeckId,
        deckAddress: "", // This needs to be populated from contract data
        cardIndex: BigInt(cardId),
        actionType: 0n, // This needs to be populated from contract data
        location: "hand",
        addedAt: event.block.timestamp,
        updatedAt: event.block.timestamp,
      })
      .onConflictDoUpdate({
        location: "hand",
        updatedAt: event.block.timestamp,
      });
  }
});

ponder.on("PlayerDeckManager:DiscardReshuffledIntoDraw" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;

  console.log("DISCARD RESHUFFLED INTO DRAW", {
    deckId: deckId.toString()
  });

  // Update all cards in discard pile to draw pile
  // Note: This would require fetching all cards in discard for this deck
  // and updating their location to "draw"
  // Since we don't have the specific card IDs, we might need to track this differently
});

ponder.on("PlayerDeckManager:DeckReset" as any, async ({ event, context }: any) => {
  const playerDeckManagerAddress = event.log.address.toLowerCase();
  const deckId = event.args.deckId;
  
  const playerDeckId = `${playerDeckManagerAddress}-${deckId}`;

  console.log("DECK RESET", {
    deckId: deckId.toString()
  });

  // Reset all cards to initial state (likely all to draw pile)
  // Note: This would require fetching all cards for this deck
  // and resetting their location
  // Since we don't have the specific card IDs, we might need to track this differently
});