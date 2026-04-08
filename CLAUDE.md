# Shelf Starter Instructions

Shelf is the starter repository for the Self-Testing AI Agents course. Treat it as a real SvelteKit application, not a generated scaffold.

## Route structure

- Public routes live at `/`, `/login`, and `/design-system`.
- The protected app surface starts at `/search` and `/shelf`.
- Do not reintroduce demo routes or generated starter pages.
- New routes should match the Shelf product domain rather than generic examples.

## UI and component conventions

- Use the existing local component primitives in `src/lib/components`.
- Keep the visual direction functional, accessible, and course-friendly.
- Prefer semantic HTML and stable accessible names.
- Reuse the design-system page when introducing or adjusting starter UI primitives.
- Do not add an external component framework unless explicitly requested.

## Data and auth conventions

- Keep Better Auth and Drizzle as the starter foundation.
- The starter domain model is books plus shelf entries, not generic tasks.
- Protected routes should rely on `locals.user` and server-side redirects instead of client-side auth guards.

## What done means

Before reporting a change complete, run:

```sh
npm run typecheck
npm run lint
npm run test
```

If the change is isolated to one testing layer, name the exact command you ran.

## Intentional deferrals

The following are intentionally deferred in this starter phase:

- live Open Library integration
- shelf CRUD and persisted ratings
- HAR recording
- storage-state auth
- failure dossiers
- CI wiring
- custom MCP verification tools

Do not quietly add those systems unless the task explicitly asks for them.
