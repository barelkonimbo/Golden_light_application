import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createInitialDraft, generateVariantRows } from "./draft";
import { initialAttributes, initialProducts, initialShipmentTypes } from "./mock-data";
import {
  Attribute,
  Dimensions,
  InventoryStatus,
  Product,
  ProductDraft,
  ProductType,
  ShipmentType,
  VariantRow,
} from "./types";

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

type View = "list" | "create";

interface StoreState {
  view: View;
  attributes: Attribute[];
  shipmentTypes: ShipmentType[];
  products: Product[];
  draft: ProductDraft;
  editingProductId: string | null;

  setView: (view: View) => void;
  startCreateProduct: () => void;
  startEditProduct: (productId: string) => void;

  addAttribute: (name: string, initialValue: string) => { attributeId: string; valueId: string };
  addAttributeValue: (attributeId: string, value: string) => string;

  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setProductType: (productType: ProductType) => void;

  setSimpleField: (field: "price" | "discountPrice" | "sku", value: string) => void;
  setSimpleInventoryStatus: (status: InventoryStatus) => void;
  setSimpleDimension: (field: keyof Dimensions, value: string) => void;
  setSimpleShipmentType: (shipmentTypeId: string | null) => void;
  addSimpleAttribute: (attributeId: string) => void;
  removeSimpleAttribute: (attributeId: string) => void;
  setSimpleAttributeValue: (attributeId: string, valueId: string) => void;

  setVariantSku: (sku: string) => void;
  setVariantDimension: (field: keyof Dimensions, value: string) => void;
  setVariantShipmentType: (shipmentTypeId: string | null) => void;
  addVariantAttribute: (attributeId: string) => void;
  removeVariantAttribute: (attributeId: string) => void;
  toggleVariantAttributeValue: (attributeId: string, valueId: string) => void;
  setVariantAttributeMeantForVariants: (attributeId: string, meantForVariants: boolean) => void;

  generateVariants: () => void;
  removeVariantRow: (id: string) => void;
  toggleVariantRowExpanded: (id: string) => void;
  updateVariantRow: (id: string, changes: Partial<VariantRow>) => void;

  saveDraft: () => void;
}

export const useStore = create<StoreState>()(
  immer((set) => ({
    view: "list",
    attributes: initialAttributes,
    shipmentTypes: initialShipmentTypes,
    products: initialProducts,
    draft: createInitialDraft(),
    editingProductId: null,

    setView: (view) =>
      set((state) => {
        state.view = view;
      }),

    startCreateProduct: () =>
      set((state) => {
        state.draft = createInitialDraft();
        state.editingProductId = null;
        state.view = "create";
      }),

    startEditProduct: (productId) =>
      set((state) => {
        const product = state.products.find((item) => item.id === productId);
        if (!product) return;
        // Deep-clone via JSON so editing the draft can never mutate the stored
        // product until saveDraft() runs (an Immer draft proxy can't be reused
        // across two paths in the state tree safely).
        const clone: Product = JSON.parse(JSON.stringify(product));
        state.draft = {
          name: clone.name,
          description: clone.description,
          productType: clone.productType,
          simple: clone.simple,
          variant: clone.variant,
        };
        state.editingProductId = productId;
        state.view = "create";
      }),

    addAttribute: (name, initialValue) => {
      const attributeId = generateId("attr");
      const valueId = generateId("val");
      set((state) => {
        state.attributes.push({
          id: attributeId,
          name,
          values: [{ id: valueId, value: initialValue }],
        });
      });
      return { attributeId, valueId };
    },

    addAttributeValue: (attributeId, value) => {
      const valueId = generateId("val");
      set((state) => {
        const attribute = state.attributes.find((item) => item.id === attributeId);
        attribute?.values.push({ id: valueId, value });
      });
      return valueId;
    },

    setName: (name) =>
      set((state) => {
        state.draft.name = name;
      }),

    setDescription: (description) =>
      set((state) => {
        state.draft.description = description;
      }),

    setProductType: (productType) =>
      set((state) => {
        state.draft.productType = productType;
      }),

    setSimpleField: (field, value) =>
      set((state) => {
        state.draft.simple[field] = value;
      }),

    setSimpleInventoryStatus: (status) =>
      set((state) => {
        state.draft.simple.inventoryStatus = status;
      }),

    setSimpleDimension: (field, value) =>
      set((state) => {
        state.draft.simple[field] = value;
      }),

    setSimpleShipmentType: (shipmentTypeId) =>
      set((state) => {
        state.draft.simple.shipmentTypeId = shipmentTypeId;
      }),

    addSimpleAttribute: (attributeId) =>
      set((state) => {
        if (state.draft.simple.attributes.some((a) => a.attributeId === attributeId)) return;
        state.draft.simple.attributes.push({ attributeId, valueId: null });
      }),

    removeSimpleAttribute: (attributeId) =>
      set((state) => {
        state.draft.simple.attributes = state.draft.simple.attributes.filter(
          (a) => a.attributeId !== attributeId
        );
      }),

    setSimpleAttributeValue: (attributeId, valueId) =>
      set((state) => {
        const entry = state.draft.simple.attributes.find((a) => a.attributeId === attributeId);
        if (entry) entry.valueId = valueId;
      }),

    setVariantSku: (sku) =>
      set((state) => {
        state.draft.variant.sku = sku;
      }),

    setVariantDimension: (field, value) =>
      set((state) => {
        state.draft.variant[field] = value;
      }),

    setVariantShipmentType: (shipmentTypeId) =>
      set((state) => {
        state.draft.variant.shipmentTypeId = shipmentTypeId;
      }),

    addVariantAttribute: (attributeId) =>
      set((state) => {
        if (state.draft.variant.attributes.some((a) => a.attributeId === attributeId)) return;
        state.draft.variant.attributes.push({
          attributeId,
          selectedValueIds: [],
          meantForVariants: false,
        });
      }),

    removeVariantAttribute: (attributeId) =>
      set((state) => {
        state.draft.variant.attributes = state.draft.variant.attributes.filter(
          (a) => a.attributeId !== attributeId
        );
      }),

    toggleVariantAttributeValue: (attributeId, valueId) =>
      set((state) => {
        const entry = state.draft.variant.attributes.find((a) => a.attributeId === attributeId);
        if (!entry) return;
        entry.selectedValueIds = entry.selectedValueIds.includes(valueId)
          ? entry.selectedValueIds.filter((id) => id !== valueId)
          : [...entry.selectedValueIds, valueId];
      }),

    setVariantAttributeMeantForVariants: (attributeId, meantForVariants) =>
      set((state) => {
        const entry = state.draft.variant.attributes.find((a) => a.attributeId === attributeId);
        if (entry) entry.meantForVariants = meantForVariants;
      }),

    generateVariants: () =>
      set((state) => {
        state.draft.variant.variants = generateVariantRows(
          state.draft.variant.attributes,
          state.draft.variant.variants
        );
      }),

    removeVariantRow: (id) =>
      set((state) => {
        state.draft.variant.variants = state.draft.variant.variants.filter((v) => v.id !== id);
      }),

    toggleVariantRowExpanded: (id) =>
      set((state) => {
        const row = state.draft.variant.variants.find((v) => v.id === id);
        if (row) row.expanded = !row.expanded;
      }),

    updateVariantRow: (id, changes) =>
      set((state) => {
        const row = state.draft.variant.variants.find((v) => v.id === id);
        if (row) Object.assign(row, changes);
      }),

    saveDraft: () =>
      set((state) => {
        const { draft, editingProductId } = state;
        const existing = editingProductId
          ? state.products.find((product) => product.id === editingProductId)
          : undefined;

        if (existing) {
          Object.assign(existing, draft);
        } else {
          state.products.unshift({
            ...draft,
            id: generateId("prod"),
            categories: [],
            createdAt: new Date().toISOString().slice(0, 10),
          });
        }

        state.draft = createInitialDraft();
        state.editingProductId = null;
        state.view = "list";
      }),
  }))
);
