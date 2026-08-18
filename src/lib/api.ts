/**
 * Frontend API client.
 *
 * The browser calls Windmill's flow webhooks directly (run_wait_result, so
 * each call waits for and returns the flow's actual JSON result rather than
 * just a job id). Each webhook URL below embeds its own auth token, so no
 * separate proxy or server-side secret is needed.
 *
 * Authentication flow:
 *
 * Browser -> Windmill flow webhook (token in URL) -> Medusa authentication node -> Medusa
 */

import {
  AdditionalMediaItem,
  Attribute,
  AttributeValue,
  MediaStatus,
  Product,
  PaginatedProductsResponse,
  ProductCategory,
  ProductCollection,
  ProductDraft,
  ProductTag,
  ProductTypeOption,
  RelatedGroup,
  RelatedGroupItem,
  RelatedProductSummary,
  SalesChannel,
  ShipmentType,
  ShippingProfile,
  Warehouse,
} from "./types";

const FLOW_URLS = {
  lookups:
    "https://flow.youleap.com/api/w/admins/jobs/run_wait_result/f/u/barelh/lookups_goldenlight?token=mctBvAnpLVCGx9oOPyy2t3vGkLDmDfRM",
  attributes:
    "https://flow.youleap.com/api/w/admins/jobs/run_wait_result/f/u/barelh/attributes_goldenlight_app?token=K7Zb6KXA47M3m24aaPoxStuIGfaQySlT",
  listProducts:
    "https://flow.youleap.com/api/w/admins/jobs/run_wait_result/f/u/barelh/list_products_goldenlight_app?token=173fJQW4DSOxK3yjZeHXqUIbyBw4F9Eo",
  upsertProduct:
    "https://flow.youleap.com/api/w/admins/jobs/run_wait_result/f/u/barelh/upsert_product_goldenlight?token=7Hf5EfYP8IUCjNsFsbvvGqUoUNdLIZqr",
  deleteProduct:
    "https://flow.youleap.com/api/w/admins/jobs/run_wait_result/f/u/barelh/delete_product_goldenlight_app?token=WxEohZmJsWOQCj2GTSMLFR2vkScrLwJR",
  uploadImage:
    "https://flow.youleap.com/api/w/admins/jobs/run_wait_result/f/u/barelh/upload_image_goldenlight_app?token=Ox0sDorLlA8pPFUrSvHqbavazegBHxSr",
  additionalMedia:
    "https://flow.youleap.com/api/w/admins/jobs/run_wait_result/f/u/barelh/additional_media_goldenlight?token=ylbiKNLeUOFGJoT55pm5q3kNg2Qql8L5",
  relatedGroups:
    "https://flow.youleap.com/api/w/admins/jobs/run_wait_result/f/u/barelh/related_groups_goldenlight?token=DF6ywdPXe1FVfuduyqQY2ThIkBYh0b4p",
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
 * Calls a Windmill flow's webhook directly.
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

// -----------------------------------------------------------------------------
// Additional media (product-scope PDFs/videos/extra images - see
// golden_light_application_flows/additionalMedia/flow.yaml and
// data/rms-media-plugin-main)
// -----------------------------------------------------------------------------

/** Mirrors data/rms-media-plugin-main's ALLOWED_MIME_TYPES - the server is the
 *  real authority, this is just a friendly client-side pre-check so a
 *  rejected file fails fast with a clear message instead of a round trip. */
export const ADDITIONAL_MEDIA_ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,image/heic,image/svg+xml," +
  "application/pdf,application/msword," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
  "application/vnd.ms-excel," +
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet," +
  "text/csv,text/plain," +
  "video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska,video/x-ms-wmv,video/x-m4v," +
  "audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac";

export const listAdditionalMedia = (productId: string): Promise<AdditionalMediaItem[]> =>
  callFlow<AdditionalMediaItem[]>("additionalMedia", {
    op: "list",
    productId,
  });

export async function uploadAdditionalMedia(
  productId: string,
  file: File
): Promise<AdditionalMediaItem> {
  if (!file) {
    throw new Error("לא נבחר קובץ.");
  }

  const dataBase64 = await fileToBase64(file);

  return callFlow<AdditionalMediaItem>("additionalMedia", {
    op: "upload",
    productId,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    dataBase64,
  });
}

export const updateAdditionalMediaStatus = (
  id: string,
  status: MediaStatus
): Promise<AdditionalMediaItem> =>
  callFlow<AdditionalMediaItem>("additionalMedia", {
    op: "updateStatus",
    id,
    status,
  });

export const deleteAdditionalMedia = (id: string): Promise<{ success: true }> =>
  callFlow<{ success: true }>("additionalMedia", {
    op: "delete",
    id,
  });

// -----------------------------------------------------------------------------
// Related groups (product-scope cross-links into client-managed groups - see
// golden_light_application_flows/relatedGroups/flow.yaml and
// data/rms-related-products-main)
// -----------------------------------------------------------------------------

export const listRelatedGroups = (productId: string): Promise<RelatedGroup[]> =>
  callFlow<RelatedGroup[]>("relatedGroups", {
    op: "listGroups",
    productId,
  });

export const getRelatedGroupItems = (
  productId: string,
  groupId: string
): Promise<{ items: RelatedGroupItem[]; products: RelatedProductSummary[] }> =>
  callFlow<{ items: RelatedGroupItem[]; products: RelatedProductSummary[] }>("relatedGroups", {
    op: "getGroupItems",
    productId,
    groupId,
  });

export const syncRelatedGroupItems = (
  productId: string,
  groupId: string,
  items: RelatedGroupItem[]
): Promise<{ success: true }> =>
  callFlow<{ success: true }>("relatedGroups", {
    op: "sync",
    productId,
    groupId,
    items,
  });