import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  addAttributeValues as apiAddAttributeValues,
  createAttribute as apiCreateAttribute,
  createProduct as apiCreateProduct,
  deleteAttributeValue as apiDeleteAttributeValue,
  deleteProduct as apiDeleteProduct,
  listAttributes,
  listCategories,
  listCollections,
  listProducts,
  listProductTypes,
  listSalesChannels,
  listShipmentTypes,
  listShippingProfiles,
  listTags,
  listWarehouses,
  updateProduct as apiUpdateProduct,
} from "./api";
import { createEmptyVariantRow, createInitialDraft, validateDraft } from "./draft";
import {
  Attribute,
  ChannelPrice,
  Dimensions,
  Product,
  ProductCategory,
  ProductCollection,
  ProductDraft,
  ProductTag,
  ProductType,
  ProductTypeOption,
  PublicationStatus,
  SalesChannel,
  ShipmentType,
  ShippingProfile,
  VariantRow,
  Warehouse,
} from "./types";

type View = "list" | "create";
type FetchStatus = "idle" | "loading" | "ready" | "error";

interface StoreState {
  view: View;

  attributes: Attribute[];
  shipmentTypes: ShipmentType[];
  categories: ProductCategory[];
  collections: ProductCollection[];
  productTypes: ProductTypeOption[];
  shippingProfiles: ShippingProfile[];
  salesChannels: SalesChannel[];
  tags: ProductTag[];
  warehouses: Warehouse[];
  lookupsStatus: FetchStatus;
  lookupsError: string | null;

  products: Product[];
  productsStatus: FetchStatus;
  productsError: string | null;
  productsPage: number;
  productsPageSize: number;
  productsTotal: number;
  productsSearch: string;

  draft: ProductDraft;
  editingProductId: string | null;
  isSaving: boolean;
  saveError: string | null;
  deletingProductId: string | null;
  deleteError: string | null;

  hydrate: () => Promise<void>;
  fetchProducts: (page?: number, limit?: number, search?: string) => Promise<void>;
  setProductsPage: (page: number) => Promise<void>;
  setProductsPageSize: (pageSize: number) => Promise<void>;
  setProductsSearch: (search: string) => Promise<void>;

  setView: (view: View) => void;
  startCreateProduct: () => void;
  startEditProduct: (productId: string) => void;
  deleteProduct: (productId: string) => Promise<void>;

  addAttribute: (name: string, initialValues: string[]) => Promise<{ attributeId: string; valueIds: string[] }>;
  addAttributeValues: (attributeId: string, values: string[]) => Promise<string[]>;
  removeAttributeValue: (attributeId: string, valueId: string) => Promise<void>;

  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setProductImages: (imageUrls: string[]) => void;
  setProductType: (productType: ProductType) => void;

  setSimpleField: (field: "price" | "sku" | "stockQuantity" | "packageAmount", value: string) => void;
  setSimpleStatus: (status: PublicationStatus) => void;
  setSimpleDimension: (field: keyof Dimensions, value: string) => void;
  setSimpleShipmentType: (shipmentTypeId: string | null) => void;
  setSimpleWarehouse: (warehouseId: string | null) => void;
  setSimpleManagedInventory: (managedInventory: boolean) => void;
  setSimpleAllowBackorder: (allowBackorder: boolean) => void;
  addSimpleAttribute: (attributeId: string) => void;
  removeSimpleAttribute: (attributeId: string) => void;
  toggleSimpleAttributeValue: (attributeId: string, valueId: string) => void;
  setSimpleChannelPrice: (channelId: string, price: string) => void;
  resetSimpleChannelPrice: (channelId: string) => void;

  setVariantHandle: (handle: string) => void;
  setVariantPackageAmount: (packageAmount: string) => void;
  setVariantDimension: (field: keyof Dimensions, value: string) => void;
  setVariantShipmentType: (shipmentTypeId: string | null) => void;
  setVariantWarehouse: (warehouseId: string | null) => void;
  addVariantAttribute: (attributeId: string) => void;
  removeVariantAttribute: (attributeId: string) => void;
  toggleVariantAttributeValue: (attributeId: string, valueId: string) => void;
  setVariantAttributeMeantForVariants: (attributeId: string, meantForVariants: boolean) => void;

  addVariantRow: () => void;
  removeVariantRow: (id: string) => void;
  toggleVariantRowExpanded: (id: string) => void;
  updateVariantRow: (id: string, changes: Partial<VariantRow>) => void;
  setVariantRowOption: (rowId: string, attributeId: string, valueId: string | null) => void;
  setVariantRowChannelPrice: (rowId: string, channelId: string, price: string) => void;
  resetVariantRowChannelPrice: (rowId: string, channelId: string) => void;

  setDiscountable: (discountable: boolean) => void;
  setOrganizationTypeId: (typeId: string | null) => void;
  setOrganizationCollectionId: (collectionId: string | null) => void;
  toggleOrganizationCategory: (categoryId: string) => void;
  toggleOrganizationTag: (tagId: string) => void;
  setOrganizationShippingProfileId: (shippingProfileId: string | null) => void;
  toggleSalesChannel: (channelId: string) => void;

  saveDraft: () => Promise<void>;
}

// Direct edit of a single channel's price: it now holds its own value
// (whatever was typed, including a transient empty string while editing) and
// stops following the top price field. Never snaps the value back mid-edit -
// see clearChannelPriceOverride for the only place a channel rejoins the sync.
function setChannelPriceOverride(list: ChannelPrice[], channelId: string, price: string) {
  const entry = list.find((item) => item.channelId === channelId);
  if (entry) {
    entry.price = price;
    entry.overridden = true;
  } else {
    list.push({ channelId, price, overridden: true });
  }
}

// Called on blur when a channel's field was left empty: rejoins the top-price
// sync instead of staying stuck on an explicit blank value.
function clearChannelPriceOverride(list: ChannelPrice[], channelId: string, price: string) {
  const entry = list.find((item) => item.channelId === channelId);
  if (entry) {
    entry.price = price;
    entry.overridden = false;
  } else {
    list.push({ channelId, price, overridden: false });
  }
}

// Propagates the top price to every given channel that hasn't been
// individually overridden (new channels get seeded, untouched ones get
// updated to match) - called whenever the top price field or a channel
// selection changes. Entries the client has directly edited are left alone.
function syncChannelPricesToPrice(list: ChannelPrice[], channelIds: string[], price: string) {
  for (const channelId of channelIds) {
    const entry = list.find((item) => item.channelId === channelId);
    if (entry) {
      if (!entry.overridden) entry.price = price;
    } else {
      list.push({ channelId, price, overridden: false });
    }
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "אירעה שגיאה לא צפויה";
}

// Guards against an older in-flight fetchProducts() call resolving after a
// newer one and clobbering its (more current) results.
let productsFetchToken = 0;

export const useStore = create<StoreState>()(
  immer((set, get) => ({
    view: "list",

    attributes: [],
    shipmentTypes: [],
    categories: [],
    collections: [],
    productTypes: [],
    shippingProfiles: [],
    salesChannels: [],
    tags: [],
    warehouses: [],
    lookupsStatus: "idle",
    lookupsError: null,

    products: [],
    productsStatus: "idle",
    productsError: null,
    productsPage: 1,
    productsPageSize: 25,
    productsTotal: 0,
    productsSearch: "",

    draft: createInitialDraft(),
    editingProductId: null,
    isSaving: false,
    saveError: null,
    deletingProductId: null,
    deleteError: null,

    hydrate: async () => {
      const { productsPage, productsPageSize } = get();

      set((state) => {
        state.lookupsStatus = "loading";
        state.lookupsError = null;
        state.productsStatus = "loading";
        state.productsError = null;
      });

      const [lookupsResult, productsResult] = await Promise.allSettled([
        Promise.all([
          listAttributes(),
          listShipmentTypes(),
          listCategories(),
          listCollections(),
          listProductTypes(),
          listShippingProfiles(),
          listSalesChannels(),
          listTags(),
          listWarehouses(),
        ]),
        listProducts(productsPage, productsPageSize),
      ]);

      set((state) => {
        if (lookupsResult.status === "fulfilled") {
          const [attributes, shipmentTypes, categories, collections, productTypes, shippingProfiles, salesChannels, tags, warehouses] =
            lookupsResult.value;
          state.attributes = attributes;
          state.shipmentTypes = shipmentTypes;
          state.categories = categories;
          state.collections = collections;
          state.productTypes = productTypes;
          state.shippingProfiles = shippingProfiles;
          state.salesChannels = salesChannels;
          state.tags = tags;
          state.warehouses = warehouses;
          state.lookupsStatus = "ready";
        } else {
          state.lookupsStatus = "error";
          state.lookupsError = errorMessage(lookupsResult.reason);
        }

        if (productsResult.status === "fulfilled") {
          state.products = productsResult.value.items;
          state.productsTotal = productsResult.value.total;
          state.productsStatus = "ready";
        } else {
          state.productsStatus = "error";
          state.productsError = errorMessage(productsResult.reason);
        }
      });
    },

    fetchProducts: async (
      page = get().productsPage,
      limit = get().productsPageSize,
      search = get().productsSearch
    ) => {
      const safePage = Math.max(1, Math.floor(page));
      const safeLimit = Math.max(1, Math.floor(limit));
      const token = ++productsFetchToken;

      set((state) => {
        state.productsPage = safePage;
        state.productsPageSize = safeLimit;
        state.productsSearch = search;
        state.productsStatus = "loading";
        state.productsError = null;
      });

      try {
        const result = await listProducts(safePage, safeLimit, search);
        if (token !== productsFetchToken) return;

        set((state) => {
          state.products = result.items;
          state.productsTotal = result.total;
          state.productsStatus = "ready";
        });
      } catch (error) {
        if (token !== productsFetchToken) return;

        set((state) => {
          state.productsStatus = "error";
          state.productsError = errorMessage(error);
        });
        throw error;
      }
    },

    setProductsPage: async (page) => {
      await get().fetchProducts(page, get().productsPageSize);
    },

    setProductsPageSize: async (pageSize) => {
      await get().fetchProducts(1, pageSize);
    },

    setProductsSearch: async (search) => {
      await get().fetchProducts(1, get().productsPageSize, search);
    },

    setView: (view) =>
      set((state) => {
        state.view = view;
      }),

    startCreateProduct: () =>
      set((state) => {
        state.draft = createInitialDraft();
        state.editingProductId = null;
        state.saveError = null;
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
          imageUrls: clone.imageUrls,
          productType: clone.productType,
          simple: clone.simple,
          variant: clone.variant,
          organization: clone.organization,
        };
        state.editingProductId = productId;
        state.saveError = null;
        state.view = "create";
      }),

    deleteProduct: async (productId) => {
      set((state) => {
        state.deletingProductId = productId;
        state.deleteError = null;
      });
      try {
        await apiDeleteProduct(productId);
        set((state) => {
          state.products = state.products.filter((product) => product.id !== productId);
          state.productsTotal = Math.max(0, state.productsTotal - 1);
          state.deletingProductId = null;
        });
      } catch (error) {
        set((state) => {
          state.deletingProductId = null;
          state.deleteError = errorMessage(error);
        });
        throw error;
      }
    },

    addAttribute: async (name, initialValues) => {
      const attribute = await apiCreateAttribute(name, initialValues);
      set((state) => {
        state.attributes.push(attribute);
      });
      return { attributeId: attribute.id, valueIds: attribute.values.map((value) => value.id) };
    },

    addAttributeValues: async (attributeId, values) => {
      const created = await apiAddAttributeValues(attributeId, values);
      set((state) => {
        const attribute = state.attributes.find((item) => item.id === attributeId);
        if (!attribute) return;
        const existingIds = new Set(attribute.values.map((v) => v.id));
        for (const value of created) {
          if (!existingIds.has(value.id)) {
            attribute.values.push(value);
            existingIds.add(value.id);
          }
        }
      });
      return created.map((v) => v.id);
    },

    removeAttributeValue: async (attributeId, valueId) => {
      await apiDeleteAttributeValue(attributeId, valueId);
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
      });
    },

    setName: (name) =>
      set((state) => {
        state.draft.name = name;
      }),

    setDescription: (description) =>
      set((state) => {
        state.draft.description = description;
      }),

    setProductImages: (imageUrls) =>
      set((state) => {
        state.draft.imageUrls = imageUrls;
      }),

    setProductType: (productType) =>
      set((state) => {
        state.draft.productType = productType;
      }),

    setSimpleField: (field, value) =>
      set((state) => {
        state.draft.simple[field] = value;
        if (field === "price") {
          syncChannelPricesToPrice(
            state.draft.simple.channelPrices,
            state.draft.organization.salesChannelIds,
            value
          );
        }
      }),

    setSimpleStatus: (status) =>
      set((state) => {
        state.draft.simple.status = status;
      }),

    setSimpleDimension: (field, value) =>
      set((state) => {
        state.draft.simple[field] = value;
      }),

    setSimpleShipmentType: (shipmentTypeId) =>
      set((state) => {
        state.draft.simple.shipmentTypeId = shipmentTypeId;
      }),

    setSimpleWarehouse: (warehouseId) =>
      set((state) => {
        state.draft.simple.warehouseId = warehouseId;
      }),

    setSimpleManagedInventory: (managedInventory) =>
      set((state) => {
        state.draft.simple.managedInventory = managedInventory;
      }),

    setSimpleAllowBackorder: (allowBackorder) =>
      set((state) => {
        state.draft.simple.allowBackorder = allowBackorder;
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

    setSimpleChannelPrice: (channelId, price) =>
      set((state) => {
        setChannelPriceOverride(state.draft.simple.channelPrices, channelId, price);
      }),

    resetSimpleChannelPrice: (channelId) =>
      set((state) => {
        clearChannelPriceOverride(state.draft.simple.channelPrices, channelId, state.draft.simple.price);
      }),

    setVariantHandle: (handle) =>
      set((state) => {
        state.draft.variant.handle = handle;
      }),

    setVariantPackageAmount: (packageAmount) =>
      set((state) => {
        state.draft.variant.packageAmount = packageAmount;
      }),

    setVariantDimension: (field, value) =>
      set((state) => {
        state.draft.variant[field] = value;
      }),

    setVariantShipmentType: (shipmentTypeId) =>
      set((state) => {
        state.draft.variant.shipmentTypeId = shipmentTypeId;
      }),

    setVariantWarehouse: (warehouseId) =>
      set((state) => {
        state.draft.variant.warehouseId = warehouseId;
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
        if (!row) return;
        Object.assign(row, changes);
        if (changes.price !== undefined) {
          syncChannelPricesToPrice(
            row.channelPrices,
            state.draft.organization.salesChannelIds,
            changes.price
          );
        }
      }),

    setVariantRowOption: (rowId, attributeId, valueId) =>
      set((state) => {
        const row = state.draft.variant.variants.find((v) => v.id === rowId);
        if (!row) return;
        if (valueId) row.optionValues[attributeId] = valueId;
        else delete row.optionValues[attributeId];
      }),

    setVariantRowChannelPrice: (rowId, channelId, price) =>
      set((state) => {
        const row = state.draft.variant.variants.find((v) => v.id === rowId);
        if (!row) return;
        setChannelPriceOverride(row.channelPrices, channelId, price);
      }),

    resetVariantRowChannelPrice: (rowId, channelId) =>
      set((state) => {
        const row = state.draft.variant.variants.find((v) => v.id === rowId);
        if (!row) return;
        clearChannelPriceOverride(row.channelPrices, channelId, row.price);
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

    toggleOrganizationTag: (tagId) =>
      set((state) => {
        const { tagIds } = state.draft.organization;
        state.draft.organization.tagIds = tagIds.includes(tagId)
          ? tagIds.filter((id) => id !== tagId)
          : [...tagIds, tagId];
      }),

    setOrganizationShippingProfileId: (shippingProfileId) =>
      set((state) => {
        state.draft.organization.shippingProfileId = shippingProfileId;
      }),

    toggleSalesChannel: (channelId) =>
      set((state) => {
        const { salesChannelIds } = state.draft.organization;
        const isAdding = !salesChannelIds.includes(channelId);
        state.draft.organization.salesChannelIds = isAdding
          ? [...salesChannelIds, channelId]
          : salesChannelIds.filter((id) => id !== channelId);

        if (isAdding) {
          syncChannelPricesToPrice(state.draft.simple.channelPrices, [channelId], state.draft.simple.price);
          for (const row of state.draft.variant.variants) {
            syncChannelPricesToPrice(row.channelPrices, [channelId], row.price);
          }
        }
      }),

    saveDraft: async () => {
      const { draft, editingProductId } = get();

      const errors = validateDraft(draft);
      if (errors.length > 0) {
        const message = errors.join("\n");
        set((state) => {
          state.saveError = message;
        });
        throw new Error(message);
      }

      set((state) => {
        state.isSaving = true;
        state.saveError = null;
      });

      try {
        const saved = editingProductId
          ? await apiUpdateProduct({ ...draft, id: editingProductId, createdAt: get().products.find((p) => p.id === editingProductId)?.createdAt ?? "" })
          : await apiCreateProduct(draft);

        set((state) => {
          const index = state.products.findIndex((product) => product.id === saved.id);
          if (index >= 0) {
            state.products[index] = saved;
          } else {
            state.products.unshift(saved);
            state.products = state.products.slice(0, state.productsPageSize);
            state.productsTotal += 1;
          }

          state.draft = createInitialDraft();
          state.editingProductId = null;
          state.isSaving = false;
          state.view = "list";
        });
      } catch (error) {
        set((state) => {
          state.isSaving = false;
          state.saveError = errorMessage(error);
        });
        throw error;
      }
    },
  }))
);