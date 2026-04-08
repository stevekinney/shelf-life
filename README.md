# Shelf

Shelf is the starter SvelteKit application for the **Self-Testing AI Agents** course. This repository now starts from a real book-app shell instead of the generated scaffold, with a protected app surface, starter design system, Better Auth integration, and local testing foundations.

## Starter routes

- `/`: public home page
- `/login`: app-native email and password authentication
- `/search`: protected starter search surface backed by local placeholder data
- `/shelf`: protected shelf shell with starter summary and empty states
- `/design-system`: component gallery and visual-regression target

## What is intentionally not built yet

This is a strong starter foundation, not the finished app.

The following are intentionally deferred to later course exercises:

- live Open Library search integration
- shelf CRUD flows and persisted ratings
- stats, goals, and admin features
- HAR recording
- storage-state auth for Playwright
- failure dossiers
- CI wiring
- custom verification MCP tools

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

```sh
cp .env.example .env
```

Required variables:

- `DATABASE_URL`
- `ORIGIN`
- `BETTER_AUTH_SECRET`

The local `.env` file in this repository is set up for development with a local SQLite database.

## Local development

Install dependencies with npm:

```sh
npm install
```

Generate the Better Auth schema if needed:

```sh
npm run auth:schema
```

Start the development server:

```sh
npm run dev
```

## Verification commands

Run these before considering a change complete:

```sh
npm run typecheck
npm run lint
npm run test
```

If you only need one layer:

```sh
npm run test:unit
npm run test:e2e
```

## Testing notes

- Unit tests run with Vitest.
- End-to-end tests run with Playwright from `tests/end-to-end`.
- End-to-end tests provision the local SQLite schema with `npm run db:push` before launching Playwright.
- The initial screenshot baseline lives in the Playwright snapshot output for `/design-system`.

## Project direction

See [ROADMAP.md](./ROADMAP.md) for the phase-by-phase evolution of Shelf across the course materials.
