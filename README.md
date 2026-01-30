# Pastebin Lite

A simple, secure, and robust pastebin application built with Next.js 14.

## Features
- **Create Pastes**: Share arbitrary text.
- **Constraints**: Set Time-to-Live (TTL) or Maximum View limits.
- **Secure**: Robust storage abstraction and safe rendering.
- **API**: Full REST API for creating and fetching pastes.

## Getting Started

### Prerequisites
- Node.js 18+
- NPM

### Installation
1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd pastebin-lite
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables
For local development, the app uses an **In-Memory Store** by default. Data will be lost on restart.

To use **Vercel KV (Redis)** for persistence:
1.  Create a project on [Vercel](https://vercel.com).
2.  Create a KV Database.
3.  Copy the environment variables to `.env.local`:
    ```env
    KV_REST_API_URL="https://..."
    KV_REST_API_TOKEN="Ag..."
    ```

### Testing Mode
The application supports deterministic time testing. To use it:
1.  Set `TEST_MODE=1` in your environment.
2.  Send requests with the `x-test-now-ms` header (valid unix timestamp in ms).
    The application will use this timestamp for expiry logic instead of system time.

## Design Decisions

### Tech Stack
-   **Next.js 14 (App Router)**: Chosen for its robust routing, server components, and API route capabilities.
-   **Tailwind CSS**: Used for rapid, modern UI development.
-   **Zod**: Used for strict input validation on the API layer.

### Persistence Layer
I implemented a **Storage Abstraction Layer** (`lib/storage.ts`) that supports two backends:
1.  **In-Memory (Map)**: Used for local development to ensure the app works immediately without external dependencies.
2.  **Vercel KV (Redis)**: Recommended for production/serverless deployment to ensure state persistence across lambdas.

The switch is handled automatically: if `KV_REST_API_URL` is detected, it upgrades to Redis.

### Concurrency & View Counting
To handle the `max_views` constraint, the application performs an atomic increment (or check-then-increment in memory).
-   If `max_views` is 1, the first fetch (API or UI) consumes the view. Subsequent fetches return 404.
-   This ensures expired or exhausted pastes are strictly unavailable.

### Security
-   Content is rendered in a strictly read-only manner using React for HTML escaping.
-   Inputs are validated using Zod schemas.
