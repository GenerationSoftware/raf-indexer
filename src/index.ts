import { ponder } from "ponder:registry";

// Character events - simple logging first
ponder.on("Character:OwnershipTransferred", async ({ event, context }) => {
  console.log("Character OwnershipTransferred event:", {
    address: event.log.address,
    previousOwner: event.args.previousOwner,
    newOwner: event.args.newOwner,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
  
  // Log available database tables
  console.log("Available database tables:", Object.keys(context.db));
});

ponder.on("Character:OperatorTransferred", async ({ event, context }) => {
  console.log("Character OperatorTransferred event:", {
    address: event.log.address,
    newOperator: event.args.newOperator,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
});

// BasicDeck events
ponder.on("BasicDeck:Transfer", async ({ event, context }) => {
  console.log("BasicDeck Transfer event:", {
    address: event.log.address,
    from: event.args.from,
    to: event.args.to,
    tokenId: event.args.tokenId,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
});

ponder.on("BasicDeck:BaseUriSet", async ({ event, context }) => {
  console.log("BasicDeck BaseUriSet event:", {
    address: event.log.address,
    uri: event.args.uri,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
}); 