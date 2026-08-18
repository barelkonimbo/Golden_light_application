"use client";

import { PublicationStatusSelect } from "@/components/products/shared/PublicationStatusSelect";
import { WarehouseSelect } from "@/components/products/shared/WarehouseSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export function RegularInventoryTab() {
  const sku = useStore((state) => state.draft.simple.sku);
  const stockQuantity = useStore((state) => state.draft.simple.stockQuantity);
  const packageAmount = useStore((state) => state.draft.simple.packageAmount);
  const status = useStore((state) => state.draft.simple.status);
  const warehouseId = useStore((state) => state.draft.simple.warehouseId);
  const managedInventory = useStore((state) => state.draft.simple.managedInventory);
  const allowBackorder = useStore((state) => state.draft.simple.allowBackorder);
  const setSimpleField = useStore((state) => state.setSimpleField);
  const setSimpleStatus = useStore((state) => state.setSimpleStatus);
  const setSimpleWarehouse = useStore((state) => state.setSimpleWarehouse);
  const setSimpleManagedInventory = useStore((state) => state.setSimpleManagedInventory);
  const setSimpleAllowBackorder = useStore((state) => state.setSimpleAllowBackorder);

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
      <div className="flex flex-col gap-2">
        <Label htmlFor="simple-package-amount">כמות באריזה</Label>
        <Input
          id="simple-package-amount"
          type="number"
          inputMode="numeric"
          value={packageAmount}
          onChange={(event) => setSimpleField("packageAmount", event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>בחירת מחסן</Label>
        <WarehouseSelect value={warehouseId} onChange={setSimpleWarehouse} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>סטטוס</Label>
        <PublicationStatusSelect value={status} onChange={setSimpleStatus} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="simple-managed-inventory"
          checked={managedInventory}
          disabled={allowBackorder}
          title={allowBackorder ? 'נדרש ניהול מלאי כדי לאפשר הזמנה מראש' : undefined}
          onCheckedChange={(checked) => setSimpleManagedInventory(checked === true)}
        />
        <Label htmlFor="simple-managed-inventory">ניהול מלאי</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="simple-allow-backorder"
          checked={allowBackorder}
          onCheckedChange={(checked) => setSimpleAllowBackorder(checked === true)}
        />
        <Label htmlFor="simple-allow-backorder">אפשר הזמנה מראש כשאין מלאי</Label>
      </div>
    </div>
  );
}
