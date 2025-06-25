# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server with hot reload
- `pnpm start` - Start production server
- `pnpm codegen` - Generate Ponder schema and TypeScript types
- `pnpm db` - Access database commands and migrations
- `pnpm lint` - Run ESLint on the codebase
- `pnpm typecheck` - Run TypeScript compiler for type checking

### Environment Setup
- Requires `PONDER_RPC_URL_1` environment variable pointing to blockchain RPC endpoint
- Uses pnpm as package manager (evidenced by pnpm-lock.yaml)
- Node.js >=18.14 required

## Architecture Overview

This is a **Ponder indexer** for the RAF (Ready Aim Fire) blockchain game ecosystem. Ponder is a framework for indexing and serving blockchain data through event handlers and GraphQL APIs.

### Core Components

**Ponder Configuration (`ponder.config.ts`)**
- Defines smart contract configurations for indexing
- Uses factory pattern for dynamically created contracts (Characters via CharacterFactory, Ziggurats via ZigguratSingleton)
- Contract deployments loaded from `src/contracts/deployments.json`
- Custom chain configuration pointing to game's blockchain network

**Database Schema (`ponder.schema.ts`)**
- Defines onchain tables using Ponder's schema system
- Core entities: Ziggurat, Party, Character, Battle, BasicDeck
- Battle-specific entities: BattlePlayer, BattleTurn, PlayerAction, PlayerStat, TurnEnd
- Uses relations between tables for complex queries
- All addresses stored as lowercase text for consistency

**Event Handlers (`src/handlers/`)**
- Process blockchain events and update database state
- Key handlers:
  - `ziggurat.ts`: Party creation, room exploration, battle events
  - `character.ts`: Character ownership/operator transfers
  - `zigguratSingleton.ts`: Ziggurat lifecycle management
  - `characterFactory.ts`: Character creation events
  - `basicDeck.ts`: Card minting and transfers
  - `battle.ts`: Battle player joins, actions, game state, turn management

### Smart Contract Architecture

**Game Flow:**
1. **ZigguratSingleton** manages global Ziggurat instances
2. **Ziggurat** contracts handle dungeon exploration with parties
3. **Character** contracts represent player avatars (created via CharacterFactory)
4. **Battle** contracts manage combat encounters
5. **BasicDeck** contracts handle game cards/items

**Factory Pattern Usage:**
- Characters dynamically created via CharacterFactory events
- Ziggurats dynamically created via ZigguratSingleton events
- Ponder tracks these using factory configurations in config

### Data Patterns

**ID Generation:**
- Composite IDs using contract addresses and entity IDs
- Format: `${contractAddress}-${entityId}` (all lowercase)
- Ensures uniqueness across different contract instances
- Battle-specific entities use `${battleAddress}-${playerId}-${additional}` format

**Event Processing:**
- Uses `onConflictDoUpdate` for upsert behavior
- Addresses always normalized to lowercase
- Block timestamps used for temporal tracking

**Battle Entity Details:**
- **BattlePlayer**: Tracks players in battles with location, team, elimination status
- **BattleTurn**: Records turn timing, duration, and which team's turn
- **PlayerAction**: Logs card actions with parameters and timing
- **PlayerStat**: Historical player stat changes (health, energy, block, etc.)
- **TurnEnd**: Records when individual players end their turns

## Development Notes

### Adding New Event Handlers
1. Add contract ABI to `src/contracts/abis/`
2. Update contract deployment in `deployments.json`
3. Configure contract in `ponder.config.ts`
4. Create handler in `src/handlers/`
5. Update schema in `ponder.schema.ts` if needed

### Database Schema Changes
1. Modify `ponder.schema.ts`
2. Run `pnpm codegen` to regenerate types
3. Update relevant event handlers

### Contract Address Management
- All contract addresses stored lowercase for consistency
- Deployment info centralized in `deployments.json`
- Helper functions in config handle address/block parsing

## Common Issues

- **Use Ponder-style ORM**: Instead of context.db.update() use context.db.insert().values()...onConflictDoUpdate()