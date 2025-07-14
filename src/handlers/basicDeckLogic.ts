import { ponder } from "ponder:registry";
import { actionDefinition, actionEffect } from "ponder:schema";

// BasicDeckLogic: ActionDefinitionSet
ponder.on("BasicDeckLogic:ActionDefinitionSet", async ({ event, context }) => {
  console.log("ACTION DEFINITION SET", {
    actionType: event.args.actionType.toString(),
    energy: event.args.actionDefinition.energy.toString(),
    effects: event.args.actionDefinition.effects.length
  });

  const deckLogicAddress = event.log.address.toLowerCase();
  const actionDefinitionId = `${deckLogicAddress}-${event.args.actionType}`;

  // Create or update action definition
  await context.db
    .insert(actionDefinition)
    .values({
      id: actionDefinitionId,
      deckLogicAddress: deckLogicAddress,
      actionType: event.args.actionType,
      energy: BigInt(event.args.actionDefinition.energy),
      setAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      energy: BigInt(event.args.actionDefinition.energy),
      setAt: event.block.timestamp,
    });

  // Process effects (up to 15 effects per action definition)
  for (let i = 0; i < event.args.actionDefinition.effects.length; i++) {
    const effect = event.args.actionDefinition.effects[i];
    const effectId = `${actionDefinitionId}-${i}`;

    await context.db
      .insert(actionEffect)
      .values({
        id: effectId,
        actionDefinitionId: actionDefinitionId,
        effectIndex: BigInt(i),
        effectType: BigInt(effect.effectType),
        amount: BigInt(effect.amount),
      })
      .onConflictDoUpdate({
        effectType: BigInt(effect.effectType),
        amount: BigInt(effect.amount),
      });
  }
});

// BasicDeckLogic: RoleAdminChanged
ponder.on("BasicDeckLogic:RoleAdminChanged", async ({ event, context }) => {
  console.log("ROLE ADMIN CHANGED", {
    role: event.args.role,
    previousAdminRole: event.args.previousAdminRole,
    newAdminRole: event.args.newAdminRole
  });
  // Role events are typically not stored in main tables for this use case
  // but could be added to an audit log table if needed
});

// BasicDeckLogic: RoleGranted
ponder.on("BasicDeckLogic:RoleGranted", async ({ event, context }) => {
  console.log("ROLE GRANTED", {
    role: event.args.role,
    account: event.args.account.toLowerCase(),
    sender: event.args.sender.toLowerCase()
  });
  // Role events are typically not stored in main tables for this use case
  // but could be added to an audit log table if needed
});

// BasicDeckLogic: RoleRevoked
ponder.on("BasicDeckLogic:RoleRevoked", async ({ event, context }) => {
  console.log("ROLE REVOKED", {
    role: event.args.role,
    account: event.args.account.toLowerCase(),
    sender: event.args.sender.toLowerCase()
  });
  // Role events are typically not stored in main tables for this use case
  // but could be added to an audit log table if needed
});