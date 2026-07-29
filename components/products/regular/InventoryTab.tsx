"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryStatusSelect } from "@/components/products/shared/InventoryStatusSelect";
import { useStore } from "@/lib/store";

export function RegularInventoryTab() {
  const sku = useStore((state) => state.draft.simple.sku);
  const inventoryStatus = useStore((state) => state.draft.simple.inventoryStatus);
  const setSimpleField = useStore((state) => state.setSimpleField);
  const setSimpleInventoryStatus = useStore((state) => state.setSimpleInventoryStatus);

  return (
    <div className="flex max-w-xs flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="simple-sku">מק&quot;ט</Label>
        <Input
          id="simple-sku"
          value={sku}
          onChange={(event) => setSimpleField("sku", event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>מצב מלאי</Label>
        <InventoryStatusSelect value={inventoryStatus} onChange={setSimpleInventoryStatus} />
      </div>
    </div>
  );
}
