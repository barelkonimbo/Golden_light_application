"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Attribute } from "@/lib/types";
import { ChevronDown, Trash2 } from "lucide-react";

export function AttributeSelect({
  attributes,
  onSelect,
  onDeleteAttribute,
}: {
  attributes: Attribute[];
  onSelect: (attributeId: string) => void;
  /** When provided, shows a delete affordance that removes the attribute from the shared library entirely. */
  onDeleteAttribute?: (attributeId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="max-w-xs justify-between font-normal">
          בחר תכונה קיימת
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {attributes.map((attribute) => (
                <CommandItem
                  key={attribute.id}
                  value={attribute.name}
                  onSelect={() => {
                    onSelect(attribute.id);
                    setOpen(false);
                  }}
                >
                  <span className="flex-1">{attribute.name}</span>
                  {onDeleteAttribute && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteAttribute(attribute.id);
                      }}
                      aria-label={`מחיקת תכונה ${attribute.name}`}
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
  );
}
