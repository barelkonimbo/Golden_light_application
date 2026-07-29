import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createEmptyVariantRow, createInitialDraft, generateId } from "./draft";
import {
  initialAttributes,
  initialCategories,
  initialCollections,
  initialProducts,
  initialProductTypes,
  initialSalesChannels,
  initialShipmentTypes,
  initialShippingProfiles,
} from "./mock-data";
import {
  Attribute,
  Dimensions,
  Product,
  ProductCategory,
  ProductCollection,
  ProductDraft,
  ProductType,
  ProductTypeOption,
  SalesChannel,
  ShipmentType,
  ShippingProfile,
  VariantRow,
} from "./types";

type View = "list" | "create";
type ChannelPriceField = "price" | "discountPrice";

interface StoreState {
  view: View;
  attributes: Attribute[];
  shipmentTypes: ShipmentType[];
  categories: ProductCategory[];
  collections: ProductCollection[];
  productTypes: ProductTypeOption[];
  shippingProfiles: ShippingProfile[];
  salesChannels: SalesChannel[];
  products: Product[];
  draft: ProductDraft;
  editingProductId: string | null;

  setView: (view: View) => void;
  startCreateProduct: () => void;
  startEditProduct: (productId: string) => void;
  deleteProduct: (productId: string) => void;

  addAttribute: (name: string, initialValue: string) => { attributeId: string; valueId: string };
  addAttributeValue: (attributeId: string, value: string) => string;
  removeAttributeValue: (attributeId: string, valueId: string) => void;

  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setProductType: (productType: ProductType) => void;

  setSimpleField: (field: "price" | "discountPrice" | "sku" | "stockQuantity", value: string) => void;
  setSimpleActive: (isActive: boolean) => void;
  setSimpleDimension: (field: keyof Dimensions, value: string) => void;
  setSimpleShipmentType: (shipmentTypeId: string | null) => void;
  addSimpleAttribute: (attributeId: string) => void;
  removeSimpleAttribute: (attributeId: string) => void;
  toggleSimpleAttributeValue: (attributeId: string, valueId: string) => void;
  setSimpleChannelPrice: (channelId: string, field: ChannelPriceField, value: string) => void;

  setVariantSku: (sku: string) => void;
  setVariantDimension: (field: keyof Dimensions, value: string) => void;
  setVariantShipmentType: (shipmentTypeId: string | null) => void;
  addVariantAttribute: (attributeId: string) => void;
  removeVariantAttribute: (attributeId: string) => void;
  toggleVariantAttributeValue: (attributeId: string, valueId: string) => void;
  setVariantAttributeMeantForVariants: (attributeId: string, meantForVariants: boolean) => void;

  addVariantRow: () => void;
  removeVariantRow: (id: string) => void;
  toggleVariantRowExpanded: (id: string) => void;
  updateVariantRow: (id: string, changes: Partial<VariantRow>) => void;
  setVariantRowOption: (rowId: string, attributeId: string, valueId: string | null) => void;
  setVariantRowChannelPrice: (rowId: string, channelId: string, field: ChannelPriceField, value: string) => void;

  setDiscountable: (discountable: boolean) => void;
  setOrganizationTypeId: (typeId: string | null) => void;
  setOrganizationCollectionId: (collectionId: string | null) => void;
  toggleOrganizationCategory: (categoryId: string) => void;
  addOrganizationTag: (tag: string) => void;
  removeOrganizationTag: (tag: string) => void;
  setOrganizationShippingProfileId: (shippingProfileId: string | null) => void;
  toggleSalesChannel: (channelId: string) => void;

  saveDraft: () => void;
}

function upsertChannelPrice(
  list: { channelId: string; price: string; discountPrice: string }[],
  channelId: string,
  field: ChannelPriceField,
  value: string
) {
  const entry = list.find((item) => item.channelId === channelId);
  if (entry) {
    entry[field] = value;
  } else {
    list.push({ channelId, price: "", discountPrice: "", [field]: value });
  }
}

export const useStore = create<StoreState>()(
  immer((set) => ({
    view: "list",
    attributes: initialAttributes,
    shipmentTypes: initialShipmentTypes,
    categories: initialCategories,
    collections: initialCollections,
    productTypes: initialProductTypes,
    shippingProfiles: initialShippingProfiles,
    salesChannels: initialSalesChannels,
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
          organization: clone.organization,
        };
        state.editingProductId = productId;
        state.view = "create";
      }),

    deleteProduct: (productId) =>
      set((state) => {
        state.products = state.products.filter((product) => product.id !== productId);
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

    removeAttributeValue: (attributeId, valueId) =>
      set((state) => {
        const attribute = state.attributes.find((item) => item.id === attributeId);
        if (attribute) attribute.values = attribute.values.filter((item) => item.id !== valueId);

        const simpleEntry = state.draft.simple.attributes.find((a) => a.attributeId === attributeId);
        if (simpleEntry) simpleEntry.valueIds = simpleEntry.valueIds.filter((id) => id !== valueId);

        const variantEntry = state.draft.variant.attributes.find((a) => a.attributeId === attributeId);
        if (variantEntry) {
          variantEntry.selectedValueIds = variantEntry.selectedValueIds.filter((id) => id !== valueId);
        }

        state.draft.variant.variants.forEach((row) => {
          if (row.optionValues[attributeId] === valueId) delete row.optionValues[attributeId];
        });
      }),

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

    setSimpleActive: (isActive) =>
      set((state) => {
        state.draft.simple.isActive = isActive;
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
        state.draft.simple.attributes.push({ attributeId, valueIds: [] });
      }),

    removeSimpleAttribute: (attributeId) =>
      set((state) => {
        state.draft.simple.attributes = state.draft.simple.attributes.filter(
          (a) => a.attributeId !== attributeId
        );
      }),

    toggleSimpleAttributeValue: (attributeId, valueId) =>
      set((state) => {
        const entry = state.draft.simple.attributes.find((a) => a.attributeId === attributeId);
        if (!entry) return;
        entry.valueIds = entry.valueIds.includes(valueId)
          ? entry.valueIds.filter((id) => id !== valueId)
          : [...entry.valueIds, valueId];
      }),

    setSimpleChannelPrice: (channelId, field, value) =>
      set((state) => {
        upsertChannelPrice(state.draft.simple.channelPrices, channelId, field, value);
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

    addVariantRow: () =>
      set((state) => {
        state.draft.variant.variants.push(createEmptyVariantRow());
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

    setVariantRowOption: (rowId, attributeId, valueId) =>
      set((state) => {
        const row = state.draft.variant.variants.find((v) => v.id === rowId);
        if (!row) return;
        if (valueId) row.optionValues[attributeId] = valueId;
        else delete row.optionValues[attributeId];
      }),

    setVariantRowChannelPrice: (rowId, channelId, field, value) =>
      set((state) => {
        const row = state.draft.variant.variants.find((v) => v.id === rowId);
        if (!row) return;
        upsertChannelPrice(row.channelPrices, channelId, field, value);
      }),

    setDiscountable: (discountable) =>
      set((state) => {
        state.draft.organization.discountable = discountable;
      }),

    setOrganizationTypeId: (typeId) =>
      set((state) => {
        state.draft.organization.typeId = typeId;
      }),

    setOrganizationCollectionId: (collectionId) =>
      set((state) => {
        state.draft.organization.collectionId = collectionId;
      }),

    toggleOrganizationCategory: (categoryId) =>
      set((state) => {
        const { categoryIds } = state.draft.organization;
        state.draft.organization.categoryIds = categoryIds.includes(categoryId)
          ? categoryIds.filter((id) => id !== categoryId)
          : [...categoryIds, categoryId];
      }),

    addOrganizationTag: (tag) =>
      set((state) => {
        const trimmed = tag.trim();
        if (!trimmed || state.draft.organization.tags.includes(trimmed)) return;
        state.draft.organization.tags.push(trimmed);
      }),

    removeOrganizationTag: (tag) =>
      set((state) => {
        state.draft.organization.tags = state.draft.organization.tags.filter((item) => item !== tag);
      }),

    setOrganizationShippingProfileId: (shippingProfileId) =>
      set((state) => {
        state.draft.organization.shippingProfileId = shippingProfileId;
      }),

    toggleSalesChannel: (channelId) =>
      set((state) => {
        const { salesChannelIds } = state.draft.organization;
        state.draft.organization.salesChannelIds = salesChannelIds.includes(channelId)
          ? salesChannelIds.filter((id) => id !== channelId)
          : [...salesChannelIds, channelId];
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
            createdAt: new Date().toISOString().slice(0, 10),
          });
        }

        state.draft = createInitialDraft();
        state.editingProductId = null;
        state.view = "list";
      }),
  }))
);
