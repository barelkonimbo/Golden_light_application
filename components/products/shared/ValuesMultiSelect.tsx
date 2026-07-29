"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AttributeValue } from "@/lib/types";
import { ChevronDown, X } from "lucide-react";

export function ValuesMultiSelect({
  values,
  selectedValueIds,
  onToggle,
}: {
  values: AttributeValue[];
  selectedValueIds: string[];
  onToggle: (valueId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-56 justify-between font-normal">
            בחירת ערכים
            <ChevronDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                {values.map((value) => (
                  <CommandItem
                    key={value.id}
                    value={value.value}
                    data-checked={selectedValueIds.includes(value.id)}
                    onSelect={() => onToggle(value.id)}
                  >
                    {value.value}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedValueIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedValueIds.map((valueId) => {
            const value = values.find((item) => item.id === valueId);
            if (!value) return null;
            return (
              <Badge key={valueId} variant="secondary" className="gap-1">
                {value.value}
                <button type="button" onClick={() => onToggle(valueId)}>
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
