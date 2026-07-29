"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVENTORY_STATUS_LABELS, InventoryStatus } from "@/lib/types";

export function InventoryStatusSelect({
  value,
  onChange,
  className,
}: {
  value: InventoryStatus;
  onChange: (value: InventoryStatus) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(value) => onChange(value as InventoryStatus)}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(INVENTORY_STATUS_LABELS).map(([status, label]) => (
          <SelectItem key={status} value={status}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
