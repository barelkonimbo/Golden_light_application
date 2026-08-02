/**
 * Frontend API client.
 *
 * The browser never calls Windmill directly. All requests are sent to the
 * Next.js API proxy under /api/windmill/[flow].
 *
 * Authentication flow:
 *
 * Browser
 *   -> Next.js API route
 *   -> authenticated Windmill flow
 *   -> Medusa authentication node
 *   -> Medusa
 */

import {
  Attribute,
  AttributeValue,
  Product,
  PaginatedProductsResponse,
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
  lookups: "/api/windmill/lookups",
  attributes: "/api/windmill/attributes",
  listProducts: "/api/windmill/listProducts",
  upsertProduct: "/api/windmill/upsertProduct",
  deleteProduct: "/api/windmill/deleteProduct",
  uploadImage: "/api/windmill/uploadImage",
} as const;

type FlowName = keyof typeof FLOW_URLS;

interface ApiErrorResponse {
  error?: string;
  details?: unknown;
  upstreamStatus?: number;
}

/**
 * Thrown by callFlow() for any failure talking to the Windmill proxy
 * (network failure, non-OK response, invalid JSON). Carries the raw
 * technical detail for logging, but is recognized by lib/errors.ts's
 * toFriendlyMessage() so the UI never surfaces it directly to the client.
 */
export class ApiError extends Error {
  kind: "network" | "http";
  /** The upstream error text (Windmill/Medusa), as clean as it could be
   *  extracted - never shown to the client directly, only pattern-matched by
   *  lib/errors.ts's toFriendlyMessage() to recognize known validation
   *  failures (duplicate SKU, invalid handle, etc.) worth telling the
   *  merchant about specifically. */
  detail: string;

  constructor(kind: "network" | "http", message: string, detail = "") {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.detail = detail;
  }
}

/**
 * Windmill wraps a failed flow's error as `{name, stack, message, step_id}`,
 * and the flow itself often further wraps a raw upstream HTTP failure as
 * `"<label>: <status> <json>"` inside that `message` (e.g. `RMS batch create
 * failed: 400 {"type":"invalid_data","message":"..."}`). This digs through
 * both wrapping layers to find the innermost human-readable message, falling
 * back to whatever text it did manage to extract.
 */
function extractDetailMessage(details: unknown): string {
  let text: string;

  if (typeof details === "string") {
    text = details;
  } else if (details && typeof details === "object") {
    const asRecord = details as Record<string, unknown>;
    text =
      (typeof asRecord.message === "string" && asRecord.message) ||
      (typeof asRecord.error === "string" && asRecord.error) ||
      JSON.stringify(details);
  } else {
    text = String(details);
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const inner = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      if (typeof inner.message === "string") return inner.message;
    } catch {
      // The embedded braces weren't valid JSON - fall through to the raw text.
    }
  }

  return text;
}

/**
 * Calls a Windmill flow through the Next.js server-side proxy.
 */
async function callFlow<T>(
  flow: FlowName,
  payload: unknown = {}
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(FLOW_URLS[flow], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(
      "network",
      `Flow "${flow}" could not be reached: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = responseText;
    let detail = "";

    try {
      const parsed = JSON.parse(responseText) as ApiErrorResponse;

      detail = extractDetailMessage(parsed.details ?? parsed.error ?? parsed);
      errorMessage = parsed.error ?? detail;
    } catch {
      // The upstream response was not JSON.
      detail = responseText;
    }

    throw new ApiError(
      "http",
      `Flow "${flow}" failed with status ${response.status}: ${errorMessage}`,
      detail
    );
  }

  if (!responseText) {
    return undefined as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new ApiError(
      "http",
      `Flow "${flow}" returned an invalid JSON response: ${responseText.slice(
        0,
        500
      )}`
    );
  }
}

// -----------------------------------------------------------------------------
// Lookups
// -----------------------------------------------------------------------------

export const listCategories = (): Promise<ProductCategory[]> =>
  callFlow<ProductCategory[]>("lookups", {
    resource: "categories",
  });

export const listCollections = (): Promise<ProductCollection[]> =>
  callFlow<ProductCollection[]>("lookups", {
    resource: "collections",
  });

export const listProductTypes = (): Promise<ProductTypeOption[]> =>
  callFlow<ProductTypeOption[]>("lookups", {
    resource: "productTypes",
  });

export const listShippingProfiles = (): Promise<ShippingProfile[]> =>
  callFlow<ShippingProfile[]>("lookups", {
    resource: "shippingProfiles",
  });

export const listSalesChannels = (): Promise<SalesChannel[]> =>
  callFlow<SalesChannel[]>("lookups", {
    resource: "salesChannels",
  });

export const listTags = (): Promise<ProductTag[]> =>
  callFlow<ProductTag[]>("lookups", {
    resource: "tags",
  });

export const listWarehouses = (): Promise<Warehouse[]> =>
  callFlow<Warehouse[]>("lookups", {
    resource: "warehouses",
  });

export const listShipmentTypes = (): Promise<ShipmentType[]> =>
  callFlow<ShipmentType[]>("lookups", {
    resource: "shipmentTypes",
  });

// -----------------------------------------------------------------------------
// Attributes
// -----------------------------------------------------------------------------

export const listAttributes = (): Promise<Attribute[]> =>
  callFlow<Attribute[]>("attributes", {
    op: "list",
  });

export const createAttribute = (
  name: string,
  values: string[]
): Promise<Attribute> =>
  callFlow<Attribute>("attributes", {
    op: "create",
    name,
    values,
  });

export const addAttributeValues = (
  attributeId: string,
  values: string[]
): Promise<AttributeValue[]> =>
  callFlow<AttributeValue[]>("attributes", {
    op: "addValues",
    attributeId,
    values,
  });

export const deleteAttributeValue = (
  attributeId: string,
  valueId: string
): Promise<{ success: true }> =>
  callFlow<{ success: true }>("attributes", {
    op: "deleteValue",
    attributeId,
    valueId,
  });

export const deleteAttribute = (
  attributeId: string
): Promise<{ success: true }> =>
  callFlow<{ success: true }>("attributes", {
    op: "deleteAttribute",
    attributeId,
  });

// -----------------------------------------------------------------------------
// Products
// -----------------------------------------------------------------------------

export interface ListProductsFilters {
  categoryId?: string;
  status?: string;
  productType?: string;
}

export const listProducts = (
  page = 1,
  limit = 25,
  search = "",
  filters: ListProductsFilters = {}
): Promise<PaginatedProductsResponse> =>
  callFlow<PaginatedProductsResponse>("listProducts", {
    page,
    limit,
    search,
    categoryId: filters.categoryId ?? "",
    status: filters.status ?? "",
    productType: filters.productType ?? "",
  });

export const createProduct = (
  draft: ProductDraft
): Promise<Product> =>
  callFlow<Product>("upsertProduct", draft);

export const updateProduct = (
  product: Product
): Promise<Product> =>
  callFlow<Product>("upsertProduct", product);

export const deleteProduct = (
  id: string
): Promise<{ success: true }> =>
  callFlow<{ success: true }>("deleteProduct", {
    id,
  });

// -----------------------------------------------------------------------------
// Images
// -----------------------------------------------------------------------------

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("לא ניתן היה לעבד את הקובץ שנבחר."));
        return;
      }

      const commaIndex = reader.result.indexOf(",");

      if (commaIndex === -1) {
        reject(new Error("לא ניתן היה לעבד את הקובץ שנבחר."));
        return;
      }

      resolve(reader.result.slice(commaIndex + 1));
    };

    reader.onerror = () => {
      reject(new Error("קריאת הקובץ שנבחר נכשלה."));
    };

    reader.readAsDataURL(file);
  });
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!file) {
    throw new Error("לא נבחר קובץ תמונה.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("הקובץ שנבחר אינו תמונה.");
  }

  const dataBase64 = await fileToBase64(file);

  const result = await callFlow<{ url: string }>("uploadImage", {
    fileName: file.name,
    mimeType: file.type,
    dataBase64,
  });

  if (!result?.url) {
    throw new Error("העלאת התמונה לא החזירה כתובת תמונה תקינה.");
  }

  return result.url;
}