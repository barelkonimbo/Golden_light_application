"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddAttributeDialog } from "@/components/products/shared/AddAttributeDialog";
import { AddValueDialog } from "@/components/products/shared/AddValueDialog";
import { useStore } from "@/lib/store";
import { X } from "lucide-react";

export function RegularAttributesTab() {
  const attributes = useStore((state) => state.attributes);
  const selections = useStore((state) => state.draft.simple.attributes);
  const addSimpleAttribute = useStore((state) => state.addSimpleAttribute);
  const removeSimpleAttribute = useStore((state) => state.removeSimpleAttribute);
  const setSimpleAttributeValue = useStore((state) => state.setSimpleAttributeValue);

  const availableAttributes = attributes.filter(
    (attribute) => !selections.some((selection) => selection.attributeId === attribute.id)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Select
          value=""
          onValueChange={(attributeId) => addSimpleAttribute(attributeId)}
        >
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
        <AddAttributeDialog onCreated={(attributeId) => addSimpleAttribute(attributeId)} />
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
                className="bg-muted/30 flex flex-wrap items-center gap-3 rounded-lg border p-3"
              >
                <span className="w-28 shrink-0 text-sm font-medium">{attribute.name}</span>
                <Select
                  value={selection.valueId ?? undefined}
                  onValueChange={(valueId) =>
                    setSimpleAttributeValue(selection.attributeId, valueId)
                  }
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="בחר ערך" />
                  </SelectTrigger>
                  <SelectContent>
                    {attribute.values.map((value) => (
                      <SelectItem key={value.id} value={value.id}>
                        {value.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AddValueDialog attributeId={attribute.id} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ms-auto"
                  onClick={() => removeSimpleAttribute(selection.attributeId)}
                >
                  <X />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
