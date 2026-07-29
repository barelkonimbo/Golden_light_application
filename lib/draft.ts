import { ProductDraft, VariantRow } from "./types";

export function createInitialDraft(): ProductDraft {
  return {
    name: "",
    description: "",
    productType: "simple",
    simple: {
      price: "",
      discountPrice: "",
      sku: "",
      isActive: true,
      stockQuantity: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      shipmentTypeId: null,
      attributes: [],
      channelPrices: [],
    },
    variant: {
      sku: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      shipmentTypeId: null,
      attributes: [],
      variants: [],
    },
    organization: {
      discountable: true,
      typeId: null,
      collectionId: null,
      categoryIds: [],
      tags: [],
      shippingProfileId: null,
      salesChannelIds: [],
    },
  };
}

export function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyVariantRow(): VariantRow {
  return {
    id: generateId("variant"),
    sku: "",
    optionValues: {},
    isActive: true,
    price: "",
    discountPrice: "",
    stockQuantity: "",
    channelPrices: [],
    expanded: true,
  };
}
