# Golden Light Application

A Next.js product management UI for Golden Light, embedded as a section inside the client's RMS (no navbar/branding of its own — it inherits the host page's plain white chrome). It lets staff create, edit, and list regular and variant products (attributes, inventory, shipping, organization, images) and proxies all data operations to Windmill flows rather than talking to a database directly.

## How it works

- The UI (`app/page.tsx`) switches between a product list view and a create/edit view, backed by a Zustand store (`lib/store.ts`).
- All reads/writes go through `lib/api.ts`, which calls a single Next.js API route: `app/api/windmill/[flow]/route.ts`.
- That route maps a `flow` name (`lookups`, `attributes`, `listProducts`, `upsertProduct`, `deleteProduct`, `uploadImage`) to a Windmill flow path and forwards the request to the Windmill instance configured via environment variables, returning the flow's JSON result.
- Product forms are split by product type under `components/products/regular/` and `components/products/variant/`, with shared pieces (attribute/value pickers, image upload, shipping fields, etc.) in `components/products/shared/`.

## Getting Started

1. Copy `.env.local` (or create it) with the required Windmill connection variables:

   ```bash
   WINDMILL_BASE_URL=https://your-windmill-instance
   WINDMILL_WORKSPACE=your-workspace
   WINDMILL_TOKEN=your-token
   ```

2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm run start` — run the production build
- `npm run lint` — run ESLint

## Notes

> **This is not the Next.js you know.** This project pins a Next.js version with breaking API/convention changes from what most training data assumes. Before writing Next.js-specific code, check `node_modules/next/dist/docs/` for the relevant guide and heed any deprecation notices — see [AGENTS.md](AGENTS.md).
