"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export function RegularGeneralTab() {
  const price = useStore((state) => state.draft.simple.price);
  const discountPrice = useStore((state) => state.draft.simple.discountPrice);
  const setSimpleField = useStore((state) => state.setSimpleField);

  return (
    <div className="grid max-w-md grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="simple-price">מחיר רגיל (₪)</Label>
        <Input
          id="simple-price"
          type="number"
          inputMode="decimal"
          value={price}
          onChange={(event) => setSimpleField("price", event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="simple-discount-price">מחיר מבצע (₪)</Label>
        <Input
          id="simple-discount-price"
          type="number"
          inputMode="decimal"
          value={discountPrice}
          onChange={(event) => setSimpleField("discountPrice", event.target.value)}
        />
      </div>
    </div>
  );
}
