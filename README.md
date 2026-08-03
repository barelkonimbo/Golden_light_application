# Golden Light Application

A product management UI for Golden Light, embedded inside the client's RMS as an `application`-type custom widget: a sandboxed iframe pointing at a static build hosted on the client's S3/CloudFront (no navbar/branding of its own — it inherits the host page's plain white chrome). It lets staff create, edit, and list regular and variant products (attributes, inventory, shipping, organization, images) and proxies all data operations to Windmill flows rather than talking to a database directly.

Because that iframe is a sandboxed black box with no auth/context passed from the host RMS, the app is split into two independently deployed pieces:

- **Repo root** — a static Vite + React SPA. This is what gets built and uploaded to the client's S3 bucket.
- **`server/`** — a small, separate Next.js app containing only the Windmill-proxy API route. It holds the Windmill credentials and is deployed on its own (e.g. Vercel); the SPA calls it cross-origin.

## How it works

- The UI (`src/App.tsx`) switches between a product list view and a create/edit view, backed by a Zustand store (`src/lib/store.ts`).
- All reads/writes go through `src/lib/api.ts`, which calls the proxy at `${VITE_API_BASE_URL}/api/windmill/{flow}`.
- `server/app/api/windmill/[flow]/route.ts` maps a `flow` name (`lookups`, `attributes`, `listProducts`, `upsertProduct`, `deleteProduct`, `uploadImage`) to a Windmill flow path, forwards the request to the Windmill instance configured via environment variables, and returns the flow's JSON result. It adds CORS headers scoped to `CORS_ALLOWED_ORIGIN` since the SPA always calls it cross-origin.
- Product forms are split by product type under `src/components/products/regular/` and `src/components/products/variant/`, with shared pieces (attribute/value pickers, image upload, shipping fields, etc.) in `src/components/products/shared/`.

## Getting started

### SPA (repo root)

1. Create `.env.local`:

   ```bash
   VITE_API_BASE_URL=http://localhost:3000
   ```

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173).

### Proxy (`server/`)

1. Create `server/.env.local`:

   ```bash
   WINDMILL_BASE_URL=https://your-windmill-instance
   WINDMILL_WORKSPACE=your-workspace
   WINDMILL_TOKEN=your-token
   CORS_ALLOWED_ORIGIN=http://localhost:5173
   ```

2. Install and run (separate `node_modules`/lockfile from the root):

   ```bash
   cd server
   npm install
   npm run dev
   ```

3. It serves `http://localhost:3000/api/windmill/{flow}`.

## Scripts

**Root (SPA):**
- `npm run dev` — Vite dev server
- `npm run build` — type-check + build the static bundle to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — run ESLint

**`server/` (proxy):**
- `npm run dev` — Next.js dev server
- `npm run build` — build for production
- `npm run start` — run the production build
- `npm run lint` — run ESLint

## Deploying

- Build the root SPA (`npm run build`) and upload the contents of `dist/` to the client's S3 bucket under the app's designated subfolder, then register it as an `application`-type custom widget (see the client's `rms-custom-widgets-plugin`) pointing at that path. The SPA uses relative asset paths (`base: "./"` in `vite.config.ts`) specifically so it works from a subfolder, not just the bucket root.
- Deploy `server/` independently (e.g. as its own Vercel project with Root Directory set to `server/`), with `CORS_ALLOWED_ORIGIN` set to the deployed SPA's actual origin.

## Notes

> **`server/` is not the Next.js you know.** It pins a Next.js version with breaking API/convention changes from what most training data assumes. Before writing Next.js-specific code there, check `server/node_modules/next/dist/docs/` for the relevant guide and heed any deprecation notices — see [AGENTS.md](AGENTS.md). This no longer applies to the repo root, which is a plain Vite/React project.
