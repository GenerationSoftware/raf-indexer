import { onchainTable, relations } from "ponder";

// Ziggurat tables
export const ziggurat = onchainTable("ziggurat", (t) => ({
  address: t.text().primaryKey(), // contract address
  trustedForwarder: t.text(),
  operator: t.text(),
  rngSeed: t.text(),
  readyAimFireFactory: t.text(),
  deckConfiguration: t.text(),
  monsterRegistry: t.text(),
  maxDoorCount: t.bigint(),
  monsterSigma: t.bigint(),
  turnDuration: t.bigint(),
  createdAt: t.bigint(),
}));

export const zigguratRelations = relations(ziggurat, ({ many }) => ({
  parties: many(party),
  rooms: many(zigguratRoom)
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
  character: t.text(), // character contract address
  isPublic: t.boolean(),
  isStarted: t.boolean(),
  isEnded: t.boolean(),
  createdAt: t.bigint(),
  startedAt: t.bigint(),
  endedAt: t.bigint(),
}));

export const partyMember = onchainTable("partyMember", (t) => ({
  id: t.text().primaryKey(), // partyId + character
  partyId: t.text(),
  character: t.text(),
  joinedAt: t.bigint()
}));

export const partyRelations = relations(party, ({ one }) => ({
  ziggurat: one(ziggurat, {
    fields: [party.zigguratAddress],
    references: [ziggurat.address],
  }),
}));

export const zigguratRoom = onchainTable("zigguratRoom", (t) => ({
  id: t.text().primaryKey(), // zigguratAddress + parentRoomHash + parentDoorIndex
  zigguratAddress: t.text(),
  roomHash: t.text(), // roomHash
  parentRoomHash: t.text(),
  parentDoorIndex: t.bigint(),
  revealedAt: t.bigint(),
  parentRoomId: t.text(),
  roomType: t.bigint(),
  battle: t.text(), // battle contract address when room is entered
}));

export const zigguratRoomRelations = relations(zigguratRoom, ({ one }) => ({
  ziggurat: one(ziggurat, {
    fields: [zigguratRoom.zigguratAddress],
    references: [ziggurat.address],
  }),
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
