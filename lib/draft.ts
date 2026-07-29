import { ProductDraft, VariantAttributeSelection, VariantRow } from "./types";

export function createInitialDraft(): ProductDraft {
  return {
    name: "",
    description: "",
    productType: "simple",
    simple: {
      price: "",
      discountPrice: "",
      sku: "",
      inventoryStatus: "in_stock",
      weight: "",
      length: "",
      width: "",
      height: "",
      shipmentTypeId: null,
      attributes: [],
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
  };
}

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Cartesian product of the values selected on attributes flagged "meant for variants". */
export function generateVariantRows(
  attributes: VariantAttributeSelection[],
  existing: VariantRow[]
): VariantRow[] {
  const variantAttributes = attributes.filter(
    (attribute) => attribute.meantForVariants && attribute.selectedValueIds.length > 0
  );

  if (variantAttributes.length === 0) return existing;

  let combinations: Record<string, string>[] = [{}];
  for (const attribute of variantAttributes) {
    const next: Record<string, string>[] = [];
    for (const combination of combinations) {
      for (const valueId of attribute.selectedValueIds) {
        next.push({ ...combination, [attribute.attributeId]: valueId });
      }
    }
    combinations = next;
  }

  const existingKeys = new Set(existing.map((row) => JSON.stringify(row.optionValues)));

  const newRows: VariantRow[] = combinations
    .filter((combination) => !existingKeys.has(JSON.stringify(combination)))
    .map((combination) => ({
      id: generateId("variant"),
      sku: "",
      optionValues: combination,
      isActive: true,
      price: "",
      discountPrice: "",
      inventoryStatus: "in_stock",
      expanded: false,
    }));

  return [...existing, ...newRows];
}
