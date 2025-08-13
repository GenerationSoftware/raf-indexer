import { char, onchainTable, relations } from "ponder";

// Act tables (formerly Ziggurat)
export const act = onchainTable("act", (t) => ({
  address: t.text().primaryKey(), // contract address
  trustedForwarder: t.text(),
  owner: t.text(),
  operator: t.text(),
  rngSeed: t.text(),
  rootRoomHash: t.text(),
  readyAimFireFactory: t.text(),
  deckConfiguration: t.text(),
  monsterRegistry: t.text(),
  maxDoorCount: t.bigint(),
  monsterSigma: t.bigint(),
  turnDuration: t.bigint(),
  isClosed: t.boolean(),
  createdAt: t.bigint(),
}));

export const season = onchainTable("season", (t) => ({
  address: t.text().primaryKey(), // contract address
  trustedForwarder: t.text(),
  owner: t.text(),
  operator: t.text(),
  currentActIndex: t.bigint(),
  createdAt: t.bigint(),
}));

export const seasonAct = onchainTable("seasonAct", (t) => ({
  id: t.text().primaryKey(), // seasonAddress + actIndex
  seasonAddress: t.text(),
  actIndex: t.bigint(),
  actAddress: t.text(),
  createdAt: t.bigint(),
}));

export const party = onchainTable("party", (t) => ({
  id: t.text().primaryKey(), // actAddress + partyId
  actAddress: t.text(),
  partyId: t.text(),
  leader: t.text(), // leader character contract address
  isPublic: t.boolean(),
  inviter: t.text(), // address that created the party
  roomHash: t.text(), // current room hash where party is located
  battleAddress: t.text(), // battle contract address for the current room
  state: t.bigint(), // PartyState enum: 0=CREATED, 1=ROOM_CHOSEN, 2=IN_ROOM, 3=WON, 4=LOST, 5=CANCELLED
  createdTxHash: t.text(), // transaction hash that created the party
  createdAt: t.bigint(),
  startedAt: t.bigint(),
  endedAt: t.bigint(),
}));

export const partyMember = onchainTable("partyMember", (t) => ({
  id: t.text().primaryKey(), // partyId + character
  partyId: t.text(),
  characterId: t.text(),
  joinedAt: t.bigint()
}));

export const actRoom = onchainTable("actRoom", (t) => ({
  id: t.text().primaryKey(), // actAddress + parentRoomHash + parentDoorIndex
  actAddress: t.text(),
  roomHash: t.text(), // roomHash
  parentRoomHash: t.text(), // parent room hash
  parentRoomId: t.text(),
  parentDoorIndex: t.bigint(),
  revealedAt: t.bigint(),
  roomType: t.bigint(),
  depth: t.bigint(), // depth in the act
  battle: t.text(), // battle contract address when room is entered
  monsterId: t.text(), // monster character contract address
  numberOfDoors: t.bigint(), // number of doors in this room
}));

// Battle tables
export const battle = onchainTable("battle", (t) => ({
  id: t.text().primaryKey(), // battle contract address
  owner: t.text(),
  operator: t.text(),
  joinDeadlineAt: t.bigint(),
  turnDuration: t.bigint(),
  deckConfiguration: t.text(),
  playerStatsStorage: t.text(),
  enforceAdjacency: t.boolean(),
  currentTurn: t.bigint(),
  teamAStarts: t.boolean(),
  teamACount: t.bigint(),
  teamBCount: t.bigint(),
  teamAEliminated: t.bigint(),
  teamBEliminated: t.bigint(),
  winner: t.bigint(), // 0=tie, 1=teamA, 2=teamB
  gameStartedAt: t.bigint(),
  gameEndedAt: t.bigint(),
  createdAt: t.bigint(),
}));

// Character tables
export const character = onchainTable("character", (t) => ({
  id: t.text().primaryKey(), // character contract address
  owner: t.text(),
  operator: t.text(),
  name: t.text(),
  createdAt: t.bigint(),
}));

export const characterCard = onchainTable("characterCard", (t) => ({
  id: t.text().primaryKey(), // characterAddress + cardId
  characterAddress: t.text(), // character contract address
  cardId: t.bigint(),
  deck: t.text(), // deck contract address
  tokenId: t.bigint(),
  activatedAt: t.bigint(),
  deactivatedAt: t.bigint(),
  isActive: t.boolean(),
}));

// BasicDeck (BaseCards) tables
export const standardDeckCard = onchainTable("standardDeckCard", (t) => ({
  id: t.text().primaryKey(), // deckAddress + tokenId
  deckAddress: t.text(), // deck contract address
  tokenId: t.bigint(),
  owner: t.text(),
  actionType: t.bigint(),
  mintedAt: t.bigint(),
  transferredAt: t.bigint(),
}));

// Battle Player tables
export const battlePlayer = onchainTable("battlePlayer", (t) => ({
  id: t.text().primaryKey(), // battleAddress + playerId
  battleAddress: t.text(),
  playerId: t.bigint(),
  character: t.text(), // character contract address
  locationX: t.bigint(), // team column (0=A, 1=B)
  locationY: t.bigint(), // position in team
  teamA: t.boolean(),
  joinedAt: t.bigint(),
  eliminated: t.boolean(),
  eliminatedAt: t.bigint(),
  lastEndedTurn: t.bigint(),
  // Player stats from PlayerStatsStorage
  statsLastUpdatedTurn: t.bigint(), // turn when stats were last updated
  statsData: t.text(), // hex encoded bytes30 stats data
}));

// Player Action tables
export const playerAction = onchainTable("playerAction", (t) => ({
  id: t.text().primaryKey(), // battleAddress + playerId + turn + txHash + logIndex
  battleAddress: t.text(),
  playerId: t.bigint(),
  turn: t.bigint(),
  cardIndex: t.bigint(),
  cardActionParams: t.text(), // hex encoded bytes
  actionedAt: t.bigint(),
}));

// Monster Registry tables
export const monster = onchainTable("monster", (t) => ({
  id: t.text().primaryKey(), // character contract address
  characterAddress: t.text(), // character contract address
  health: t.bigint(),
  registeredAt: t.bigint(),
}));

// PlayerStatsStorage tables
export const playerStatsStorage = onchainTable("playerStatsStorage", (t) => ({
  id: t.text().primaryKey(), // contract address
  trustedForwarder: t.text(),
  owner: t.text(),
  operator: t.text(), // this is the Battle contract
  createdAt: t.bigint(),
}));

// BasicDeckLogic tables
export const actionDefinition = onchainTable("actionDefinition", (t) => ({
  id: t.text().primaryKey(), // deckLogicAddress + actionType
  deckLogicAddress: t.text(),
  actionType: t.bigint(),
  energy: t.bigint(),
  setAt: t.bigint(),
}));

export const actionEffect = onchainTable("actionEffect", (t) => ({
  id: t.text().primaryKey(), // actionDefinitionId + effectIndex
  actionDefinitionId: t.text(),
  effectIndex: t.bigint(),
  effectType: t.bigint(),
  amount: t.bigint(),
}));

// DeckConfiguration tables  
export const deckConfiguration = onchainTable("deckConfiguration", (t) => ({
  id: t.text().primaryKey(), // contract address
  trustedForwarder: t.text(),
  owner: t.text(),
  operator: t.text(),
  createdAt: t.bigint(),
}));

// Relations - Simple and safe
export const actRelations = relations(act, ({ one, many }) => ({
  parties: many(party),
  rooms: many(actRoom),
  rootRoom: one(actRoom, {
    fields: [act.rootRoomHash],
    references: [actRoom.id],
  })
}));

export const partyRelations = relations(party, ({ one, many }) => ({
  act: one(act, {
    fields: [party.actAddress],
    references: [act.address],
  }),
  members: many(partyMember),
  currentRoom: one(actRoom, {
    fields: [party.roomHash],
    references: [actRoom.roomHash],
  }),
  battle: one(battle, {
    fields: [party.battleAddress],
    references: [battle.id],
  })
}));

export const partyMemberRelations = relations(partyMember, ({ one }) => ({
  party: one(party, {
    fields: [partyMember.partyId],
    references: [party.id],
  }),
  character: one(character, {
    fields: [partyMember.characterId],
    references: [character.id],
  })
}));

export const actRoomRelations = relations(actRoom, ({ one, many }) => ({
  act: one(act, {
    fields: [actRoom.actAddress],
    references: [act.address],
  }),
  parent: one(actRoom, {
    fields: [actRoom.parentRoomId],
    references: [actRoom.id],
    relationName: "parentChild"
  }),
  children: many(actRoom, {
    relationName: "parentChild"
  }),
  monster: one(monster, {
    fields: [actRoom.monsterId],
    references: [monster.characterAddress],
  })
}));

export const characterCardRelations = relations(characterCard, ({ one }) => ({
  character: one(character, {
    fields: [characterCard.characterAddress],
    references: [character.id],
  })
}));

export const battleRelations = relations(battle, ({ many }) => ({
  players: many(battlePlayer),
  actions: many(playerAction),
}));

export const battlePlayerRelations = relations(battlePlayer, ({ one }) => ({
  battle: one(battle, {
    fields: [battlePlayer.battleAddress],
    references: [battle.id],
  }),
  character: one(character, {
    fields: [battlePlayer.character],
    references: [character.id]
  })
}));

export const playerActionRelations = relations(playerAction, ({ one }) => ({
  battle: one(battle, {
    fields: [playerAction.battleAddress],
    references: [battle.id],
  }),
  player: one(battlePlayer, {
    fields: [playerAction.battleAddress, playerAction.playerId],
    references: [battlePlayer.battleAddress, battlePlayer.playerId],
  }),
}));

export const characterRelations = relations(character, ({ one, many }) => ({
  cards: many(characterCard),
  battlePlayers: many(battlePlayer),
  partyMembers: many(partyMember),
  monster: one(monster, {
    fields: [character.id],
    references: [monster.characterAddress],
  })
}));

export const monsterRelations = relations(monster, ({ one }) => ({
  character: one(character, {
    fields: [monster.characterAddress],
    references: [character.id],
  })
}));

export const actionDefinitionRelations = relations(actionDefinition, ({ many }) => ({
  effects: many(actionEffect),
}));

export const actionEffectRelations = relations(actionEffect, ({ one }) => ({
  actionDefinition: one(actionDefinition, {
    fields: [actionEffect.actionDefinitionId],
    references: [actionDefinition.id],
  })
}));

