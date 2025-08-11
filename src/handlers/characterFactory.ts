import { ponder } from "ponder:registry";
import { character } from "ponder:schema";

// CharacterFactory: CharacterCreated
ponder.on("CharacterFactory:CharacterCreated" as any, async ({ event, context }: any) => {

  await context.db
    .insert(character)
    .values({
      id: event.args.character.toLowerCase(),
      owner: event.args.owner.toLowerCase(),
      operator: event.args.operator.toLowerCase(),
      name: event.args.name,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      owner: event.args.owner.toLowerCase(),
      operator: event.args.operator.toLowerCase(),
      name: event.args.name,
    });

});