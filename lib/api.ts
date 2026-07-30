/**
 * All calls from the frontend to Medusa go through Windmill flows. There are
 * 6 flows backing this file (see the flows spec doc): `lookups` and
 * `attributes` are each one flow that handles several related operations,
 * distinguished by a query param on the URL; `listProducts`, `upsertProduct`,
 * `deleteProduct` and `uploadImage` are each their own flow.
 *
 * Once a flow is built and deployed in Windmill, it gives you a URL — paste
 * it into the matching entry in FLOW_URLS below and every function that uses
 * it starts working. Nothing else needs to change.
 *
 * Credentials for Medusa/RMS live inside the flows themselves (Windmill
 * variables/resources), not here — these URLs are just endpoints to call.
 *
 * See the flows spec doc for the exact request/response shape each flow must
 * implement, including exactly which query param value each operation uses.
 */

import {
  Attribute,
  AttributeValue,
  Product,
  ProductCategory,
  ProductCollection,
  ProductDraft,
  ProductTag,
  ProductTypeOption,
  SalesChannel,
  ShipmentType,
  ShippingProfile,
  Warehouse,
} from "./types";

const FLOW_URLS = {
  lookups: "https://flow.youleap.com/api/w/admins/jobs/run/f/u/barelh/lookups_goldenlight",
  attributes: "https://flow.youleap.com/api/w/admins/jobs/run/f/u/barelh/attributes_goldenlight_app",
  listProducts: "https://flow.youleap.com/api/w/admins/jobs/run/f/u/barelh/list_products_goldenlight_app",
  upsertProduct: "https://flow.youleap.com/api/w/admins/jobs/run/f/u/barelh/upsert_product_goldenlight",
  deleteProduct: "https://flow.youleap.com/api/w/admins/jobs/run/f/u/barelh/delete_product_goldenlight_app",
  uploadImage: "https://flow.youleap.com/api/w/admins/jobs/run/f/u/barelh/upload_image_goldenlight_app",
};

function flowUrl(flow: keyof typeof FLOW_URLS, query?: Record<string, string>): string {
  const base = FLOW_URLS[flow];
  if (!base) {
    throw new Error(
      `No URL set for "${flow}" yet. Paste the URL Windmill gives you after deploying this ` +
        `flow into FLOW_URLS in lib/api.ts.`
    );
  }
  if (!query) return base;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${new URLSearchParams(query).toString()}`;
}

async function callFlow<T>(url: string, payload: unknown = {}): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Flow call failed: ${response.status} ${text}`);
  }

  return response.json();
}

// ---- Lookups (all served by the one "lookups" flow, routed by ?resource=) ----

export const listCategories = () =>
  callFlow<ProductCategory[]>(flowUrl("lookups", { resource: "categories" }));
export const listCollections = () =>
  callFlow<ProductCollection[]>(flowUrl("lookups", { resource: "collections" }));
export const listProductTypes = () =>
  callFlow<ProductTypeOption[]>(flowUrl("lookups", { resource: "productTypes" }));
export const listShippingProfiles = () =>
  callFlow<ShippingProfile[]>(flowUrl("lookups", { resource: "shippingProfiles" }));
export const listSalesChannels = () =>
  callFlow<SalesChannel[]>(flowUrl("lookups", { resource: "salesChannels" }));
export const listTags = () => callFlow<ProductTag[]>(flowUrl("lookups", { resource: "tags" }));
export const listWarehouses = () =>
  callFlow<Warehouse[]>(flowUrl("lookups", { resource: "warehouses" }));
export const listShipmentTypes = () =>
  callFlow<ShipmentType[]>(flowUrl("lookups", { resource: "shipmentTypes" }));

// ---- Attributes (all served by the one "attributes" flow, routed by ?op=) ----

export const listAttributes = () => callFlow<Attribute[]>(flowUrl("attributes", { op: "list" }));

export const createAttribute = (name: string, values: string[]) =>
  callFlow<Attribute>(flowUrl("attributes", { op: "create" }), { name, values });

export const addAttributeValue = (attributeId: string, value: string) =>
  callFlow<AttributeValue>(flowUrl("attributes", { op: "addValue" }), { attributeId, value });

export const deleteAttributeValue = (attributeId: string, valueId: string) =>
  callFlow<{ success: true }>(flowUrl("attributes", { op: "deleteValue" }), { attributeId, valueId });

// ---- Products ----

export const listProducts = () => callFlow<Product[]>(flowUrl("listProducts"));

// create and update share one "upsertProduct" flow — the flow tells them
// apart by whether the payload has an "id" (see flows spec doc).
export const createProduct = (draft: ProductDraft) => callFlow<Product>(flowUrl("upsertProduct"), draft);
export const updateProduct = (product: Product) => callFlow<Product>(flowUrl("upsertProduct"), product);

export const deleteProduct = (id: string) =>
  callFlow<{ success: true }>(flowUrl("deleteProduct"), { id });

// ---- Images ----

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the "data:<mime>;base64," prefix — the flow gets raw base64 + mimeType separately
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function uploadProductImage(file: File): Promise<string> {
  const dataBase64 = await fileToBase64(file);
  const { url } = await callFlow<{ url: string }>(flowUrl("uploadImage"), {
    fileName: file.name,
    mimeType: file.type,
    dataBase64,
  });
  return url;
}
