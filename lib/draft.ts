import { ProductDraft, VariantRow } from "./types";

export function createInitialDraft(): ProductDraft {
  return {
    name: "",
    description: "",
    imageUrls: [],
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

function generateId(prefix: string) {
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
    imageUrls: [],
    channelPrices: [],
    expanded: true,
  };
}

// Only fields that Medusa itself requires (or that would otherwise cause a
// broken/mismatched product on save) - not general business-preference
// fields like SKU/price, which Medusa accepts blank.
export function validateDraft(draft: ProductDraft): string[] {
  const errors: string[] = [];

  if (!draft.name.trim()) {
    errors.push("יש להזין שם מוצר");
  }

  if (draft.productType === "variant") {
    const variantForming = draft.variant.attributes.filter((selection) => selection.meantForVariants);

    if (variantForming.some((selection) => selection.selectedValueIds.length === 0)) {
      errors.push('יש לבחור לפחות ערך אחד לכל תכונה המסומנת כ"נועד עבור וריאציות"');
    }

    if (draft.variant.variants.length === 0) {
      errors.push("יש להוסיף לפחות וריאציה אחת");
    } else if (
      variantForming.length > 0 &&
      draft.variant.variants.some((row) =>
        variantForming.some((selection) => !row.optionValues[selection.attributeId])
      )
    ) {
      errors.push("יש לבחור ערך עבור כל תכונה בכל וריאציה");
    }
  }

  return errors;
}
