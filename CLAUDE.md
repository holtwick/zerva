# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build all packages
pnpm -r build

# Build single package
cd zerva-http && npx tsdown src/index.ts

# Test all packages
pnpm -r test

# Test single package
cd zerva-vite && npx vitest run

# Run single test file
npx vitest run src/module.spec.ts

# Lint
pnpm lint
pnpm lint:fix

# Release (bump versions, build, publish)
pnpm release
```

## Architecture

Zerva is a **minimal event-driven web service framework** organized as a pnpm monorepo.

### Module System

Every feature is a **module** — a function that hooks into a shared global **context** (event bus). Modules are defined with the `use()` factory:

```ts
export const useMyModule = use({
  name: 'myModule',
  requires: ['http'],           // declares dependencies on other modules
  configSchema: z.object({...}), // zod schema, also reads env vars (PREFIX_KEY)
  setup({ config, log, on, emit }) {
    on('httpInit', ({ GET }) => { ... })
    return { /* public API */ }
  },
})
```

### Lifecycle Events (in order)

`serveInit` → `serveStart` → `serveStop` → `serveDispose`

The HTTP module adds its own events within this lifecycle:

- `serveInit`: emits `httpInit` (register routes here)
- `serveStart`: emits `httpWillStart` (late middleware), then `httpRunning`
- `serveStop`: emits `httpStop`, then `httpDidStop`

### Key Packages

| Package | Role |
|---------|------|
| `zerva-core` | Context, event bus, `use()`, `on()`, `emit()`, lifecycle (`serve`/`serveStop`) |
| `zerva-http` | Express server, routes (`GET`/`POST`/...), `STATIC`, security, compression |
| `zerva-vite` | Vite dev server (development) + static file serving (production) |
| `zerva-bin` | CLI tool `zerva` — runs/builds Zerva apps via esbuild |
| `zerva-websocket` | WebSocket support via `ws` |
| `zerva-rpc` | RPC over WebSocket |

### Build Globals

`ZERVA_DEVELOPMENT` and `ZERVA_PRODUCTION` are compile-time globals injected by esbuild (via `zerva-bin`). Use them for conditional code that should be tree-shaken in the other mode.

### Conventions

- Module names: `useX()` prefix (e.g. `useHttp`, `useVite`)
- Each package exports from `src/index.ts`
- Packages build with `tsdown` to both ESM and CJS (`dist/index.mjs` + `dist/index.cjs`)
- Tests use Vitest with `globals: true` (no imports needed for `describe`/`it`/`expect`)
- Tests run single-threaded (`singleThread: true`)
- Shared tsdown config at repo root, packages inherit it
- `zeed` library provides logging (`Logger`), utilities, and the `z` schema (zod-compatible)
- Language: German for user communication, English for code/comments
