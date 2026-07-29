"use client";

import { useState } from "react";
import { AddAttributeDialog } from "@/components/products/shared/AddAttributeDialog";
import { AddValueDialog } from "@/components/products/shared/AddValueDialog";
import { ValuesMultiSelect } from "@/components/products/shared/ValuesMultiSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { ChevronDown, ChevronUp, X } from "lucide-react";

export function VariantAttributesTab() {
  const attributes = useStore((state) => state.attributes);
  const selections = useStore((state) => state.draft.variant.attributes);
  const addVariantAttribute = useStore((state) => state.addVariantAttribute);
  const removeVariantAttribute = useStore((state) => state.removeVariantAttribute);
  const toggleVariantAttributeValue = useStore((state) => state.toggleVariantAttributeValue);
  const removeAttributeValue = useStore((state) => state.removeAttributeValue);
  const setVariantAttributeMeantForVariants = useStore(
    (state) => state.setVariantAttributeMeantForVariants
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const availableAttributes = attributes.filter(
    (attribute) => !selections.some((selection) => selection.attributeId === attribute.id)
  );

  function toggleExpanded(attributeId: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(attributeId)) next.delete(attributeId);
      else next.add(attributeId);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Select value="" onValueChange={(attributeId) => addVariantAttribute(attributeId)}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="בחר תכונה קיימת" />
          </SelectTrigger>
          <SelectContent>
            {availableAttributes.map((attribute) => (
              <SelectItem key={attribute.id} value={attribute.id}>
                {attribute.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AddAttributeDialog
          onCreated={(attributeId) => {
            addVariantAttribute(attributeId);
            setExpanded((current) => new Set(current).add(attributeId));
          }}
        />
      </div>

      {selections.length === 0 ? (
        <p className="text-muted-foreground text-sm">לא נבחרו תכונות עבור מוצר זה.</p>
      ) : (
        <div className="flex flex-col gap-2 rounded-lg border">
          {selections.map((selection) => {
            const attribute = attributes.find((item) => item.id === selection.attributeId);
            if (!attribute) return null;
            const isExpanded = expanded.has(attribute.id);
            return (
              <div key={selection.attributeId} className="not-last:border-b">
                <div className="hover:bg-muted/40 flex items-center gap-2 px-4 transition-colors">
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-2 py-2.5 text-start text-sm font-medium"
                    onClick={() => toggleExpanded(attribute.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="text-muted-foreground size-4" />
                    ) : (
                      <ChevronDown className="text-muted-foreground size-4" />
                    )}
                    {attribute.name}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariantAttribute(selection.attributeId)}
                  >
                    <X />
                  </Button>
                </div>
                {isExpanded && (
                  <div className="flex flex-col gap-4 px-4 pb-4">
                    <div className="flex items-center gap-3">
                      <ValuesMultiSelect
                        values={attribute.values}
                        selectedValueIds={selection.selectedValueIds}
                        onToggle={(valueId) => toggleVariantAttributeValue(attribute.id, valueId)}
                        onDeleteValue={(valueId) => removeAttributeValue(attribute.id, valueId)}
                      />
                      <AddValueDialog
                        attributeId={attribute.id}
                        onCreated={(valueIds) =>
                          valueIds.forEach((valueId) =>
                            toggleVariantAttributeValue(attribute.id, valueId)
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`meant-for-variants-${attribute.id}`}
                        checked={selection.meantForVariants}
                        onCheckedChange={(checked) =>
                          setVariantAttributeMeantForVariants(attribute.id, checked === true)
                        }
                      />
                      <Label htmlFor={`meant-for-variants-${attribute.id}`}>
                        נועד עבור וריאציות
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
