import { ponder } from "ponder:registry";
import { season, seasonAct, act, actRoom } from "ponder:schema";
import ActAbi from "../contracts/abis/Act.json";

// Season: OwnershipTransferred
ponder.on("Season:OwnershipTransferred" as any, async ({ event, context }: any) => {
  await context.db
    .insert(season)
    .values({
      address: event.log.address.toLowerCase(),
      name: "", // Will be updated by onConflictDoUpdate
      owner: event.args.newOwner.toLowerCase(),
      trustedForwarder: "",
      operator: "",
      currentActIndex: 0n,
      createdAt: event.block.timestamp
    })
    .onConflictDoUpdate({
      owner: event.args.newOwner.toLowerCase(),
    });
});

// Season: SeasonCreated
ponder.on("Season:SeasonCreated" as any, async ({ event, context }: any) => {
  console.log("SEASON CREATED", {
    address: event.log.address.toLowerCase(),
    name: event.args.name,
    owner: event.args.owner.toLowerCase(),
    operator: event.args.operator.toLowerCase()
  });

  await context.db
    .insert(season)
    .values({
      address: event.log.address.toLowerCase(),
      name: event.args.name || "",
      trustedForwarder: event.args.trustedForwarder.toLowerCase(),
      owner: event.args.owner.toLowerCase(),
      operator: event.args.operator.toLowerCase(),
      currentActIndex: 0n,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      name: event.args.name || "",
      owner: event.args.owner.toLowerCase(),
      trustedForwarder: event.args.trustedForwarder.toLowerCase(),
      operator: event.args.operator.toLowerCase(),
    });
});

// Season: ActAdded
ponder.on("Season:ActAdded" as any, async ({ event, context }: any) => {
  
  // Read all required fields from the Act contract using multicall
  const actAddress = event.args.act as `0x${string}`;
  const actIndex = event.args.index;
  
  const [
    trustedForwarder,
    owner,
    operator,
    rngSeed,
    rootRoomId,
    battleFactory,
    deckConfiguration,
    monsterRegistry,
    playerDeckManager,
    maxDepth,
    turnDuration
  ] = await context.client.multicall({
    multicallAddress: "0xca11bde05977b3631167028862be2a173976ca11",
    contracts: [
      { address: actAddress, abi: ActAbi, functionName: 'trustedForwarder' },
      { address: actAddress, abi: ActAbi, functionName: 'owner' },
      { address: actAddress, abi: ActAbi, functionName: 'operator' },
      { address: actAddress, abi: ActAbi, functionName: 'rngSeed' },
      { address: actAddress, abi: ActAbi, functionName: 'ROOT_ROOM_ID' },
      { address: actAddress, abi: ActAbi, functionName: 'battleFactory' },
      { address: actAddress, abi: ActAbi, functionName: 'deckConfiguration' },
      { address: actAddress, abi: ActAbi, functionName: 'monsterRegistry' },
      { address: actAddress, abi: ActAbi, functionName: 'playerDeckManager' },
      { address: actAddress, abi: ActAbi, functionName: 'maxDepth' },
      { address: actAddress, abi: ActAbi, functionName: 'TURN_DURATION' }
    ]
  });

  // Create the Act record
  await context.db.insert(act).values({
    address: actAddress.toLowerCase(),
    trustedForwarder: trustedForwarder.result?.toLowerCase() || '',
    owner: owner.result?.toLowerCase() || '',
    operator: operator.result?.toLowerCase() || '',
    rngSeed: rngSeed.result || '',
    rootRoomId: BigInt(rootRoomId.result || 0),
    battleFactory: battleFactory.result?.toLowerCase() || '',
    deckConfiguration: deckConfiguration.result?.toLowerCase() || '',
    monsterRegistry: monsterRegistry.result?.toLowerCase() || '',
    playerDeckManager: playerDeckManager.result?.toLowerCase() || '',
    maxDepth: BigInt(maxDepth.result || 0),
    turnDuration: turnDuration.result || 0n,
    isClosed: false,
    createdAt: event.block.timestamp,
  });

  // Create season-act relation
  await context.db.insert(seasonAct).values({
    id: `${event.log.address.toLowerCase()}-${actIndex.toString()}`,
    seasonAddress: event.log.address.toLowerCase(),
    actIndex: actIndex,
    actAddress: actAddress.toLowerCase(),
    createdAt: event.block.timestamp,
  });

  // Update the current act index in the season
  await context.db
    .insert(season)
    .values({
      address: event.log.address.toLowerCase(),
      name: "", // Will be updated by onConflictDoUpdate
      trustedForwarder: "",
      owner: "",
      operator: "",
      currentActIndex: actIndex,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      currentActIndex: actIndex,
    });
});

// Season: ActRemoved
ponder.on("Season:ActRemoved" as any, async ({ event, context }: any) => {
  // We don't delete the act from the database, but we could mark it as removed if needed
  console.log("ACT REMOVED", {
    seasonAddress: event.log.address.toLowerCase(),
    actIndex: event.args.index
  });
});

// Season: OperatorTransferred
ponder.on("Season:OperatorTransferred" as any, async ({ event, context }: any) => {
  await context.db
    .insert(season)
    .values({
      address: event.log.address.toLowerCase(),
      name: "", // Will be updated by onConflictDoUpdate
      trustedForwarder: "",
      owner: "",
      operator: event.args.newOperator.toLowerCase(),
      currentActIndex: 0n,
      createdAt: event.block.timestamp
    })
    .onConflictDoUpdate({
      operator: event.args.newOperator.toLowerCase()
    });
}); 