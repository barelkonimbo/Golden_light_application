"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export function VariantInventoryTab() {
  const sku = useStore((state) => state.draft.variant.sku);
  const setVariantSku = useStore((state) => state.setVariantSku);

  return (
    <div className="flex max-w-xs flex-col gap-2">
      <Label htmlFor="variant-sku">מק&quot;ט</Label>
      <Input id="variant-sku" value={sku} onChange={(event) => setVariantSku(event.target.value)} />
    </div>
  );
}
