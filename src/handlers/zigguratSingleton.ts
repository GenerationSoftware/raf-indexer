import { ponder } from "ponder:registry";
import { zigguratSingleton, ziggurat, zigguratRoom } from "ponder:schema";
import ZigguratAbi from "../contracts/abis/Ziggurat.json";

// ZigguratSingleton: OwnershipTransferred
ponder.on("ZigguratSingleton:OwnershipTransferred", async ({ event, context }) => {
  await context.db
    .insert(zigguratSingleton)
    .values({
      address: event.log.address.toLowerCase(),
      owner: event.args.newOwner.toLowerCase(),
      createdAt: event.block.timestamp
    })
    .onConflictDoUpdate({
      owner: event.args.newOwner.toLowerCase(),
    });
});

// ZigguratSingleton: ZigguratSingletonCreated
ponder.on("ZigguratSingleton:ZigguratSingletonCreated", async ({ event, context }) => {
  await context.db
    .insert(zigguratSingleton)
    .values({
      address: event.log.address.toLowerCase(),
      trustedForwarder: event.args.trustedForwarder.toLowerCase(),
      owner: event.args.owner.toLowerCase(),
      operator: event.args.operator.toLowerCase(),
      zigguratDuration: event.args.zigguratDuration,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      owner: event.args.owner.toLowerCase(),
      trustedForwarder: event.args.trustedForwarder.toLowerCase(),
      operator: event.args.operator.toLowerCase(),
      zigguratDuration: event.args.zigguratDuration,
    });
});

// ZigguratSingleton: ZigguratDurationSet
ponder.on("ZigguratSingleton:ZigguratDurationSet", async ({ event, context }) => {
  await context.db
    .insert(zigguratSingleton)
    .values({
      address: event.log.address.toLowerCase(),
      zigguratDuration: event.args.zigguratDuration,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      zigguratDuration: event.args.zigguratDuration,
    });
});

// ZigguratSingleton: ZigguratSet
ponder.on("ZigguratSingleton:ZigguratSet", async ({ event, context }) => {
  
  // Read all required fields from the Ziggurat contract using multicall
  const zigguratAddress = event.args.ziggurat as `0x${string}`;
  const [
    trustedForwarder,
    owner,
    operator,
    rngSeed,
    rootRoomHash,
    readyAimFireFactory,
    deckConfiguration,
    monsterRegistry,
    maxDoorCount,
    monsterSigma,
    turnDuration
  ] = await context.client.multicall({
    multicallAddress: "0xca11bde05977b3631167028862be2a173976ca11",
    contracts: [
      { address: zigguratAddress, abi: ZigguratAbi, functionName: 'trustedForwarder' },
      { address: zigguratAddress, abi: ZigguratAbi, functionName: 'owner' },
      { address: zigguratAddress, abi: ZigguratAbi, functionName: 'operator' },
      { address: zigguratAddress, abi: ZigguratAbi, functionName: 'rngSeed' },
      { address: zigguratAddress, abi: ZigguratAbi, functionName: 'rootRoomHash' },
      { address: zigguratAddress, abi: ZigguratAbi, functionName: 'readyAimFireFactory' },
      { address: zigguratAddress, abi: ZigguratAbi, functionName: 'deckConfiguration' },
      { address: zigguratAddress, abi: ZigguratAbi, functionName: 'monsterRegistry' },
      { address: zigguratAddress, abi: ZigguratAbi, functionName: 'MAX_DOOR_COUNT' },
      { address: zigguratAddress, abi: ZigguratAbi, functionName: 'MONSTER_SIGMA' },
      { address: zigguratAddress, abi: ZigguratAbi, functionName: 'TURN_DURATION' }
    ]
  });

  await context.db.insert(ziggurat).values({
    address: zigguratAddress.toLowerCase(),
    trustedForwarder: trustedForwarder.result?.toLowerCase() || '',
    owner: owner.result?.toLowerCase() || '',
    operator: operator.result?.toLowerCase() || '',
    rngSeed: rngSeed.result || '',
    rootRoomHash: rootRoomHash.result?.toLowerCase() || '',
    isClosed: false,
    readyAimFireFactory: readyAimFireFactory.result?.toLowerCase() || '',
    deckConfiguration: deckConfiguration.result?.toLowerCase() || '',
    monsterRegistry: monsterRegistry.result?.toLowerCase() || '',
    maxDoorCount: maxDoorCount.result || 0n,
    monsterSigma: monsterSigma.result || 0n,
    turnDuration: turnDuration.result || 0n,
    createdAt: event.block.timestamp,
  });

  // Create root room
  console.log("Creating root room with hash:", rootRoomHash.result);
  await context.db.insert(zigguratRoom).values({
    id: rootRoomHash.result?.toLowerCase() || '',
    zigguratAddress: zigguratAddress.toLowerCase(),
    roomHash: rootRoomHash.result?.toLowerCase() || '',
    parentRoomHash: "",
    parentRoomId: "",
    parentDoorIndex: 0n,
    revealedAt: event.block.timestamp,
    roomType: 0n, // Root room type
    numberOfDoors: 1n, // Root room has 1 door
    depth: 0n, // Root is depth 0
    battle: "",
  });
  
  await context.db
    .insert(zigguratSingleton)
    .values({
      address: event.log.address.toLowerCase(),
      ziggurat: event.args.ziggurat.toLowerCase(),
      lastSetAt: event.block.timestamp,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      ziggurat: event.args.ziggurat.toLowerCase(),
      lastSetAt: event.block.timestamp,
    });
});

// ZigguratSingleton: OperatorTransferred
ponder.on("ZigguratSingleton:OperatorTransferred", async ({ event, context }) => {
  await context.db
    .insert(zigguratSingleton)
    .values({
      address: event.log.address.toLowerCase(),
      operator: event.args.newOperator.toLowerCase()
    })
    .onConflictDoUpdate({
      operator: event.args.newOperator.toLowerCase()
    });
}); 