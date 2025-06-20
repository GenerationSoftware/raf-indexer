import { ponder } from "ponder:registry";
import { character } from "ponder:schema";

// Character: OwnershipTransferred
ponder.on("Character:OwnershipTransferred", async ({ event, context }) => {
  await context.db
    .insert(character)
    .values({
      id: event.log.address.toLowerCase(),
      owner: event.args.newOwner.toLowerCase(),
      operator: "",
      name: "",
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      set: {
        owner: event.args.newOwner.toLowerCase(),
      },
    });
});

// Character: OperatorTransferred
ponder.on("Character:OperatorTransferred", async ({ event, context }) => {
  await context.db
    .insert(character)
    .values({
      id: event.log.address.toLowerCase(),
      owner: "",
      operator: event.args.newOperator.toLowerCase(),
      name: "",
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      set: {
        operator: event.args.newOperator.toLowerCase(),
      },
    });
}); 