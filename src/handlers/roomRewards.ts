import { ponder } from "ponder:registry";

// RoomRewards: RoomRewardSet
ponder.on("RoomRewards:RoomRewardSet" as any, async ({ event, context }: any) => {
  console.log("ROOM REWARD SET", {
    contractAddress: event.log.address.toLowerCase(),
    roomHash: event.args.roomHash,
    rewardType: event.args.rewardType
  });
  // Currently we don't have a dedicated table for room rewards
  // But we can add one if needed in the future
});

// RoomRewards: SingleChoiceRewardClaimed
ponder.on("RoomRewards:SingleChoiceRewardClaimed" as any, async ({ event, context }: any) => {
  console.log("SINGLE CHOICE REWARD CLAIMED", {
    contractAddress: event.log.address.toLowerCase(),
    partyId: event.args.partyId,
    roomHash: event.args.roomHash,
    character: event.args.character.toLowerCase(),
    choiceIndex: event.args.choiceIndex,
    card: event.args.card
  });
  // Track reward claims if needed
});

// RoomRewards: MultiChoiceRewardClaimed
ponder.on("RoomRewards:MultiChoiceRewardClaimed" as any, async ({ event, context }: any) => {
  console.log("MULTI CHOICE REWARD CLAIMED", {
    contractAddress: event.log.address.toLowerCase(),
    partyId: event.args.partyId,
    roomHash: event.args.roomHash,
    character: event.args.character?.toLowerCase() || "",
    choiceIndex: event.args.choiceIndex
  });
  // Track reward claims if needed
});

// RoomRewards: OperatorTransferred
ponder.on("RoomRewards:OperatorTransferred" as any, async ({ event, context }: any) => {
  console.log("ROOM REWARDS OPERATOR TRANSFERRED", {
    contractAddress: event.log.address.toLowerCase(),
    previousOperator: event.args.previousOperator.toLowerCase(),
    newOperator: event.args.newOperator.toLowerCase()
  });
});

// RoomRewards: OwnershipTransferred
ponder.on("RoomRewards:OwnershipTransferred" as any, async ({ event, context }: any) => {
  console.log("ROOM REWARDS OWNERSHIP TRANSFERRED", {
    contractAddress: event.log.address.toLowerCase(),
    previousOwner: event.args.previousOwner.toLowerCase(),
    newOwner: event.args.newOwner.toLowerCase()
  });
});