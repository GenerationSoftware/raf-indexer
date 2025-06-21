import { ponder } from "ponder:registry";
import { ziggurat, zigguratParty, zigguratRoom, zigguratDoor } from "ponder:schema";

// Ziggurat: PartyCreatedEvent
ponder.on("Ziggurat:PartyCreatedEvent", async ({ event, context }) => {
  await context.db
    .insert(zigguratParty)
    .values({
      zigguratAddress: event.log.address.toLowerCase(),
      partyId: event.args.partyId.toString(),
      character: event.args.character.toLowerCase(),
      inviter: event.args.inviter.toLowerCase(),
      isPublic: event.args.isPublic,
      createdAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      character: event.args.character.toLowerCase(),
      inviter: event.args.inviter.toLowerCase(),
      isPublic: event.args.isPublic,
    });
});

// Ziggurat: PartyMemberJoinedEvent
ponder.on("Ziggurat:PartyMemberJoinedEvent", async ({ event, context }) => {
  // This event indicates a member joined a party
  // We might want to track party members, but the current schema doesn't have a party member table
  // For now, we'll just log this event or update the party if needed
  console.log(`Party member joined: Party ${event.args.partyId}, Character ${event.args.character}`);
});

// Ziggurat: PartyStartedEvent
ponder.on("Ziggurat:PartyStartedEvent", async ({ event, context }) => {
  // This event indicates a party has started
  // We might want to update the party status, but the current schema doesn't have a status field
  console.log(`Party started: Party ${event.args.partyId}`);
});

// Ziggurat: RoomRevealedEvent
ponder.on("Ziggurat:RoomRevealedEvent", async ({ event, context }) => {
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
      parentRoomId: parentRoom?.id,
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
  
  const doorId = `${event.args.partyId}-${event.args.parentDoorIndex}`;
  
  await context.db
    .insert(zigguratDoor)
    .values({
      id: doorId,
      roomHash: "", // This would need to be determined from party's current room
      doorIndex: event.args.parentDoorIndex,
      chosenAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      doorIndex: event.args.parentDoorIndex,
      chosenAt: event.block.timestamp,
    });
});

// Ziggurat: RoomEnteredEvent
ponder.on("Ziggurat:BattleRoomEnteredEvent", async ({ event, context }) => {
  console.log("BATTLE ROOM ENTERED", event);
  // This event indicates a party entered a room
  // Since the schema doesn't have partyId, enteredAt, or doorIndex fields,
  // we'll need to track this information differently or update the schema
  await context.db
    .insert(zigguratRoom)
    .values({
      id: event.log.address.toLowerCase() + "-" + event.args.parentRoomHash.toLowerCase() + "-" + event.args.parentDoorIndex.toString(),
      battle: event.args.battle.toLowerCase(),
    })
    .onConflictDoUpdate({
      battle: event.args.battle.toLowerCase(),
    });
});
