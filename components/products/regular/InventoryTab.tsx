"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export function RegularInventoryTab() {
  const sku = useStore((state) => state.draft.simple.sku);
  const stockQuantity = useStore((state) => state.draft.simple.stockQuantity);
  const isActive = useStore((state) => state.draft.simple.isActive);
  const setSimpleField = useStore((state) => state.setSimpleField);
  const setSimpleActive = useStore((state) => state.setSimpleActive);

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
        <Label htmlFor="simple-stock-quantity">כמות במלאי</Label>
        <Input
          id="simple-stock-quantity"
          type="number"
          inputMode="numeric"
          value={stockQuantity}
          onChange={(event) => setSimpleField("stockQuantity", event.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="simple-active"
          checked={isActive}
          onCheckedChange={(checked) => setSimpleActive(checked === true)}
        />
        <Label htmlFor="simple-active">פעיל</Label>
      </div>
    </div>
  );
}
