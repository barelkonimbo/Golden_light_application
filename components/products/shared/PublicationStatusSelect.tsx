"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PUBLICATION_STATUS_LABELS, PublicationStatus } from "@/lib/types";

export function PublicationStatusSelect({
  value,
  onChange,
  className,
}: {
  value: PublicationStatus;
  onChange: (value: PublicationStatus) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(value) => onChange(value as PublicationStatus)}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(PUBLICATION_STATUS_LABELS).map(([status, label]) => (
          <SelectItem key={status} value={status}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
