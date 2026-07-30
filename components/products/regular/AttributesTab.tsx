"use client";

import { AddAttributeDialog } from "@/components/products/shared/AddAttributeDialog";
import { AddValueDialog } from "@/components/products/shared/AddValueDialog";
import { AttributeSelect } from "@/components/products/shared/AttributeSelect";
import { ValuesMultiSelect } from "@/components/products/shared/ValuesMultiSelect";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Trash2 } from "lucide-react";

export function RegularAttributesTab() {
  const attributes = useStore((state) => state.attributes);
  const selections = useStore((state) => state.draft.simple.attributes);
  const addSimpleAttribute = useStore((state) => state.addSimpleAttribute);
  const removeSimpleAttribute = useStore((state) => state.removeSimpleAttribute);
  const toggleSimpleAttributeValue = useStore((state) => state.toggleSimpleAttributeValue);
  const removeAttributeValue = useStore((state) => state.removeAttributeValue);
  const removeAttribute = useStore((state) => state.removeAttribute);

  const availableAttributes = attributes.filter(
    (attribute) => !selections.some((selection) => selection.attributeId === attribute.id)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <AttributeSelect
          attributes={availableAttributes}
          onSelect={addSimpleAttribute}
          onDeleteAttribute={(attributeId) =>
            removeAttribute(attributeId).catch((error) =>
              console.error("מחיקת התכונה נכשלה", error)
            )
          }
        />
        <AddAttributeDialog
          onCreated={(attributeId, valueIds) => {
            addSimpleAttribute(attributeId);
            valueIds.forEach((valueId) => toggleSimpleAttributeValue(attributeId, valueId));
          }}
        />
      </div>

      {selections.length === 0 ? (
        <p className="text-muted-foreground text-sm">לא נבחרו תכונות עבור מוצר זה.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {selections.map((selection) => {
            const attribute = attributes.find((item) => item.id === selection.attributeId);
            if (!attribute) return null;
            return (
              <div
                key={selection.attributeId}
                className="bg-muted/30 flex flex-wrap items-start gap-3 rounded-lg border p-3"
              >
                <span className="w-28 shrink-0 pt-2 text-sm font-medium">{attribute.name}</span>
                <ValuesMultiSelect
                  values={attribute.values}
                  selectedValueIds={selection.valueIds}
                  onToggle={(valueId) => toggleSimpleAttributeValue(attribute.id, valueId)}
                  onDeleteValue={(valueId) =>
                    removeAttributeValue(attribute.id, valueId).catch((error) =>
                      console.error("מחיקת הערך נכשלה", error)
                    )
                  }
                />
                <AddValueDialog
                  attributeId={attribute.id}
                  onCreated={(valueIds) =>
                    valueIds.forEach((valueId) =>
                      toggleSimpleAttributeValue(attribute.id, valueId)
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive ms-auto"
                  aria-label={`מחיקת תכונה ${attribute.name}`}
                  onClick={() => removeSimpleAttribute(selection.attributeId)}
                >
                  <Trash2 />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
