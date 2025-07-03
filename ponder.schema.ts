import { char, onchainTable, relations } from "ponder";

// Ziggurat tables
export const ziggurat = onchainTable("ziggurat", (t) => ({
  address: t.text().primaryKey(), // contract address
  trustedForwarder: t.text(),
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

export const zigguratSingleton = onchainTable("zigguratSingleton", (t) => ({
  address: t.text().primaryKey(), // contract address
  trustedForwarder: t.text(),
  owner: t.text(),
  operator: t.text(),
  zigguratDuration: t.bigint(),
  ziggurat: t.text(), // current ziggurat address
  lastSetAt: t.bigint(),
  createdAt: t.bigint(),
}));

export const party = onchainTable("party", (t) => ({
  id: t.text().primaryKey(), // zigguratAddress + partyId
  zigguratAddress: t.text(),
  partyId: t.text(),
  leader: t.text(), // leader character contract address
  isPublic: t.boolean(),
  inviter: t.text(), // address that created the party
  roomHash: t.text(), // current room hash where party is located
  battleAddress: t.text(), // battle contract address for the current room
  state: t.bigint(), // PartyState enum: 0=CREATED, 1=DOOR_CHOSEN, 2=IN_ROOM, 3=CANCELLED, 4=ESCAPED
  chosenDoor: t.bigint(), // index of the chosen door
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

export const zigguratRoom = onchainTable("zigguratRoom", (t) => ({
  id: t.text().primaryKey(), // zigguratAddress + parentRoomHash + parentDoorIndex
  zigguratAddress: t.text(),
  roomHash: t.text(), // roomHash
  parentRoomHash: t.text(), // parent room hash
  parentRoomId: t.text(),
  parentDoorIndex: t.bigint(),
  revealedAt: t.bigint(),
  roomType: t.bigint(),
  depth: t.bigint(), // depth in the ziggurat
  battle: t.text(), // battle contract address when room is entered
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
}));

// BasicDeck (BaseCards) tables
export const basicDeckCard = onchainTable("basicDeckCard", (t) => ({
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
  // Player stats from PlayerStatsStorage
  statsLastUpdatedTurn: t.bigint(), // turn when stats were last updated
  statsData: t.text(), // hex encoded bytes30 stats data
}));

// Player Action tables
export const playerAction = onchainTable("playerAction", (t) => ({
  id: t.text().primaryKey(), // battleAddress + playerId + turn + timestamp
  battleAddress: t.text(),
  playerId: t.bigint(),
  turn: t.bigint(),
  cardIndex: t.bigint(),
  cardActionParams: t.text(), // hex encoded bytes
  actionedAt: t.bigint(),
}));

// Turn End tables
export const turnEnd = onchainTable("turnEnd", (t) => ({
  id: t.text().primaryKey(), // battleAddress + playerId + turn
  battleAddress: t.text(),
  playerId: t.bigint(),
  turn: t.bigint(),
  endedAt: t.bigint(),
}));

// Monster Registry tables
export const monster = onchainTable("monster", (t) => ({
  id: t.text().primaryKey(), // character contract address
  character: t.text(), // character contract address
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

// Relations - Simple and safe
export const zigguratRelations = relations(ziggurat, ({ one, many }) => ({
  parties: many(party),
  rooms: many(zigguratRoom),
  rootRoom: one(zigguratRoom, {
    fields: [ziggurat.rootRoomHash],
    references: [zigguratRoom.id],
  })
}));

export const partyRelations = relations(party, ({ one, many }) => ({
  ziggurat: one(ziggurat, {
    fields: [party.zigguratAddress],
    references: [ziggurat.address],
  }),
  members: many(partyMember),
  currentRoom: one(zigguratRoom, {
    fields: [party.roomHash],
    references: [zigguratRoom.roomHash],
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

export const zigguratRoomRelations = relations(zigguratRoom, ({ one, many }) => ({
  ziggurat: one(ziggurat, {
    fields: [zigguratRoom.zigguratAddress],
    references: [ziggurat.address],
  }),
  parent: one(zigguratRoom, {
    fields: [zigguratRoom.parentRoomId],
    references: [zigguratRoom.id],
    relationName: "parentChild"
  }),
  children: many(zigguratRoom, {
    relationName: "parentChild"
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
  turnEnds: many(turnEnd)
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

export const turnEndRelations = relations(turnEnd, ({ one }) => ({
  battle: one(battle, {
    fields: [turnEnd.battleAddress],
    references: [battle.id],
  }),
  player: one(battlePlayer, {
    fields: [turnEnd.battleAddress, turnEnd.playerId],
    references: [battlePlayer.battleAddress, battlePlayer.playerId],
  }),
}));

export const characterRelations = relations(character, ({ many }) => ({
  cards: many(characterCard),
  battlePlayers: many(battlePlayer),
  partyMembers: many(partyMember)
}));