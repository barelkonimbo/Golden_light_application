import { createInitialDraft } from "./draft";
import { Attribute, Product, ShipmentType } from "./types";

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

export const initialProducts: Product[] = [
  {
    ...createInitialDraft(),
    id: "prod-1",
    name: "שלט אזור מחסה",
    description: "שלט תאורת חירום לאזור מחסה, כולל סוללת גיבוי.",
    categories: ["תאורת חירום", "תאורת פנים"],
    createdAt: "2026-07-29",
    simple: {
      ...createInitialDraft().simple,
      sku: "30347",
      price: "142",
      inventoryStatus: "in_stock",
    },
  },
  {
    ...createInitialDraft(),
    id: "prod-2",
    name: "אנדזו",
    description: "צילינדר תאורה טכני, זמין במספר הספקים.",
    categories: ["צילינדרים תאורה", "תאורה טכנית", "תאורת פנים"],
    createdAt: "2026-07-29",
    productType: "variant",
    variant: {
      ...createInitialDraft().variant,
      sku: "30421WW",
      attributes: [{ attributeId: "attr-power", selectedValueIds: ["val-power-12", "val-power-15"], meantForVariants: true }],
      variants: [
        {
          id: "variant-1",
          sku: "30421WW-12",
          optionValues: { "attr-power": "val-power-12" },
          isActive: true,
          price: "189",
          discountPrice: "",
          inventoryStatus: "in_stock",
          expanded: false,
        },
        {
          id: "variant-2",
          sku: "30421WW-15",
          optionValues: { "attr-power": "val-power-15" },
          isActive: true,
          price: "219",
          discountPrice: "",
          inventoryStatus: "in_stock",
          expanded: false,
        },
      ],
    },
  },
  {
    ...createInitialDraft(),
    id: "prod-3",
    name: "ארמטורה קיר — פרטי",
    categories: ["מנורות תלייה", "תאורת פנים"],
    createdAt: "2026-07-21",
    simple: { ...createInitialDraft().simple, sku: "65010002" },
  },
  {
    ...createInitialDraft(),
    id: "prod-4",
    name: "מליבו — פרטי",
    categories: ["פנסי הצפה / רחוב", "תאורת חוץ"],
    createdAt: "2026-07-19",
  },
  {
    ...createInitialDraft(),
    id: "prod-5",
    name: "SYSTEM 15/8",
    categories: ["פרופיל שקוע", "תאורה, תאורה טכנית", "תאורת פנים"],
    createdAt: "2026-07-12",
    simple: { ...createInitialDraft().simple, sku: "30803" },
  },
];
