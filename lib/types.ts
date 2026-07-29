export interface AttributeValue {
  id: string;
  value: string;
}

export interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
}

export interface ShipmentType {
  id: string;
  name: string;
}

export type InventoryStatus = "in_stock" | "out_of_stock" | "backorder";

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  in_stock: "קיים במלאי",
  out_of_stock: "אזל מהמלאי",
  backorder: "בהזמנה מראש",
};

export type ProductType = "simple" | "variant";

export interface Dimensions {
  weight: string;
  length: string;
  width: string;
  height: string;
}

export interface SimpleAttributeSelection {
  attributeId: string;
  valueId: string | null;
}

export interface VariantAttributeSelection {
  attributeId: string;
  selectedValueIds: string[];
  meantForVariants: boolean;
}

export interface VariantRow {
  id: string;
  sku: string;
  optionValues: Record<string, string>;
  isActive: boolean;
  price: string;
  discountPrice: string;
  inventoryStatus: InventoryStatus;
  expanded: boolean;
}

export interface SimpleProductData extends Dimensions {
  price: string;
  discountPrice: string;
  sku: string;
  inventoryStatus: InventoryStatus;
  shipmentTypeId: string | null;
  attributes: SimpleAttributeSelection[];
}

export interface VariantProductData extends Dimensions {
  sku: string;
  shipmentTypeId: string | null;
  attributes: VariantAttributeSelection[];
  variants: VariantRow[];
}

export interface ProductDraft {
  name: string;
  description: string;
  productType: ProductType;
  simple: SimpleProductData;
  variant: VariantProductData;
}

/** A saved product: the draft's content plus identity/list-view metadata. */
export interface Product extends ProductDraft {
  id: string;
  categories: string[];
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
