# Golden Light Application

A product management UI for Golden Light, embedded inside the client's RMS as an `application`-type custom widget: a sandboxed iframe pointing at a static build hosted on the client's S3/CloudFront (no navbar/branding of its own — it inherits the host page's plain white chrome). It lets staff create, edit, and list regular and variant products (attributes, inventory, shipping, organization, images) and proxies all data operations to Windmill flows rather than talking to a database directly.

The app is a single static Vite + React SPA. It calls Windmill's flow webhooks directly from the browser — each webhook URL embeds its own auth token, so there's no separate proxy/server deployment or server-side secret to manage.

## How it works

- The UI (`src/App.tsx`) switches between a product list view and a create/edit view, backed by a Zustand store (`src/lib/store.ts`).
- All reads/writes go through `src/lib/api.ts`, which calls the Windmill webhook URLs in `FLOW_URLS` directly (`lookups`, `attributes`, `listProducts`, `upsertProduct`, `deleteProduct`, `uploadImage`), using the `run_wait_result` endpoint so each call waits for and returns the flow's actual JSON result.
- Product forms are split by product type under `src/components/products/regular/` and `src/components/products/variant/`, with shared pieces (attribute/value pickers, image upload, shipping fields, etc.) in `src/components/products/shared/`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — type-check + build the static bundle to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — run ESLint

## Deploying

Build the SPA (`npm run build`) and upload the contents of `dist/` to the client's S3 bucket under the app's designated subfolder, then register it as an `application`-type custom widget (see the client's `rms-custom-widgets-plugin`) pointing at that path. The SPA uses relative asset paths (`base: "./"` in `vite.config.ts`) specifically so it works from a subfolder, not just the bucket root.
