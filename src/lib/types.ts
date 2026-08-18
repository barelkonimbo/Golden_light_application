export interface AttributeValue {
  id: string;
  value: string;
}

export interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
}

/** Shared shape for the small named lookup lists (shipment types, categories, channels, ...). */
export interface NamedEntity {
  id: string;
  name: string;
}

export type ShipmentType = NamedEntity;
export type ProductCategory = NamedEntity;
export type ProductCollection = NamedEntity;
export type ProductTypeOption = NamedEntity;
export type ShippingProfile = NamedEntity;
export type SalesChannel = NamedEntity;

/** Medusa's literal seeded name for the auto-created default channel. Its
 *  price is just the top price field - it never gets its own channel-price
 *  row (see GeneralTab.tsx / VariantsTab.tsx). */
export const DEFAULT_SALES_CHANNEL_NAME = "Default Sales Channel";
export type ProductTag = NamedEntity;
export type Warehouse = NamedEntity;

export type ProductType = "simple" | "variant";

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  simple: "מוצר רגיל",
  variant: "מוצר עם וריאציות",
};

export type PublicationStatus = "draft" | "published" | "proposed" | "rejected";

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  draft: "טיוטה",
  published: "פורסם",
  proposed: "מוצע",
  rejected: "נדחה",
};

/** rms-media-plugin's MediaStatus enum (data/rms-media-plugin-main) - a
 *  separate status lifecycle from PublicationStatus, scoped to one
 *  AdditionalMediaItem rather than the product. */
export type MediaStatus =
  | "draft"
  | "submitted"
  | "review"
  | "revision"
  | "edited"
  | "approved"
  | "scheduled"
  | "published"
  | "archived"
  | "unpublished"
  | "rejected";

export const MEDIA_STATUS_LABELS: Record<MediaStatus, string> = {
  draft: "טיוטה",
  submitted: "נשלח",
  review: "בבדיקה",
  revision: "נדרש תיקון",
  edited: "נערך",
  approved: "מאושר",
  scheduled: "מתוזמן",
  published: "פורסם",
  archived: "בארכיון",
  unpublished: "הוסר מפרסום",
  rejected: "נדחה",
};

export interface Dimensions {
  weight: string;
  length: string;
  width: string;
  height: string;
}

export interface SimpleAttributeSelection {
  attributeId: string;
  valueIds: string[];
}

export interface VariantAttributeSelection {
  attributeId: string;
  selectedValueIds: string[];
  meantForVariants: boolean;
}

export interface ChannelPrice {
  channelId: string;
  price: string;
  /** True once the client has directly edited this channel's price - it then
   *  stops following the top price field. UI-only, ignore on the backend. */
  overridden?: boolean;
}

/** Stock-handling fields that live on whichever level actually gets sold: the
 *  product itself for a regular product, or each variant row for a product
 *  with variants. */
export interface StockHandling {
  managedInventory: boolean;
  allowBackorder: boolean;
}

export interface VariantRow extends StockHandling {
  id: string;
  sku: string;
  /** Optional override for this variant's Medusa title. Falls back to the
   *  auto-generated join of its option values when blank. */
  title?: string;
  /** attributeId -> valueId. An attribute flagged for variants may still be unset until chosen. */
  optionValues: Record<string, string>;
  status: PublicationStatus;
  price: string;
  stockQuantity: string;
  packageAmount: string;
  channelPrices: ChannelPrice[];
  imageUrls: string[];
  /** Which of this variant's own `imageUrls` is its main/thumbnail image.
   *  `null` falls back to the first image (mirrors ProductDraft.thumbnailUrl,
   *  see upsertProduct/flow.yaml). */
  thumbnailUrl: string | null;
  expanded: boolean;
}

export interface SimpleProductData extends Dimensions, StockHandling {
  price: string;
  sku: string;
  status: PublicationStatus;
  stockQuantity: string;
  packageAmount: string;
  warehouseId: string | null;
  shipmentTypeId: string | null;
  attributes: SimpleAttributeSelection[];
  channelPrices: ChannelPrice[];
}

export interface VariantProductData extends Dimensions {
  /** The parent product's Medusa `handle` - a product with variants has no
   *  product-level SKU (each variant has its own), only a handle. */
  handle: string;
  warehouseId: string | null;
  shipmentTypeId: string | null;
  attributes: VariantAttributeSelection[];
  variants: VariantRow[];
}

export interface ProductOrganization {
  discountable: boolean;
  typeId: string | null;
  collectionId: string | null;
  categoryIds: string[];
  tagIds: string[];
  shippingProfileId: string | null;
  salesChannelIds: string[];
}

export interface ProductDraft {
  name: string;
  description: string;
  imageUrls: string[];
  /** Which of `imageUrls` is the product's main/thumbnail image. `null` falls
   *  back to the first image (see upsertProduct/flow.yaml). Not applicable to
   *  variant-row images. */
  thumbnailUrl: string | null;
  productType: ProductType;
  simple: SimpleProductData;
  variant: VariantProductData;
  organization: ProductOrganization;
}

/** A saved product: the draft's content plus identity/list-view metadata. */
export interface Product extends ProductDraft {
  id: string;
  createdAt: string;
}

/** A row in a product's "additional media" gallery - PDFs, videos, extra
 *  images, etc. Product-scoped only (see rms-media-plugin), backed by its
 *  own RMS module entirely separate from Medusa's product `images[]`, so
 *  this isn't part of ProductDraft/saveDraft - it's fetched/mutated
 *  independently via the additionalMedia flow once a product has an id. */
export interface AdditionalMediaItem {
  id: string;
  fileName: string;
  alt: string | null;
  mediaType: string;
  extension: string;
  url: string;
  /** Widths (px) the media Lambda actually generated for this record - only
   *  set for image-type media. Used to derive a small thumbnail variant URL
   *  instead of loading the full-resolution original (see getThumbnailUrl). */
  mediaWidthArray: number[] | null;
  status: MediaStatus;
  position: number;
  createdAt: string;
}

export interface PaginatedProductsResponse {
  items: Product[];
  total: number;
}

/** A client-managed "related group" (e.g. "מוצרים מקושרים") - see
 *  rms-related-products plugin (data/rms-related-products-main). Groups
 *  themselves are created manually in RMS, not by this app; every group
 *  shows up on every product with `productsCount` defaulting to 0 until
 *  products are actually linked within it via the "manage" modal. */
export interface RelatedGroup {
  id: string;
  title: string;
  description: string | null;
  productsCount: number;
}

/** Minimal display info for a product referenced as a related-group member -
 *  not the full Product record, just enough to render a row in the manage
 *  modal (see relatedGroups/flow.yaml's getGroupItems). */
export interface RelatedProductSummary {
  id: string;
  title: string;
  thumbnailUrl: string | null;
}

/** One (other product, sales channel) link within a related group. The
 *  "Global (All Channels)" toggle seen in RMS is a pure UI convenience over
 *  a full set of these, never its own row - see relatedGroups/flow.yaml. */
export interface RelatedGroupItem {
  relatedProductId: string;
  salesChannelId: string;
}

export function productSku(product: ProductDraft): string {
  return product.productType === "simple" ? product.simple.sku : product.variant.handle;
}

export function productPriceLabel(product: ProductDraft): string {
  if (product.productType === "simple") {
    return product.simple.price ? `₪${product.simple.price}` : "—";
  }
  const prices = product.variant.variants
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  if (prices.length === 0) return "—";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `₪${min}` : `₪${min} – ₪${max}`;
}

export function productStatus(product: ProductDraft): PublicationStatus {
  if (product.productType === "simple") return product.simple.status;
  return product.variant.variants[0]?.status ?? "draft";
}