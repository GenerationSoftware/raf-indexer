import { ponder } from "ponder:registry";
import { character } from "ponder:schema";

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