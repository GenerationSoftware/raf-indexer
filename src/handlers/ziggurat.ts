import { ponder } from "ponder:registry";
import { ziggurat, party, partyMember, zigguratRoom } from "ponder:schema";
import ZigguratAbi from "../contracts/abis/Ziggurat.json";

// Ziggurat: PartyCreatedEvent
ponder.on("Ziggurat:PartyCreatedEvent", async ({ event, context }) => {
  console.log("PARTY CREATED", {
    partyId: event.args.partyId.toString(),
    character: event.args.character.toLowerCase(),
    isPublic: event.args.isPublic,
    zigguratAddress: event.log.address.toLowerCase()
  });
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      zigguratAddress: event.log.address.toLowerCase(),
      partyId: event.args.partyId.toString(),
      character: event.args.character.toLowerCase(),
      isPublic: event.args.isPublic,
      isStarted: false,
      isEnded: false,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      character: event.args.character.toLowerCase(),
      isPublic: event.args.isPublic,
    });
});

// Ziggurat: PartyMemberJoinedEvent
ponder.on("Ziggurat:PartyMemberJoinedEvent", async ({ event, context }) => {
  await context.db
    .insert(partyMember)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString() + "-" + event.args.character.toLowerCase(),
      partyId: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      character: event.args.character.toLowerCase(),
      joinedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      character: event.args.character.toLowerCase(),
      joinedAt: event.block.timestamp,
    });
});

// Ziggurat: PartyStartedEvent
ponder.on("Ziggurat:PartyStartedEvent", async ({ event, context }) => {
  await context.db
    .insert(party)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.partyId.toString(),
      isStarted: true,
      startedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      isStarted: true,
      startedAt: event.block.timestamp,
    });
});

// Ziggurat: RoomRevealedEvent
ponder.on("Ziggurat:RoomRevealedEvent", async ({ event, context }) => {
  // Try to find the parent room by its roomHash
  const parentRoom = await context.db.find(zigguratRoom, { roomHash: event.args.parentRoomHash.toLowerCase() });

  await context.db
    .insert(zigguratRoom)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.parentRoomHash.toLowerCase() + "-" + event.args.parentDoorIndex.toString(),
      zigguratAddress: event.log.address.toLowerCase(),
      roomHash: event.args.roomHash.toLowerCase(),
      parentRoomHash: event.args.parentRoomHash.toLowerCase(),
      parentDoorIndex: event.args.parentDoorIndex,
      revealedAt: event.block.timestamp,
      parentRoomId: parentRoom?.id || null,
      roomType: event.args.roomType
    })
    .onConflictDoUpdate({
      roomHash: event.args.roomHash.toLowerCase(),
      revealedAt: event.block.timestamp,
    });
});

// Ziggurat: NextRoomChosenEvent
ponder.on("Ziggurat:NextRoomChosenEvent", async ({ event, context }) => {
  // This event indicates a door was chosen for the next room
  // We need to find the current room hash for this party to create the door record
  // For now, we'll create a door record with a placeholder room hash
  // In a real implementation, you might need to track the current room per party
  
  // const doorId = `${event.args.partyId}-${event.args.parentDoorIndex}`;
  
  // await context.db
  //   .insert(zigguratDoor)
  //   .values({
  //     id: doorId,
  //     roomHash: "", // This would need to be determined from party's current room
  //     doorIndex: event.args.parentDoorIndex,
  //     chosenAt: event.block.timestamp,
  //   })
  //   .onConflictDoUpdate({
  //     doorIndex: event.args.parentDoorIndex,
  //     chosenAt: event.block.timestamp,
  //   });
});

// Ziggurat: BattleRoomEnteredEvent
ponder.on("Ziggurat:BattleRoomEnteredEvent", async ({ event, context }) => {
  console.log("BATTLE ROOM ENTERED", event);
  
  // // Get the party's current location to find the room they're entering
  // const partyLocation = await context.client.readContract({
  //   address: event.log.address as `0x${string}`,
  //   abi: ZigguratAbi,
  //   functionName: "partyLocation",
  //   args: [event.args.partyId]
  // });

  // const roomId = event.log.address.toLowerCase() + "-" + partyLocation.parentRoomHash.toLowerCase() + "-" + partyLocation.parentDoorIndex.toString();
  
  // // Update the existing room record with the battle information
  // await context.db
  //   .update(zigguratRoom)
  //   .set({
  //     battle: event.args.battle.toLowerCase(),
  //   })
  //   .where({ id: roomId });
    
  // console.log(`Party ${event.args.partyId} entered battle room ${roomId} with battle ${event.args.battle}`);
});