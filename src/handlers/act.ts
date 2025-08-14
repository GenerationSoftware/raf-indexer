import { ponder } from "ponder:registry";
import { act, party, partyMember, actRoom, actRoomConnection } from "ponder:schema";
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
      roomId: BigInt(0), // Default 0 - will be set when party enters a room
      battleAddress: "", // Default empty - will be set when party enters a room
      state: BigInt(0), // CREATED
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
  // Get the room id for this party from the contract
  let roomId = BigInt(0);
  try {
    const roomIdResult = await context.client.readContract({
      address: event.log.address as `0x${string}`,
      abi: ActAbi,
      functionName: "lastRoomId",
      args: [event.args.partyId]
    });
    roomId = BigInt(roomIdResult || 0);
    console.log("PARTY STARTED - Room ID", {
      partyId: event.args.partyId.toString(),
      roomId: roomId.toString()
    });
  } catch (error) {
    console.log("Failed to read party room id:", error);
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
      roomId: roomId,
      battleAddress: "", // Will be updated by onConflictDoUpdate
      state: BigInt(1), // ROOM_CHOSEN
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: event.block.timestamp,
      endedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      roomId: roomId,
      state: BigInt(1), // ROOM_CHOSEN
      startedAt: event.block.timestamp,
    });
});


// Act: NextRoomChosenEvent
ponder.on("Act:NextRoomChosenEvent" as any, async ({ event, context }: any) => {
  // The new event signature includes the roomId directly
  const roomId = BigInt(event.args.roomId || 0);
  console.log("NEXT ROOM CHOSEN", {
    partyId: event.args.partyId.toString(),
    roomId: roomId.toString()
  });

  // Update the party to mark that a room has been chosen
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      actAddress: event.log.address.toLowerCase(),
      partyId: event.args.partyId.toString(),
      leader: "", // Will be updated by onConflictDoUpdate
      isPublic: false, // Will be updated by onConflictDoUpdate
      inviter: "", // Will be updated by onConflictDoUpdate
      roomId: roomId,
      battleAddress: "", // Will be updated by onConflictDoUpdate
      state: BigInt(1), // ROOM_CHOSEN
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: BigInt(0), // Will be updated by onConflictDoUpdate
      endedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      roomId: roomId,
      state: BigInt(1), // ROOM_CHOSEN
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
      roomId: BigInt(0), // Will be updated by onConflictDoUpdate
      battleAddress: "", // Will be updated by onConflictDoUpdate
      state: BigInt(3), // ESCAPED
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
      roomId: BigInt(0), // Will be updated by onConflictDoUpdate
      battleAddress: "", // Will be updated by onConflictDoUpdate
      state: BigInt(4), // CANCELLED
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
  const roomId = BigInt(event.args.roomId || 0);
  const room = event.args.room;
  const actAddress = event.log.address.toLowerCase();
  
  console.log("ROOM ENTERED", {
    partyId: event.args.partyId.toString(),
    roomId: roomId.toString(),
    roomType: room.roomType,
    monsterIndex1: room.monsterIndex1,
    monsterIndex2: room.monsterIndex2,
    monsterIndex3: room.monsterIndex3,
    nextRooms: room.nextRooms
  });

  // Create the actRoom entity
  const currentRoomFullId = actAddress + "-" + roomId.toString();
  await context.db
    .insert(actRoom)
    .values({
      id: currentRoomFullId,
      actAddress: actAddress,
      roomId: roomId,
      roomType: BigInt(room.roomType),
      monsterIndex1: room.monsterIndex1 ? BigInt(room.monsterIndex1) : BigInt(0),
      monsterIndex2: room.monsterIndex2 ? BigInt(room.monsterIndex2) : BigInt(0),
      monsterIndex3: room.monsterIndex3 ? BigInt(room.monsterIndex3) : BigInt(0),
      revealedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      roomType: BigInt(room.roomType),
      monsterIndex1: room.monsterIndex1 ? BigInt(room.monsterIndex1) : BigInt(0),
      monsterIndex2: room.monsterIndex2 ? BigInt(room.monsterIndex2) : BigInt(0),
      monsterIndex3: room.monsterIndex3 ? BigInt(room.monsterIndex3) : BigInt(0),
      revealedAt: event.block.timestamp,
    });

  // Create room connections for the graph structure
  if (room.nextRooms && Array.isArray(room.nextRooms)) {
    for (let i = 0; i < room.nextRooms.length; i++) {
      const nextRoomId = room.nextRooms[i];
      if (nextRoomId && nextRoomId > 0) { // Skip empty/zero room IDs
        const nextRoomFullId = actAddress + "-" + nextRoomId.toString();
        const connectionId = currentRoomFullId + "-" + nextRoomFullId + "-" + i.toString();
        
        await context.db
          .insert(actRoomConnection)
          .values({
            id: connectionId,
            actAddress: actAddress,
            fromRoomId: currentRoomFullId,
            toRoomId: nextRoomFullId,
            slotIndex: BigInt(i),
          })
          .onConflictDoUpdate({
            // Connection shouldn't change once created
            slotIndex: BigInt(i),
          });
      }
    }
  }

  // Update the party's current room location and set state to IN_ROOM
  await context.db
    .insert(party)
    .values({
      id: actAddress + "-" + event.args.partyId.toString(),
      actAddress: actAddress,
      partyId: event.args.partyId.toString(),
      leader: "", // Will be updated by onConflictDoUpdate
      isPublic: false, // Will be updated by onConflictDoUpdate
      inviter: "", // Will be updated by onConflictDoUpdate
      roomId: roomId,
      battleAddress: "", // Will be set by BattleRoom:BattleCreated event
      state: BigInt(2), // IN_ROOM
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: BigInt(0), // Will be updated by onConflictDoUpdate
      endedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      roomId: roomId,
      state: BigInt(2), // IN_ROOM
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
      startingRoomId: BigInt(0),
      battleFactory: "",
      playerDeckManager: "",
      maxDepth: BigInt(0),
      battleFactory: "", // Will be updated by onConflictDoUpdate
      deckConfiguration: "", // Will be updated by onConflictDoUpdate
      monsterRegistry: "", // Will be updated by onConflictDoUpdate
      playerDeckManager: "", // Will be updated by onConflictDoUpdate
      maxDepth: BigInt(0), // Will be updated by onConflictDoUpdate
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
      startingRoomId: BigInt(0),
      battleFactory: "",
      playerDeckManager: "",
      maxDepth: BigInt(0),
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
      startingRoomId: BigInt(0),
      battleFactory: "",
      playerDeckManager: "",
      maxDepth: BigInt(0),
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
