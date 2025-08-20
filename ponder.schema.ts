import { char, onchainTable, relations } from "ponder";

// Act tables (formerly Ziggurat)
export const act = onchainTable("act", (t) => ({
  address: t.text().primaryKey(), // contract address
  trustedForwarder: t.text(),
  owner: t.text(),
  operator: t.text(),
  rngSeed: t.text(),
  startingRoomId: t.bigint(),
  battleFactory: t.text(),
  deckConfiguration: t.text(),
  monsterRegistry: t.text(),
  playerDeckManager: t.text(),
  maxDepth: t.bigint(),
  turnDuration: t.bigint(),
  isClosed: t.boolean(),
  createdAt: t.bigint(),
}));

export const season = onchainTable("season", (t) => ({
  address: t.text().primaryKey(), // contract address
  name: t.text(),
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
  roomId: t.bigint(), // current room id where party is located
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

export const partyRoomBattle = onchainTable("partyRoomBattle", (t) => ({
  id: t.text().primaryKey(), // partyId + roomId + battleAddress
  partyId: t.text(),
  battleAddress: t.text(),
  roomId: t.bigint(),
  createdAt: t.bigint(),
}));

export const actRoom = onchainTable("actRoom", (t) => ({
  id: t.text().primaryKey(), // actAddress + roomId
  actAddress: t.text(),
  roomId: t.bigint(), // roomId (uint32)
  roomType: t.bigint(),
  roomData: t.text(), // hex encoded room data (varies by room type)
  revealedAt: t.bigint(),
}));

// BattleRoom specific data
export const battleRoomData = onchainTable("battleRoomData", (t) => ({
  id: t.text().primaryKey(), // actAddress + partyId + roomId
  actAddress: t.text(),
  partyId: t.text(),
  roomId: t.bigint(),
  monsterIndex1: t.bigint(),
  battleAddress: t.text(),
  createdAt: t.bigint(),
  startedAt: t.bigint(),
}));

// Junction table for room connections (forms a directed graph)
export const actRoomConnection = onchainTable("actRoomConnection", (t) => ({
  id: t.text().primaryKey(), // fromRoomId + "-" + toRoomId + "-" + slotIndex
  actAddress: t.text(),
  fromRoomId: t.text(), // actAddress + roomId of parent room
  toRoomId: t.text(), // actAddress + roomId of child room
  slotIndex: t.bigint(), // index in the nextRooms array (0-6)
}));

// Battle tables
export const battle = onchainTable("battle", (t) => ({
  id: t.text().primaryKey(), // battle contract address
  owner: t.text(),
  operator: t.text(),
  joinDeadlineAt: t.bigint(),
  turnDuration: t.bigint(),
  turnTimerEnabled: t.boolean(),
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
  // Turn struct fields
  currentTurnStartedAt: t.bigint(),
  currentTurnDuration: t.bigint(),
  currentTurnEndTurnCount: t.bigint(),
  currentTurnRandomNumber: t.bigint(),
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
  deckId: t.bigint(), // deck ID from playerDeckIds
  locationX: t.bigint(), // team column (0=A, 1=B)
  locationY: t.bigint(), // position in team
  teamA: t.boolean(),
  joinedAt: t.bigint(),
  eliminated: t.boolean(),
  eliminatedAt: t.bigint(),
  lastEndedTurn: t.bigint(),
  lastTurnHandDrawn: t.bigint(), // turn when player last drew their hand
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
  index: t.bigint(), // monster index in the registry
  health: t.bigint(),
  registeredAt: t.bigint(),
}));

// Monster cards from MonsterStats
export const monsterCard = onchainTable("monsterCard", (t) => ({
  id: t.text().primaryKey(), // characterAddress + cardIndex
  characterAddress: t.text(), // monster character contract address
  cardIndex: t.bigint(), // index of the card in the cards array
  deck: t.text(), // IDeck contract address
  actionTypes: t.text(), // JSON array of action types
  registeredAt: t.bigint(),
}));

// PlayerDeckManager tables
export const playerDeck = onchainTable("playerDeck", (t) => ({
  id: t.text().primaryKey(), // playerDeckManagerAddress + deckId
  playerDeckManagerAddress: t.text(),
  deckId: t.bigint(),
  owner: t.text(),
  createdAt: t.bigint(),
  destroyedAt: t.bigint(),
  isActive: t.boolean(),
}));

export const playerDeckCard = onchainTable("playerDeckCard", (t) => ({
  id: t.text().primaryKey(), // playerDeckId + cardIndex
  playerDeckId: t.text(),
  deckAddress: t.text(), // IDeck contract address
  cardIndex: t.bigint(),
  actionType: t.bigint(),
  location: t.text(), // 'draw', 'hand', 'discard', 'exhausted', 'removed'
  addedAt: t.bigint(),
  updatedAt: t.bigint(),
}));

// BasicDeckLogic tables
export const actionDefinition = onchainTable("actionDefinition", (t) => ({
  id: t.text().primaryKey(), // deckLogicAddress + actionType
  deckLogicAddress: t.text(),
  actionType: t.bigint(),
  name: t.text(),
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
export const seasonRelations = relations(season, ({ many }) => ({
  seasonActs: many(seasonAct),
}));

export const seasonActRelations = relations(seasonAct, ({ one }) => ({
  season: one(season, {
    fields: [seasonAct.seasonAddress],
    references: [season.address],
  }),
  act: one(act, {
    fields: [seasonAct.actAddress],
    references: [act.address],
  }),
}));

export const actRelations = relations(act, ({ many }) => ({
  parties: many(party),
  rooms: many(actRoom),
  seasonActs: many(seasonAct),
}));

export const partyRelations = relations(party, ({ one, many }) => ({
  act: one(act, {
    fields: [party.actAddress],
    references: [act.address],
  }),
  members: many(partyMember),
  roomBattles: many(partyRoomBattle),
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

export const partyRoomBattleRelations = relations(partyRoomBattle, ({ one }) => ({
  party: one(party, {
    fields: [partyRoomBattle.partyId],
    references: [party.id],
  }),
  battle: one(battle, {
    fields: [partyRoomBattle.battleAddress],
    references: [battle.id],
  }),
}));

export const actRoomRelations = relations(actRoom, ({ one, many }) => ({
  act: one(act, {
    fields: [actRoom.actAddress],
    references: [act.address],
  }),
  // Outgoing connections (this room -> next rooms)
  outgoingConnections: many(actRoomConnection, {
    relationName: "fromRoom"
  }),
  // Incoming connections (previous rooms -> this room)
  incomingConnections: many(actRoomConnection, {
    relationName: "toRoom"
  })
}));

export const actRoomConnectionRelations = relations(actRoomConnection, ({ one }) => ({
  fromRoom: one(actRoom, {
    fields: [actRoomConnection.fromRoomId],
    references: [actRoom.id],
    relationName: "fromRoom"
  }),
  toRoom: one(actRoom, {
    fields: [actRoomConnection.toRoomId],
    references: [actRoom.id],
    relationName: "toRoom"
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
  partyRooms: many(partyRoomBattle),
}));

export const battlePlayerRelations = relations(battlePlayer, ({ one }) => ({
  battle: one(battle, {
    fields: [battlePlayer.battleAddress],
    references: [battle.id],
  }),
  character: one(character, {
    fields: [battlePlayer.character],
    references: [character.id]
  }),
  deck: one(playerDeck, {
    fields: [battlePlayer.deckId],
    references: [playerDeck.deckId]
  })
}));

export const playerDeckRelations = relations(playerDeck, ({ many }) => ({
  battlePlayers: many(battlePlayer),
  cards: many(playerDeckCard)
}));

export const playerDeckCardRelations = relations(playerDeckCard, ({ one }) => ({
  playerDeck: one(playerDeck, {
    fields: [playerDeckCard.playerDeckId],
    references: [playerDeck.id]
  }),
  actionDefinition: one(actionDefinition, {
    fields: [playerDeckCard.actionType],
    references: [actionDefinition.actionType]
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

export const monsterRelations = relations(monster, ({ one, many }) => ({
  character: one(character, {
    fields: [monster.characterAddress],
    references: [character.id],
  }),
  cards: many(monsterCard),
}));

export const monsterCardRelations = relations(monsterCard, ({ one }) => ({
  monster: one(monster, {
    fields: [monsterCard.characterAddress],
    references: [monster.characterAddress],
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

