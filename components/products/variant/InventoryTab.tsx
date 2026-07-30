"use client";

import { WarehouseSelect } from "@/components/products/shared/WarehouseSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export function VariantInventoryTab() {
  const packageAmount = useStore((state) => state.draft.variant.packageAmount);
  const warehouseId = useStore((state) => state.draft.variant.warehouseId);
  const setVariantPackageAmount = useStore((state) => state.setVariantPackageAmount);
  const setVariantWarehouse = useStore((state) => state.setVariantWarehouse);

  return (
    <div className="flex max-w-xs flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="variant-package-amount">כמות באריזה</Label>
        <Input
          id="variant-package-amount"
          type="number"
          inputMode="numeric"
          value={packageAmount}
          onChange={(event) => setVariantPackageAmount(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>בחירת מחסן</Label>
        <WarehouseSelect value={warehouseId} onChange={setVariantWarehouse} />
      </div>
    </div>
  );
}
