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

export type ProductType = "simple" | "variant";

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
  discountPrice: string;
}

export interface VariantRow {
  id: string;
  sku: string;
  /** attributeId -> valueId. An attribute flagged for variants may still be unset until chosen. */
  optionValues: Record<string, string>;
  isActive: boolean;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  channelPrices: ChannelPrice[];
  expanded: boolean;
}

export interface SimpleProductData extends Dimensions {
  price: string;
  discountPrice: string;
  sku: string;
  isActive: boolean;
  stockQuantity: string;
  shipmentTypeId: string | null;
  attributes: SimpleAttributeSelection[];
  channelPrices: ChannelPrice[];
}

export interface VariantProductData extends Dimensions {
  sku: string;
  shipmentTypeId: string | null;
  attributes: VariantAttributeSelection[];
  variants: VariantRow[];
}

export interface ProductOrganization {
  discountable: boolean;
  typeId: string | null;
  collectionId: string | null;
  categoryIds: string[];
  tags: string[];
  shippingProfileId: string | null;
  salesChannelIds: string[];
}

export interface ProductDraft {
  name: string;
  description: string;
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

export function productSku(product: ProductDraft): string {
  return product.productType === "simple" ? product.simple.sku : product.variant.sku;
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
