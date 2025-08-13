import { ponder } from "ponder:registry";
import { act, party, partyMember } from "ponder:schema";
import ActAbi from "../contracts/abis/Act.json";

// Act: PartyCreatedEvent
ponder.on("Act:PartyCreatedEvent" as any, async ({ event, context }: any) => {
  console.log("PARTY CREATED", {
    partyId: event.args.partyId.toString(),
    leader: event.args.leader.toLowerCase(),
    isPublic: event.args.isPublic,
    inviter: event.args.inviter.toLowerCase(),
    actAddress: event.log.address.toLowerCase()
  });
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      actAddress: event.log.address.toLowerCase(),
      partyId: event.args.partyId.toString(),
      leader: event.args.leader.toLowerCase(),
      isPublic: event.args.isPublic,
      inviter: event.args.inviter.toLowerCase(),
      roomHash: "", // Default empty - will be set when party enters a room
      battleAddress: "", // Default empty - will be set when party enters a room
      state: BigInt(0), // CREATED
      chosenDoor: BigInt(0), // Default 0 - no door chosen yet
      createdTxHash: event.transaction.hash,
      createdAt: event.block.timestamp,
      startedAt: BigInt(0),
      endedAt: BigInt(0),
    })
    .onConflictDoUpdate({
      leader: event.args.leader.toLowerCase(),
      isPublic: event.args.isPublic,
      inviter: event.args.inviter.toLowerCase(),
    });
});

// Act: PartyMemberJoinedEvent
ponder.on("Act:PartyMemberJoinedEvent" as any, async ({ event, context }: any) => {
  await context.db
    .insert(partyMember)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString() + "-" + event.args.character.toLowerCase(),
      partyId: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      characterId: event.args.character.toLowerCase(),
      joinedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      characterId: event.args.character.toLowerCase(),
      joinedAt: event.block.timestamp,
    });
});

// Act: PartyStartedEvent
ponder.on("Act:PartyStartedEvent" as any, async ({ event, context }: any) => {
  // Get the room hash for this party from the contract
  let roomHash = "";
  try {
    const roomHashResult = await context.client.readContract({
      address: event.log.address as `0x${string}`,
      abi: ActAbi,
      functionName: "lastRoomHash",
      args: [event.args.partyId]
    });
    roomHash = roomHashResult?.toLowerCase() || "";
    console.log("PARTY STARTED - Room Hash", {
      partyId: event.args.partyId.toString(),
      roomHash: roomHash
    });
  } catch (error) {
    console.log("Failed to read party room hash:", error);
  }

  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      actAddress: event.log.address.toLowerCase(),
      partyId: event.args.partyId.toString(),
      leader: "", // Will be updated by onConflictDoUpdate
      isPublic: false, // Will be updated by onConflictDoUpdate
      inviter: "", // Will be updated by onConflictDoUpdate
      roomHash: roomHash,
      battleAddress: "", // Will be updated by onConflictDoUpdate
      state: BigInt(1), // DOOR_CHOSEN
      chosenDoor: BigInt(0), // Will be updated by onConflictDoUpdate
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: event.block.timestamp,
      endedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      roomHash: roomHash,
      state: BigInt(1), // DOOR_CHOSEN
      startedAt: event.block.timestamp,
    });
});


// Act: NextRoomChosenEvent
ponder.on("Act:NextRoomChosenEvent" as any, async ({ event, context }: any) => {
  // Get the room hash for this party from the contract
  let roomHash = "";
  try {
    const roomHashResult = await context.client.readContract({
      address: event.log.address as `0x${string}`,
      abi: ActAbi,
      functionName: "lastRoomHash",
      args: [event.args.partyId]
    });
    roomHash = roomHashResult?.toLowerCase() || "";
    console.log("NEXT ROOM CHOSEN - Room Hash", {
      partyId: event.args.partyId.toString(),
      doorIndex: event.args.doorIndex.toString(),
      roomHash: roomHash
    });
  } catch (error) {
    console.log("Failed to read party room hash:", error);
  }

  // Update the party to mark that a door has been chosen
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      actAddress: event.log.address.toLowerCase(),
      partyId: event.args.partyId.toString(),
      leader: "", // Will be updated by onConflictDoUpdate
      isPublic: false, // Will be updated by onConflictDoUpdate
      inviter: "", // Will be updated by onConflictDoUpdate
      roomHash: roomHash,
      battleAddress: "", // Will be updated by onConflictDoUpdate
      state: BigInt(1), // DOOR_CHOSEN
      chosenDoor: event.args.doorIndex,
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: BigInt(0), // Will be updated by onConflictDoUpdate
      endedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      roomHash: roomHash,
      state: BigInt(1), // DOOR_CHOSEN
      chosenDoor: event.args.doorIndex,
    });
});

// Act: PartyEndedEvent  
ponder.on("Act:PartyEndedEvent" as any, async ({ event, context }: any) => {
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      actAddress: event.log.address.toLowerCase(),
      partyId: event.args.partyId.toString(),
      leader: "", // Will be updated by onConflictDoUpdate
      isPublic: false, // Will be updated by onConflictDoUpdate
      inviter: "", // Will be updated by onConflictDoUpdate
      roomHash: "", // Will be updated by onConflictDoUpdate
      battleAddress: "", // Will be updated by onConflictDoUpdate
      state: BigInt(3), // ESCAPED
      chosenDoor: BigInt(0), // Will be updated by onConflictDoUpdate
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: BigInt(0), // Will be updated by onConflictDoUpdate
      endedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      state: BigInt(3), // ESCAPED
      endedAt: event.block.timestamp,
    });
});

// Act: PartyCancelledEvent
ponder.on("Act:PartyCancelledEvent" as any, async ({ event, context }: any) => {
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      actAddress: event.log.address.toLowerCase(),
      partyId: event.args.partyId.toString(),
      leader: "", // Will be updated by onConflictDoUpdate
      isPublic: false, // Will be updated by onConflictDoUpdate
      inviter: "", // Will be updated by onConflictDoUpdate
      roomHash: "", // Will be updated by onConflictDoUpdate
      battleAddress: "", // Will be updated by onConflictDoUpdate
      state: BigInt(4), // CANCELLED
      chosenDoor: BigInt(0), // Will be updated by onConflictDoUpdate
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: BigInt(0), // Will be updated by onConflictDoUpdate
      endedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      state: BigInt(4), // CANCELLED
    });
});


// Act: RoomEnteredEvent
ponder.on("Act:RoomEnteredEvent" as any, async ({ event, context }: any) => {
  // Get the battle address for this party from the contract
  let battleAddress = "";
  try {
    const battleResult = await context.client.readContract({
      address: event.log.address as `0x${string}`,
      abi: ActAbi,
      functionName: "partyBattles",
      args: [event.args.partyId, event.args.roomHash]
    });
    battleAddress = battleResult?.toLowerCase() || "";
    console.log("PARTY BATTLE ADDRESS", {
      partyId: event.args.partyId.toString(),
      battleAddress: battleAddress
    });
  } catch (error) {
    console.log("Failed to read party battle address:", error);
  }

  // Update the party's current room location and set state to IN_ROOM
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      actAddress: event.log.address.toLowerCase(),
      partyId: event.args.partyId.toString(),
      leader: "", // Will be updated by onConflictDoUpdate
      isPublic: false, // Will be updated by onConflictDoUpdate
      inviter: "", // Will be updated by onConflictDoUpdate
      roomHash: event.args.roomHash.toLowerCase(),
      battleAddress: battleAddress,
      state: BigInt(2), // IN_ROOM
      chosenDoor: BigInt(0), // Reset when entering new room
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: BigInt(0), // Will be updated by onConflictDoUpdate
      endedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      roomHash: event.args.roomHash.toLowerCase(),
      battleAddress: battleAddress,
      state: BigInt(2), // IN_ROOM
      chosenDoor: BigInt(0), // Reset when entering new room
    });
});

// Act: ActClosedEvent
ponder.on("Act:ActClosedEvent" as any, async ({ event, context }: any) => {
  // Update the act to mark it as closed
  await context.db
    .insert(act)
    .values({
      address: event.log.address.toLowerCase(),
      trustedForwarder: "", // Will be updated by onConflictDoUpdate
      owner: "", // Will be updated by onConflictDoUpdate
      operator: "", // Will be updated by onConflictDoUpdate
      rngSeed: "", // Will be updated by onConflictDoUpdate
      rootRoomHash: "",
      readyAimFireFactory: "", // Will be updated by onConflictDoUpdate
      deckConfiguration: "", // Will be updated by onConflictDoUpdate
      monsterRegistry: "", // Will be updated by onConflictDoUpdate
      maxDoorCount: BigInt(0), // Will be updated by onConflictDoUpdate
      monsterSigma: BigInt(0), // Will be updated by onConflictDoUpdate
      turnDuration: BigInt(0), // Will be updated by onConflictDoUpdate
      isClosed: true,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      isClosed: true,
    });
});

// Act: OperatorTransferred
ponder.on("Act:OperatorTransferred" as any, async ({ event, context }: any) => {
  console.log("ACT OPERATOR TRANSFERRED", {
    contractAddress: event.log.address.toLowerCase(),
    previousOperator: event.args.previousOperator.toLowerCase(),
    newOperator: event.args.newOperator.toLowerCase()
  });

  await context.db
    .insert(act)
    .values({
      address: event.log.address.toLowerCase(),
      trustedForwarder: "",
      owner: "",
      operator: event.args.newOperator.toLowerCase(),
      rngSeed: "",
      rootRoomHash: "",
      readyAimFireFactory: "",
      deckConfiguration: "",
      monsterRegistry: "",
      maxDoorCount: BigInt(0),
      monsterSigma: BigInt(0),
      turnDuration: BigInt(0),
      isClosed: false,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      operator: event.args.newOperator.toLowerCase(),
    });
});

// Act: OwnershipTransferred
ponder.on("Act:OwnershipTransferred" as any, async ({ event, context }: any) => {
  console.log("ACT OWNERSHIP TRANSFERRED", {
    contractAddress: event.log.address.toLowerCase(),
    previousOwner: event.args.previousOwner.toLowerCase(),
    newOwner: event.args.newOwner.toLowerCase()
  });

  await context.db
    .insert(act)
    .values({
      address: event.log.address.toLowerCase(),
      trustedForwarder: "",
      owner: event.args.newOwner.toLowerCase(),
      operator: "",
      rngSeed: "",
      rootRoomHash: "",
      readyAimFireFactory: "",
      deckConfiguration: "",
      monsterRegistry: "",
      maxDoorCount: BigInt(0),
      monsterSigma: BigInt(0),
      turnDuration: BigInt(0),
      isClosed: false,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      owner: event.args.newOwner.toLowerCase(),
    });
});
