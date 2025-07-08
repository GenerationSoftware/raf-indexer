import { ponder } from "ponder:registry";
import { ziggurat, party, partyMember, zigguratRoom } from "ponder:schema";
import ZigguratAbi from "../contracts/abis/Ziggurat.json";
import MonsterRegistryAbi from "../contracts/abis/MonsterRegistry.json";

// Ziggurat: PartyCreatedEvent
ponder.on("Ziggurat:PartyCreatedEvent", async ({ event, context }) => {
  console.log("PARTY CREATED", {
    partyId: event.args.partyId.toString(),
    leader: event.args.leader.toLowerCase(),
    isPublic: event.args.isPublic,
    inviter: event.args.inviter.toLowerCase(),
    zigguratAddress: event.log.address.toLowerCase()
  });
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      zigguratAddress: event.log.address.toLowerCase(),
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

// Ziggurat: PartyMemberJoinedEvent
ponder.on("Ziggurat:PartyMemberJoinedEvent", async ({ event, context }) => {
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

// Ziggurat: PartyStartedEvent
ponder.on("Ziggurat:PartyStartedEvent", async ({ event, context }) => {
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      zigguratAddress: event.log.address.toLowerCase(),
      partyId: event.args.partyId.toString(),
      leader: "", // Will be updated by onConflictDoUpdate
      isPublic: false, // Will be updated by onConflictDoUpdate
      inviter: "", // Will be updated by onConflictDoUpdate
      roomHash: "", // Will be updated by onConflictDoUpdate
      battleAddress: "", // Will be updated by onConflictDoUpdate
      state: BigInt(1), // DOOR_CHOSEN
      chosenDoor: BigInt(0), // Will be updated by onConflictDoUpdate
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: event.block.timestamp,
      endedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      state: BigInt(1), // DOOR_CHOSEN
      startedAt: event.block.timestamp,
    });
});

// Ziggurat: RoomRevealedEvent
ponder.on("Ziggurat:RoomRevealedEvent", async ({ event, context }) => {
  // Try to find the parent room by its roomHash
  console.log("ROOM REVEALED, finding parent hash", event.args.roomHash.toLowerCase());
  
  const parentRoom = await context.db.find(zigguratRoom, { roomHash: event.args.roomHash.toLowerCase() });
  console.log("Parent room found:", parentRoom?.id);

  // Get the ziggurat data to find monster registry
  const zigguratData = await context.db.find(ziggurat, { address: event.log.address.toLowerCase() });
  const monsterRegistryAddress = zigguratData?.monsterRegistry;

  // Use multicall to get room data, monster index, number of doors, and room type
  const [roomData, monsterIndex, numberOfDoors, roomType] = await context.client.multicall({
    multicallAddress: "0xca11bde05977b3631167028862be2a173976ca11",
    contracts: [
      {
        address: event.log.address as `0x${string}`,
        abi: ZigguratAbi,
        functionName: "rooms",
        args: [event.args.childRoomHash]
      },
      {
        address: event.log.address as `0x${string}`,
        abi: ZigguratAbi,
        functionName: "getMonsterIndex",
        args: [event.args.childRoomHash]
      },
      {
        address: event.log.address as `0x${string}`,
        abi: ZigguratAbi,
        functionName: "getNumberOfDoors",
        args: [event.args.childRoomHash]
      },
      {
        address: event.log.address as `0x${string}`,
        abi: ZigguratAbi,
        functionName: "getRoomType",
        args: [event.args.childRoomHash]
      }
    ]
  });

  // Get the monster character address from MonsterRegistry
  let monsterCharacterAddress = "";
  if (monsterRegistryAddress && monsterIndex.result !== undefined && roomType.result == 2n) {
    try {
      const monsterResult = await context.client.readContract({
        address: monsterRegistryAddress as `0x${string}`,
        abi: MonsterRegistryAbi,
        functionName: "monsters",
        args: [monsterIndex.result]
      });
      monsterCharacterAddress = monsterResult?.toLowerCase() || "";
    } catch (error) {
      console.log("Failed to fetch monster from registry:", error);
    }
  }

  await context.db
    .insert(zigguratRoom)
    .values({
      id: event.args.childRoomHash.toLowerCase(),
      zigguratAddress: event.log.address.toLowerCase(),
      roomHash: event.args.childRoomHash.toLowerCase(),
      parentRoomHash: event.args.roomHash.toLowerCase(),
      parentDoorIndex: event.args.doorIndex,
      revealedAt: event.block.timestamp,
      parentRoomId: event.args.roomHash.toLowerCase(), // Use roomHash as parentRoomId
      roomType: roomType.result || 0n,
      depth: roomData.result?.depth || 0n,
      battle: "",
      monsterId: monsterCharacterAddress,
      numberOfDoors: numberOfDoors.result || 0n,
    })
    .onConflictDoUpdate({
      roomHash: event.args.childRoomHash.toLowerCase(),
      revealedAt: event.block.timestamp,
      roomType: roomType.result || 0n,
      depth: roomData.result?.depth || 0n,
      monsterId: monsterCharacterAddress,
      numberOfDoors: numberOfDoors.result || 0n,
    });
});

// Ziggurat: NextRoomChosenEvent
ponder.on("Ziggurat:NextRoomChosenEvent", async ({ event, context }) => {
  // Update the party to mark that a door has been chosen
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      zigguratAddress: event.log.address.toLowerCase(),
      partyId: event.args.partyId.toString(),
      leader: "", // Will be updated by onConflictDoUpdate
      isPublic: false, // Will be updated by onConflictDoUpdate
      inviter: "", // Will be updated by onConflictDoUpdate
      roomHash: "", // Will be updated by onConflictDoUpdate
      battleAddress: "", // Will be updated by onConflictDoUpdate
      state: BigInt(1), // DOOR_CHOSEN
      chosenDoor: event.args.doorIndex,
      createdTxHash: "", // Will be updated by onConflictDoUpdate
      createdAt: BigInt(0), // Will be updated by onConflictDoUpdate
      startedAt: BigInt(0), // Will be updated by onConflictDoUpdate
      endedAt: BigInt(0), // Will be updated by onConflictDoUpdate
    })
    .onConflictDoUpdate({
      state: BigInt(1), // DOOR_CHOSEN
      chosenDoor: event.args.doorIndex,
    });
});

// Ziggurat: PartyEndedEvent  
ponder.on("Ziggurat:PartyEndedEvent", async ({ event, context }) => {
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      zigguratAddress: event.log.address.toLowerCase(),
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

// Ziggurat: PartyCancelledEvent
ponder.on("Ziggurat:PartyCancelledEvent", async ({ event, context }) => {
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      zigguratAddress: event.log.address.toLowerCase(),
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


// Ziggurat: RoomEnteredEvent
ponder.on("Ziggurat:RoomEnteredEvent", async ({ event, context }) => {
  // Get the battle address for this party from the contract
  let battleAddress = "";
  try {
    const battleResult = await context.client.readContract({
      address: event.log.address as `0x${string}`,
      abi: ZigguratAbi,
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
      zigguratAddress: event.log.address.toLowerCase(),
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

// Ziggurat: ZigguratClosedEvent
ponder.on("Ziggurat:ZigguratClosedEvent", async ({ event, context }) => {
  // Update the ziggurat to mark it as closed
  await context.db
    .insert(ziggurat)
    .values({
      address: event.log.address.toLowerCase(),
      trustedForwarder: "", // Will be updated by onConflictDoUpdate
      operator: "", // Will be updated by onConflictDoUpdate
      rngSeed: "", // Will be updated by onConflictDoUpdate
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

