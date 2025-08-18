import { ponder } from "ponder:registry";
import { monster, character, monsterCard } from "ponder:schema";
import MonsterRegistryAbi from "../contracts/abis/MonsterRegistry.json";

// MonsterRegistry: MonsterAdded
ponder.on("MonsterRegistry:MonsterAdded" as any, async ({ event, context }: any) => {
  const characterAddress = event.args.character.toLowerCase();
  const stats = event.args.stats;
  const monsterId = event.args.id;
  
  console.log("MONSTER ADDED", {
    character: characterAddress,
    id: monsterId.toString(),
    health: stats.health.toString(),
    cardsCount: stats.cards ? stats.cards.length : 0
  });

  // Check if character entity already exists
  const existingCharacter = await context.db.find(character, { id: characterAddress });
  
  if (!existingCharacter) {
    // Create character entity for the monster if it doesn't exist
    await context.db
      .insert(character)
      .values({
        id: characterAddress,
        owner: "", // Monsters typically don't have owners
        operator: "", // Will be set if there's an operator
        name: "", // Monster names might not be available initially
        createdAt: event.block.timestamp,
      });
  }

  // Create monster entity
  await context.db
    .insert(monster)
    .values({
      id: characterAddress,
      characterAddress: characterAddress,
      index: BigInt(monsterId),
      health: BigInt(stats.health),
      registeredAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      index: BigInt(monsterId),
      health: BigInt(stats.health),
      registeredAt: event.block.timestamp,
    });

  // Process monster cards if they exist
  if (stats.cards && Array.isArray(stats.cards)) {
    for (let i = 0; i < stats.cards.length; i++) {
      const card = stats.cards[i];
      const cardId = `${characterAddress}-${i}`;
      
      // Store action types as JSON string
      const actionTypesJson = card.actionTypes 
        ? JSON.stringify(card.actionTypes.map((t: any) => Number(t)))
        : "[]";
      
      await context.db
        .insert(monsterCard)
        .values({
          id: cardId,
          characterAddress: characterAddress,
          cardIndex: BigInt(i),
          deck: card.deck ? card.deck.toLowerCase() : "",
          actionTypes: actionTypesJson,
          registeredAt: event.block.timestamp,
        })
        .onConflictDoUpdate({
          deck: card.deck ? card.deck.toLowerCase() : "",
          actionTypes: actionTypesJson,
          registeredAt: event.block.timestamp,
        });
    }
  }
});