"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NamedEntity } from "@/lib/types";
import { ChevronDown, X } from "lucide-react";

export function EntityMultiSelect({
  options,
  selectedIds,
  onToggle,
  placeholder,
}: {
  options: NamedEntity[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-64 justify-between font-normal">
            {placeholder}
            <ChevronDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    data-checked={selectedIds.includes(option.id)}
                    onSelect={() => onToggle(option.id)}
                  >
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const option = options.find((item) => item.id === id);
            if (!option) return null;
            return (
              <Badge key={id} variant="secondary" className="gap-1">
                {option.name}
                <button type="button" onClick={() => onToggle(id)}>
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
