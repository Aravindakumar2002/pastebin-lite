# Implementation Plan - Pastebin Lite

Goal: Build a "Pastebin"-like application where users can create text pastes with optional expiration (TTL) and view limits.

## User Review Required
> [!IMPORTANT]
> The application uses an abstraction for storage. By default, it will use **In-Memory** storage for local development if Vercel KV credentials are not provided. This means data is lost on server restart locally. For production (Vercel), you must set up a Vercel KV store and link it.

## Proposed Changes

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Storage**: Abstracted (Memory / Redis via `@vercel/kv`)

### Directory Structure
```
/app
  /api
    /healthz/route.ts      # GET Health check
    /pastes
      /route.ts            # POST Create paste
      /[id]/route.ts       # GET Fetch paste (JSON)
  /p
    /[id]/page.tsx         # View paste (HTML)
  page.tsx                 # Create paste UI
/lib
  storage.ts               # Storage interface and implementations
  utils.ts                 # Helper functions
  types.ts                 # Shared types
```

### Storage Layer (`lib/storage.ts`)
We will define a `Storage` interface:
- `createPaste(content, ttl?, maxViews?): Promise<string>` (returns ID)
- `getPaste(id): Promise<Paste | null>`
- `incrementView(id): Promise<void>`? -> Actually `getPaste` might handle view counting or we separate it. To ensure atomicity with Redis, we might need a Lua script or careful transaction. For simplicity, we'll try to use atomic increments if possible, or just accept slight race conditions if acceptable, but "robustness" requirement suggests we should affect the count.
*Refinement*: `getPaste` should probably just return the data. We need a way to atomicaly "get and decrement" or "get and increment view count".
Redis `INCR` is atomic.
Revised Interface:
- `savePaste(paste): Promise<void>`
- `getPasteWithSideEffects(id): Promise<Paste | null>` -> Handles view count decrement/increment.

### API Logic
- **Creating**:
  - Validate input.
  - Generate short ID (nanoid or random string).
  - Save to store.
  - Return URL.
- **Fetching**:
  - Check `x-test-now-ms` for current time vs `expires_at`.
  - Check `max_views` vs `views_count`.
  - Update `views_count`.
  - Return data or 404.

### Frontend
- **Home**: Simple textarea + options (TTL, Max Views).
- **View**: Server Component that fetches data (calling the internal logic or API). *Wait*, the requirements say `GET /p/:id` returns HTML. Next.js App Router Server Components handle this naturally.

## Verification Plan
### Automated Tests
- We will rely on the user's grading script, but we can verify locally with curl or a script.
- `curl http://localhost:3000/api/healthz`
- Create paste and check response.
- Verify `TEST_MODE` logic by sending the header.

### Manual Verification
- Open in browser, create paste.
- Share link.
- Check expiration.
