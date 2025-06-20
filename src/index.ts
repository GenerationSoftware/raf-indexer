import { ponder } from "ponder:registry";

// Ziggurat contract creation - capture constructor parameters
// Note: Constructor events might not work in Ponder, so we'll use a different approach
ponder.on("Ziggurat:constructor", async ({ event, context }) => {
  console.log("Ziggurat constructor event received:", event);
  
  const { trustedForwarder, operator, rngSeed, readyAimFireFactory, deckConfiguration, monsterRegistry } = event.args;
  
  await context.db.ziggurat.create({
    id: event.log.address.toLowerCase(),
    data: {
      trustedForwarder: trustedForwarder.toLowerCase(),
      operator: operator.toLowerCase(),
      rngSeed: rngSeed,
      readyAimFireFactory: readyAimFireFactory.toLowerCase(),
      deckConfiguration: deckConfiguration.toLowerCase(),
      monsterRegistry: monsterRegistry.toLowerCase(),
      maxDoorCount: 0n, // Will be set from contract calls
      monsterSigma: 0n, // Will be set from contract calls
      turnDuration: 0n, // Will be set from contract calls
      createdAt: event.block.timestamp,
    },
  });
});

// Alternative approach: Create ziggurat record on first event
ponder.on("Ziggurat:PartyCreatedEvent", async ({ event, context }) => {
  console.log("Ziggurat PartyCreatedEvent received:", event);
  
  // Check if ziggurat record exists, if not create it
  const existingZiggurat = await context.db.ziggurat.findUnique({
    where: { id: event.log.address.toLowerCase() },
  });
  
  if (!existingZiggurat) {
    // Create a basic ziggurat record since we can't get constructor params from events
    await context.db.ziggurat.create({
      id: event.log.address.toLowerCase(),
      data: {
        trustedForwarder: "",
        operator: "",
        rngSeed: "",
        readyAimFireFactory: "",
        deckConfiguration: "",
        monsterRegistry: "",
        maxDoorCount: 0n,
        monsterSigma: 0n,
        turnDuration: 0n,
        createdAt: event.block.timestamp,
      },
    });
  }
  
  // Handle the party creation
  const { partyId, character, inviter, isPublic } = event.args;
  
  await context.db.zigguratParty.create({
    id: partyId.toString(),
    data: {
      character: character.toLowerCase(),
      inviter: inviter.toLowerCase(),
      isPublic,
      createdAt: event.block.timestamp,
      endedAt: 0n,
    },
  });
});

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