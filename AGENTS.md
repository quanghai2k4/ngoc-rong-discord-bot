# Agent Guide for ngoc-rong-discord-bot

- Luôn trả lời bằng tiếng Việt

## Build/Test Commands
- `npm run build` - Compile TypeScript to dist/
- `npm run dev` - Run in development mode with ts-node
- `npm start` - Run compiled JavaScript from dist/
- `npm run watch` - Watch mode for TypeScript compilation
- No test framework configured yet

## Code Style
- **Language**: TypeScript with strict mode enabled (ES2022 target)
- **Imports**: Use named imports from discord.js, group by external/internal
- **Types**: Define interfaces in src/types/index.ts, use explicit types, avoid `any` (except for Discord interaction types)
- **Naming**: PascalCase for classes/interfaces, camelCase for functions/variables, UPPER_CASE for constants
- **Services**: Business logic in src/services/ with static methods
- **Error Handling**: Try-catch in command handlers, reply with user-friendly Vietnamese messages
- **Database**: Use parameterized queries ($1, $2) via pool from src/database/db.ts
- **Commands**: Both slash commands (src/commands/) and prefix commands (handler in src/handlers/)
- **Formatting**: 2-space indentation, single quotes for strings
- **Comments**: In Vietnamese matching the user-facing language of the bot

## Project Context
Discord RPG bot inspired by Dragon Ball, using PostgreSQL. Commands support both slash (/) and prefix (z) formats.
