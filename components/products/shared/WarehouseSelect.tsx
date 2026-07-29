"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";

const UNSET = "__unset__";

export function WarehouseSelect({
  value,
  onChange,
  className,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}) {
  const warehouses = useStore((state) => state.warehouses);

  return (
    <Select value={value ?? UNSET} onValueChange={(value) => onChange(value === UNSET ? null : value)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="בחר מחסן" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSET}>ללא</SelectItem>
        {warehouses.map((warehouse) => (
          <SelectItem key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
