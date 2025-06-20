import { onchainTable } from "ponder";

// Ziggurat tables
export const ziggurat = onchainTable("ziggurat", (t) => ({
  id: t.text().primaryKey(), // contract address
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

export const zigguratParty = onchainTable("zigguratParty", (t) => ({
  id: t.text().primaryKey(), // partyId
  character: t.text(), // character contract address
  inviter: t.text(), // inviter address
  isPublic: t.boolean(),
  createdAt: t.bigint(),
  endedAt: t.bigint(),
}));

export const zigguratRoom = onchainTable("zigguratRoom", (t) => ({
  id: t.text().primaryKey(), // roomHash
  partyId: t.text(), // reference to party
  parentRoomHash: t.text(),
  doorIndex: t.bigint(),
  revealedAt: t.bigint(),
  enteredAt: t.bigint(),
}));

export const zigguratDoor = onchainTable("zigguratDoor", (t) => ({
  id: t.text().primaryKey(), // roomHash + doorIndex
  roomHash: t.text(),
  doorIndex: t.bigint(),
  chosenAt: t.bigint(),
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

export const battlePlayer = onchainTable("battlePlayer", (t) => ({
  id: t.text().primaryKey(), // battleAddress + playerId
  battleId: t.text(),
  playerId: t.bigint(),
  character: t.text(), // character contract address
  teamA: t.boolean(),
  joinedAt: t.bigint(),
}));

export const battleTurn = onchainTable("battleTurn", (t) => ({
  id: t.text().primaryKey(), // battleAddress + turnNumber
  battleId: t.text(),
  turnNumber: t.bigint(),
  playerId: t.bigint(),
  teamA: t.boolean(),
  startedAt: t.bigint(),
  endedAt: t.bigint(),
}));

export const battleAction = onchainTable("battleAction", (t) => ({
  id: t.text().primaryKey(), // battleAddress + turnNumber + actionIndex
  battleId: t.text(),
  turnNumber: t.bigint(),
  playerId: t.bigint(),
  activeCardIndex: t.bigint(),
  cardActionParams: t.text(), // hex encoded params
  executedAt: t.bigint(),
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
  characterId: t.text(),
  cardId: t.bigint(),
  deck: t.text(), // deck contract address
  tokenId: t.bigint(),
  addedAt: t.bigint(),
}));

// BasicDeck (BaseCards) tables
export const basicDeckCard = onchainTable("basicDeckCard", (t) => ({
  id: t.text().primaryKey(), // deckAddress + tokenId
  deckId: t.text(), // deck contract address
  tokenId: t.bigint(),
  owner: t.text(),
  baseUri: t.text(),
  mintedAt: t.bigint(),
  transferredAt: t.bigint(),
}));
