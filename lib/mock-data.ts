import { createInitialDraft } from "./draft";
import {
  Attribute,
  Product,
  ProductCategory,
  ProductCollection,
  ProductTypeOption,
  SalesChannel,
  ShipmentType,
  ShippingProfile,
} from "./types";

export const initialAttributes: Attribute[] = [
  {
    id: "attr-structure",
    name: "מבנה",
    values: [
      { id: "val-structure-1", value: "אלומיניום בצביעה אלקטרוסטטית" },
      { id: "val-structure-2", value: "פלדה מגולוונת" },
    ],
  },
  {
    id: "attr-power",
    name: "הספק (W)",
    values: [
      { id: "val-power-12", value: "12W" },
      { id: "val-power-15", value: "15W" },
    ],
  },
  {
    id: "attr-lumen",
    name: "שטף אור (LM)",
    values: [
      { id: "val-lumen-1224", value: "1224lm" },
      { id: "val-lumen-1530", value: "1530lm" },
    ],
  },
  {
    id: "attr-color",
    name: "גוון אור",
    values: [
      { id: "val-color-warm", value: "לבן חם" },
      { id: "val-color-cold", value: "לבן קר" },
    ],
  },
];

export const initialShipmentTypes: ShipmentType[] = [
  { id: "ship-standard", name: "משלוח רגיל" },
  { id: "ship-fragile", name: "משלוח שביר" },
  { id: "ship-oversized", name: "משלוח מידות חריגות" },
];

export const initialCategories: ProductCategory[] = [
  { id: "cat-emergency", name: "תאורת חירום" },
  { id: "cat-indoor", name: "תאורת פנים" },
  { id: "cat-cylinders", name: "צילינדרים תאורה" },
  { id: "cat-technical", name: "תאורה טכנית" },
  { id: "cat-pendant", name: "מנורות תלייה" },
  { id: "cat-flood", name: "פנסי הצפה / רחוב" },
  { id: "cat-outdoor", name: "תאורת חוץ" },
  { id: "cat-recessed", name: "פרופיל שקוע" },
];

export const initialCollections: ProductCollection[] = [
  { id: "col-2026-summer", name: "קולקציית קיץ 2026" },
  { id: "col-classic", name: "קולקציה קלאסית" },
];

export const initialProductTypes: ProductTypeOption[] = [
  { id: "type-led", name: "תאורת LED" },
  { id: "type-fixture", name: "גוף תאורה" },
  { id: "type-accessory", name: "אביזר נלווה" },
];

export const initialShippingProfiles: ShippingProfile[] = [
  { id: "sp-default", name: "פרופיל משלוח כללי" },
  { id: "sp-heavy", name: "פרופיל משלוח כבד" },
];

export const initialSalesChannels: SalesChannel[] = [
  { id: "channel-default", name: "ערוץ ברירת מחדל" },
  { id: "channel-wolt", name: "Wolt" },
  { id: "channel-website", name: "אתר האינטרנט" },
];

export const initialProducts: Product[] = [
  {
    ...createInitialDraft(),
    id: "prod-1",
    name: "שלט אזור מחסה",
    description: "שלט תאורת חירום לאזור מחסה, כולל סוללת גיבוי.",
    createdAt: "2026-07-29",
    simple: {
      ...createInitialDraft().simple,
      sku: "30347",
      price: "142",
    },
    organization: {
      ...createInitialDraft().organization,
      categoryIds: ["cat-emergency", "cat-indoor"],
      salesChannelIds: ["channel-default"],
    },
  },
  {
    ...createInitialDraft(),
    id: "prod-2",
    name: "אנדזו",
    description: "צילינדר תאורה טכני, זמין במספר הספקים.",
    createdAt: "2026-07-29",
    productType: "variant",
    variant: {
      ...createInitialDraft().variant,
      sku: "30421WW",
      attributes: [
        { attributeId: "attr-power", selectedValueIds: ["val-power-12", "val-power-15"], meantForVariants: true },
      ],
      variants: [
        {
          id: "variant-1",
          sku: "30421WW-12",
          optionValues: { "attr-power": "val-power-12" },
          isActive: true,
          price: "189",
          discountPrice: "",
          stockQuantity: "24",
          channelPrices: [],
          expanded: false,
        },
        {
          id: "variant-2",
          sku: "30421WW-15",
          optionValues: { "attr-power": "val-power-15" },
          isActive: true,
          price: "219",
          discountPrice: "",
          stockQuantity: "10",
          channelPrices: [],
          expanded: false,
        },
      ],
    },
    organization: {
      ...createInitialDraft().organization,
      categoryIds: ["cat-cylinders", "cat-technical", "cat-indoor"],
      salesChannelIds: ["channel-default", "channel-website"],
    },
  },
  {
    ...createInitialDraft(),
    id: "prod-3",
    name: "ארמטורה קיר — פרטי",
    createdAt: "2026-07-21",
    simple: { ...createInitialDraft().simple, sku: "65010002" },
    organization: {
      ...createInitialDraft().organization,
      categoryIds: ["cat-pendant", "cat-indoor"],
      salesChannelIds: ["channel-default"],
    },
  },
  {
    ...createInitialDraft(),
    id: "prod-4",
    name: "מליבו — פרטי",
    createdAt: "2026-07-19",
    organization: {
      ...createInitialDraft().organization,
      categoryIds: ["cat-flood", "cat-outdoor"],
      salesChannelIds: ["channel-default"],
    },
  },
  {
    ...createInitialDraft(),
    id: "prod-5",
    name: "SYSTEM 15/8",
    createdAt: "2026-07-12",
    simple: { ...createInitialDraft().simple, sku: "30803" },
    organization: {
      ...createInitialDraft().organization,
      categoryIds: ["cat-recessed", "cat-technical", "cat-indoor"],
      salesChannelIds: ["channel-default"],
    },
  },
];
