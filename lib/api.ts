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
 * Calls a Windmill flow through the Next.js server-side proxy.
 */
async function callFlow<T>(
  flow: FlowName,
  payload: unknown = {}
): Promise<T> {
  const response = await fetch(FLOW_URLS[flow], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = responseText;

    try {
      const parsed = JSON.parse(responseText) as ApiErrorResponse;

      errorMessage =
        parsed.error ??
        (typeof parsed.details === "string"
          ? parsed.details
          : JSON.stringify(parsed.details ?? parsed));
    } catch {
      // The upstream response was not JSON.
    }

    throw new Error(
      `Flow "${flow}" failed with status ${response.status}: ${errorMessage}`
    );
  }

  if (!responseText) {
    return undefined as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error(
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

// -----------------------------------------------------------------------------
// Products
// -----------------------------------------------------------------------------

export const listProducts = (
  page = 1,
  limit = 25,
  search = ""
): Promise<PaginatedProductsResponse> =>
  callFlow<PaginatedProductsResponse>("listProducts", {
    page,
    limit,
    search,
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
        reject(new Error("The selected file could not be converted to Base64."));
        return;
      }

      const commaIndex = reader.result.indexOf(",");

      if (commaIndex === -1) {
        reject(new Error("The generated Base64 data URL is invalid."));
        return;
      }

      resolve(reader.result.slice(commaIndex + 1));
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("The selected file could not be read."));
    };

    reader.readAsDataURL(file);
  });
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!file) {
    throw new Error("No image file was selected.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("The selected file is not an image.");
  }

  const dataBase64 = await fileToBase64(file);

  const result = await callFlow<{ url: string }>("uploadImage", {
    fileName: file.name,
    mimeType: file.type,
    dataBase64,
  });

  if (!result?.url) {
    throw new Error("The upload flow did not return an image URL.");
  }

  return result.url;
}