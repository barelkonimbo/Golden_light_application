import { ProductDraft, VariantRow } from "./types";

export function createInitialDraft(): ProductDraft {
  return {
    name: "",
    description: "",
    imageUrl: null,
    productType: "simple",
    simple: {
      price: "",
      sku: "",
      status: "draft",
      stockQuantity: "",
      packageAmount: "",
      warehouseId: null,
      managedInventory: false,
      allowBackorder: false,
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
      packageAmount: "",
      warehouseId: null,
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
      tagIds: [],
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
    status: "draft",
    price: "",
    stockQuantity: "",
    managedInventory: false,
    allowBackorder: false,
    imageUrl: null,
    channelPrices: [],
    expanded: true,
  };
}
