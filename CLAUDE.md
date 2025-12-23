# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a **Turbo monorepo** managed with **pnpm** workspaces. The repository is organized into three main workspace types:

- `apps/*` - Application packages (currently empty)
- `packages/*` - Shared library packages (currently empty)
- `tooling/*` - Development tooling packages
  - `@tooling/configs` - Shared ESLint, Prettier, and TypeScript configurations
  - `@tooling/watcher` - Custom file watcher for development with automatic rebuilds

## Development Commands

All commands should be run from the repository root using pnpm and Turbo:

```bash
# Development with hot reload (starts dev servers)
pnpm dev

# Build all packages for production
pnpm build

# Build all packages for development (faster, used by watcher)
pnpm build:dev

# Start production builds
pnpm start

# Linting
pnpm lint          # Check for lint errors
pnpm lint:fix      # Fix auto-fixable lint errors

# Formatting
pnpm format        # Format code with Prettier
```

**Important**: All npm scripts use `dotenv-cli` to load environment variables via the `--env-mode=loose` flag.

## Environment Setup

- **Node.js**: >= 22 (see `.nvmrc` for exact version: 22.4.1)
- **pnpm**: 10.19.0 (exact version required)
- **Environment files**: Copy `.env.example` to `.env.local` for local development

## Code Style and Linting

All packages should extend the shared configurations from `@tooling/configs`:

### ESLint Rules (tooling/configs/eslint.js)
- **File naming**: kebab-case enforced (unicorn/filename-case), except for `.tsx`, `types/*.ts`, `web-components/*.ts`, and `*.context.ts` files
- **Naming conventions**:
  - Types/interfaces: PascalCase
  - Exported functions: PascalCase
  - Classes: PascalCase
- **Import restrictions**:
  - Never import from `bin/` directories
  - External `src/` imports blocked except for allowed packages (@packages/ui, @packages/dom-parser, @packages/dom-translator, @packages/language-switcher)
- **No console statements** except in `bin/` directories
- **Floating promises**: Must be handled (no-floating-promises)
- **Unused variables**: Prefix with `_` to ignore

### Prettier Configuration
- Single quotes, semicolons, 120 char line width
- Tabs: 2 spaces
- Auto-organizes imports via `prettier-plugin-organize-imports`

### TypeScript
- Target: ES2022
- Module: NodeNext
- Strict mode enabled with noUncheckedIndexedAccess
- Source maps and declarations generated

## Watcher Tool Architecture

The custom watcher (`@tooling/watcher`) provides development-time file watching with intelligent rebuild and restart logic:

### How It Works
1. Watches both source files and workspace dependencies
2. On source change: rebuilds the current package and restarts if build succeeds
3. On dependency change: optionally rebuilds, then restarts
4. Uses debouncing (500ms) to avoid excessive rebuilds
5. Supports per-package overrides for different behaviors

### Configuration (watcher.config.ts)
The watcher supports three workspace types with different behaviors:

- **`@apps`**: Apps with build + start commands, watches `@packages/` dependencies
  - Special handling for Next.js apps (hot reload, no rebuild on source change)
  - Can skip specific dependencies that are dynamically imported
- **`@integrations`**: Rebuilds on dependency changes, no start command
- **`@packages`**: Simple build-only, no dependencies watched

### Key Files
- `watcher.main.ts` - Entry point, sets up chokidar watchers and event handlers
- `watcher.config.ts` - Package-specific configurations and overrides
- `watcher.processes.ts` - Process management (build/start/stop)
- `utils/package.utils.ts` - Utilities for resolving package info and dependencies

## Turbo Configuration

Build pipeline configured in `turbo.json`:

- **Global dependencies**: All `.env.*local` files
- **Build outputs**: `dist/`, `.next/`, `src/api-client/generated/`
- **Task dependencies**:
  - `build` depends on upstream package builds (`^build`)
  - `dev` depends on `build:dev` completing first
  - Dev and start tasks are persistent (long-running)
  - Lint and format tasks don't use cache

## Adding New Packages

When adding new packages to `apps/`, `packages/`, or `tooling/`:

1. Create `package.json` with appropriate namespace (`@apps/`, `@packages/`, `@tooling/`)
2. Extend shared configs by depending on `@tooling/configs`
3. Add `.eslintrc.js` importing from `@tooling/configs/eslint.js`
4. Add `.prettierrc.js` importing from `@tooling/configs/.prettierrc.js`
5. Create `tsconfig.json` extending `@tooling/configs/tsconfig.json`
6. If using the watcher, ensure package name matches configured patterns in `watcher.config.ts`

## 1. Project Overview

This project is a "WoW Entity Editor," a tool designed to streamline the creation and modification of in-game entities (specifically **Spells** and **Items**) for World of Warcraft Wrath of the Lich King (client version: 3.3.5a).

**The Core Problem:**
Currently, modifying the game requires manual editing of client-side DBC (Data Base Client) files and separate execution of SQL queries for the server-side database. This leads to data mismatches and a poor developer experience.

**The Solution:**
This application serves as a unified interface that patches both:
1.  **Client-Side:** The binary `.dbc` files (Client Data).
2.  **Server-Side:** The SQL database (World Database).
