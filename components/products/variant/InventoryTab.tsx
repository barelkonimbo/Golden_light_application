"use client";

import { WarehouseSelect } from "@/components/products/shared/WarehouseSelect";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export function VariantInventoryTab() {
  const warehouseId = useStore((state) => state.draft.variant.warehouseId);
  const setVariantWarehouse = useStore((state) => state.setVariantWarehouse);

  return (
    <div className="flex max-w-xs flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>בחירת מחסן</Label>
        <WarehouseSelect value={warehouseId} onChange={setVariantWarehouse} />
      </div>
    </div>
  );
}
