"use client";

import { RegularProductData } from "@/components/products/regular/RegularProductData";
import { VariantProductData } from "@/components/products/variant/VariantProductData";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { ProductType } from "@/lib/types";

export function ProductDataSection() {
  const productType = useStore((state) => state.draft.productType);
  const setProductType = useStore((state) => state.setProductType);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>סוג מוצר</Label>
        <Select
          value={productType}
          onValueChange={(value) => setProductType(value as ProductType)}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">מוצר רגיל</SelectItem>
            <SelectItem value="variant">מוצר עם וריאציות</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border p-5">
        {productType === "simple" ? <RegularProductData /> : <VariantProductData />}
      </div>
    </div>
  );
}
