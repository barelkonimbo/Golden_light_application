"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEDIA_STATUS_LABELS, MediaStatus } from "@/lib/types";

export function MediaStatusSelect({
  value,
  onChange,
  disabled,
  className,
}: {
  value: MediaStatus;
  onChange: (value: MediaStatus) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(value) => onChange(value as MediaStatus)} disabled={disabled}>
      <SelectTrigger className={className} size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(MEDIA_STATUS_LABELS).map(([status, label]) => (
          <SelectItem key={status} value={status}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
