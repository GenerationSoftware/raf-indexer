import { ponder } from "ponder:registry";
import { deckConfiguration } from "ponder:schema";

// DeckConfiguration: OperatorTransferred
ponder.on("DeckConfiguration:OperatorTransferred" as any, async ({ event, context }: any) => {
  console.log("DECK CONFIGURATION OPERATOR TRANSFERRED", {
    contractAddress: event.log.address.toLowerCase(),
    previousOperator: event.args.previousOperator.toLowerCase(),
    newOperator: event.args.newOperator.toLowerCase()
  });

  const contractAddress = event.log.address.toLowerCase();

  // Update the deck configuration's operator
  await context.db
    .insert(deckConfiguration)
    .values({
      id: contractAddress,
      trustedForwarder: "",
      owner: "",
      operator: event.args.newOperator.toLowerCase(),
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      operator: event.args.newOperator.toLowerCase(),
    });
});

// DeckConfiguration: OwnershipTransferred
ponder.on("DeckConfiguration:OwnershipTransferred" as any, async ({ event, context }: any) => {
  console.log("DECK CONFIGURATION OWNERSHIP TRANSFERRED", {
    contractAddress: event.log.address.toLowerCase(),
    previousOwner: event.args.previousOwner.toLowerCase(),
    newOwner: event.args.newOwner.toLowerCase()
  });

  const contractAddress = event.log.address.toLowerCase();

  // Update the deck configuration's owner
  await context.db
    .insert(deckConfiguration)
    .values({
      id: contractAddress,
      trustedForwarder: "",
      owner: event.args.newOwner.toLowerCase(),
      operator: "",
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      owner: event.args.newOwner.toLowerCase(),
    });
});