"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AttributeValue } from "@/lib/types";
import { ChevronDown, Trash2, X } from "lucide-react";

export function ValuesMultiSelect({
  values,
  selectedValueIds,
  onToggle,
  onDeleteValue,
}: {
  values: AttributeValue[];
  selectedValueIds: string[];
  onToggle: (valueId: string) => void;
  /** When provided, shows a delete affordance that removes the value from the attribute entirely. */
  onDeleteValue?: (valueId: string) => void;
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
                    <span className="flex-1">{value.value}</span>
                    {onDeleteValue && (
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteValue(value.id);
                        }}
                        aria-label={`מחיקת ערך ${value.value}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
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
