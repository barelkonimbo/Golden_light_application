"use client";

import { InventoryStatusSelect } from "@/components/products/shared/InventoryStatusSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

export function VariantsTab() {
  const attributes = useStore((state) => state.attributes);
  const attributeSelections = useStore((state) => state.draft.variant.attributes);
  const rows = useStore((state) => state.draft.variant.variants);
  const generateVariants = useStore((state) => state.generateVariants);
  const removeVariantRow = useStore((state) => state.removeVariantRow);
  const toggleVariantRowExpanded = useStore((state) => state.toggleVariantRowExpanded);
  const updateVariantRow = useStore((state) => state.updateVariantRow);

  const variantAttributes = attributeSelections
    .filter((selection) => selection.meantForVariants && selection.selectedValueIds.length > 0)
    .map((selection) => attributes.find((attribute) => attribute.id === selection.attributeId))
    .filter((attribute): attribute is NonNullable<typeof attribute> => Boolean(attribute));

  function valueLabel(attributeId: string, valueId: string) {
    const attribute = attributes.find((item) => item.id === attributeId);
    return attribute?.values.find((value) => value.id === valueId)?.value ?? "—";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {variantAttributes.length === 0
            ? 'סמנו תכונות כ"נועד עבור וריאציות" בלשונית התכונות כדי ליצור וריאציות.'
            : `${rows.length} וריאציות`}
        </p>
        <Button type="button" onClick={generateVariants} disabled={variantAttributes.length === 0}>
          ליצירת סוגים
        </Button>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border">
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  className="flex flex-1 items-center gap-3 text-start"
                  onClick={() => toggleVariantRowExpanded(row.id)}
                >
                  {row.expanded ? (
                    <ChevronUp className="size-4 shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 shrink-0" />
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {variantAttributes.map((attribute) => (
                      <Badge key={attribute.id} variant="secondary">
                        {valueLabel(attribute.id, row.optionValues[attribute.id])}
                      </Badge>
                    ))}
                  </div>
                  {row.sku && <span className="text-muted-foreground text-sm">{row.sku}</span>}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariantRow(row.id)}
                >
                  <Trash2 />
                </Button>
              </div>

              {row.expanded && (
                <div className="grid grid-cols-2 gap-4 border-t p-4 sm:grid-cols-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`sku-${row.id}`}>מק&quot;ט</Label>
                    <Input
                      id={`sku-${row.id}`}
                      value={row.sku}
                      onChange={(event) => updateVariantRow(row.id, { sku: event.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`price-${row.id}`}>מחיר (₪)</Label>
                    <Input
                      id={`price-${row.id}`}
                      type="number"
                      inputMode="decimal"
                      value={row.price}
                      onChange={(event) => updateVariantRow(row.id, { price: event.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`discount-${row.id}`}>מחיר מבצע (₪)</Label>
                    <Input
                      id={`discount-${row.id}`}
                      type="number"
                      inputMode="decimal"
                      value={row.discountPrice}
                      onChange={(event) =>
                        updateVariantRow(row.id, { discountPrice: event.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>מצב מלאי</Label>
                    <InventoryStatusSelect
                      value={row.inventoryStatus}
                      onChange={(status) => updateVariantRow(row.id, { inventoryStatus: status })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`active-${row.id}`}
                      checked={row.isActive}
                      onCheckedChange={(checked) =>
                        updateVariantRow(row.id, { isActive: checked === true })
                      }
                    />
                    <Label htmlFor={`active-${row.id}`}>פעיל</Label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
