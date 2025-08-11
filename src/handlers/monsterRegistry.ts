import { ponder } from "ponder:registry";
import { monster, character } from "ponder:schema";
import MonsterRegistryAbi from "../contracts/abis/MonsterRegistry.json";

// MonsterRegistry: MonsterAdded
ponder.on("MonsterRegistry:MonsterAdded" as any, async ({ event, context }: any) => {
  console.log("MONSTER ADDED", {
    character: event.args.character.toLowerCase(),
    health: event.args.stats.health.toString()
  });

  // Check if character entity already exists
  const existingCharacter = await context.db.find(character, { id: event.args.character.toLowerCase() });
  
  if (!existingCharacter) {
    // Create character entity for the monster if it doesn't exist
    await context.db
      .insert(character)
      .values({
        id: event.args.character.toLowerCase(),
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
      id: event.args.character.toLowerCase(),
      characterAddress: event.args.character.toLowerCase(),
      health: event.args.stats.health,
      registeredAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      health: event.args.stats.health,
      registeredAt: event.block.timestamp,
    });
});