"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { Dimensions } from "@/lib/types";

export function ShippingFields({
  dimensions,
  shipmentTypeId,
  onChangeDimension,
  onChangeShipmentType,
}: {
  dimensions: Dimensions;
  shipmentTypeId: string | null;
  onChangeDimension: (field: keyof Dimensions, value: string) => void;
  onChangeShipmentType: (shipmentTypeId: string | null) => void;
}) {
  const shipmentTypes = useStore((state) => state.shipmentTypes);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="weight">משקל (ק&quot;ג)</Label>
        <Input
          id="weight"
          type="number"
          inputMode="decimal"
          value={dimensions.weight}
          onChange={(event) => onChangeDimension("weight", event.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>מידות (אורך x רוחב x גובה) (סנטימטרים)</Label>
        <div className="grid max-w-md grid-cols-3 gap-3">
          <Input
            aria-label="אורך"
            placeholder="אורך"
            type="number"
            inputMode="decimal"
            value={dimensions.length}
            onChange={(event) => onChangeDimension("length", event.target.value)}
          />
          <Input
            aria-label="רוחב"
            placeholder="רוחב"
            type="number"
            inputMode="decimal"
            value={dimensions.width}
            onChange={(event) => onChangeDimension("width", event.target.value)}
          />
          <Input
            aria-label="גובה"
            placeholder="גובה"
            type="number"
            inputMode="decimal"
            value={dimensions.height}
            onChange={(event) => onChangeDimension("height", event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>סוג משלוח</Label>
        <Select
          value={shipmentTypeId ?? undefined}
          onValueChange={(value) => onChangeShipmentType(value)}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="בחר סוג משלוח" />
          </SelectTrigger>
          <SelectContent>
            {shipmentTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
