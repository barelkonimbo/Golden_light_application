"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

const UNSET = "__unset__";

export function VariantsTab() {
  const attributes = useStore((state) => state.attributes);
  const attributeSelections = useStore((state) => state.draft.variant.attributes);
  const rows = useStore((state) => state.draft.variant.variants);
  const salesChannels = useStore((state) => state.salesChannels);
  const selectedChannelIds = useStore((state) => state.draft.organization.salesChannelIds);
  const addVariantRow = useStore((state) => state.addVariantRow);
  const removeVariantRow = useStore((state) => state.removeVariantRow);
  const toggleVariantRowExpanded = useStore((state) => state.toggleVariantRowExpanded);
  const updateVariantRow = useStore((state) => state.updateVariantRow);
  const setVariantRowOption = useStore((state) => state.setVariantRowOption);
  const setVariantRowChannelPrice = useStore((state) => state.setVariantRowChannelPrice);

  const variantAttributes = attributeSelections
    .filter((selection) => selection.meantForVariants)
    .map((selection) => ({
      attribute: attributes.find((attribute) => attribute.id === selection.attributeId),
      selectedValueIds: selection.selectedValueIds,
    }))
    .filter(
      (entry): entry is { attribute: NonNullable<typeof entry.attribute>; selectedValueIds: string[] } =>
        Boolean(entry.attribute)
    );

  const channels = selectedChannelIds
    .map((channelId) => salesChannels.find((channel) => channel.id === channelId))
    .filter((channel): channel is NonNullable<typeof channel> => Boolean(channel));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {variantAttributes.length === 0
            ? 'סמנו תכונות כ"נועד עבור וריאציות" בלשונית התכונות כדי להוסיף וריאציות.'
            : `${rows.length} וריאציות`}
        </p>
        <Button type="button" onClick={addVariantRow} disabled={variantAttributes.length === 0}>
          <Plus />
          הוספת וריאציה
        </Button>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border">
              <div className="flex flex-wrap items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggleVariantRowExpanded(row.id)}
                  aria-label="הרחבת וריאציה"
                >
                  {row.expanded ? (
                    <ChevronUp className="text-muted-foreground size-4 shrink-0" />
                  ) : (
                    <ChevronDown className="text-muted-foreground size-4 shrink-0" />
                  )}
                </button>

                <div className="flex flex-1 flex-wrap items-center gap-2">
                  {variantAttributes.map(({ attribute, selectedValueIds }) => (
                    <Select
                      key={attribute.id}
                      value={row.optionValues[attribute.id] ?? UNSET}
                      onValueChange={(valueId) =>
                        setVariantRowOption(row.id, attribute.id, valueId === UNSET ? null : valueId)
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNSET}>כל {attribute.name}</SelectItem>
                        {attribute.values
                          .filter((value) => selectedValueIds.includes(value.id))
                          .map((value) => (
                            <SelectItem key={value.id} value={value.id}>
                              {value.value}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>

                {row.sku && <span className="text-muted-foreground text-sm">{row.sku}</span>}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariantRow(row.id)}
                  aria-label="מחיקת וריאציה"
                >
                  <Trash2 />
                </Button>
              </div>

              {row.expanded && (
                <div className="flex flex-col gap-4 border-t p-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                      <Label htmlFor={`stock-${row.id}`}>כמות במלאי</Label>
                      <Input
                        id={`stock-${row.id}`}
                        type="number"
                        inputMode="numeric"
                        value={row.stockQuantity}
                        onChange={(event) =>
                          updateVariantRow(row.id, { stockQuantity: event.target.value })
                        }
                      />
                    </div>
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

                  {channels.length > 0 && (
                    <div className="flex flex-col gap-2 border-t pt-4">
                      <span className="text-sm font-medium">מחירים לפי ערוץ מכירה</span>
                      <div className="flex flex-col gap-2">
                        {channels.map((channel) => {
                          const channelPrice = row.channelPrices.find(
                            (item) => item.channelId === channel.id
                          );
                          return (
                            <div key={channel.id} className="flex items-center gap-3">
                              <span className="w-32 shrink-0 text-sm">{channel.name}</span>
                              <Input
                                type="number"
                                inputMode="decimal"
                                placeholder="מחיר (₪)"
                                className="max-w-40"
                                value={channelPrice?.price ?? ""}
                                onChange={(event) =>
                                  setVariantRowChannelPrice(
                                    row.id,
                                    channel.id,
                                    "price",
                                    event.target.value
                                  )
                                }
                              />
                              <Input
                                type="number"
                                inputMode="decimal"
                                placeholder="מחיר מבצע (₪)"
                                className="max-w-40"
                                value={channelPrice?.discountPrice ?? ""}
                                onChange={(event) =>
                                  setVariantRowChannelPrice(
                                    row.id,
                                    channel.id,
                                    "discountPrice",
                                    event.target.value
                                  )
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
