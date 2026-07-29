"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { Plus } from "lucide-react";

export function AddValueDialog({
  attributeId,
  onCreated,
}: {
  attributeId: string;
  /** Called after the value is added to the attribute's shared value pool. Does not select it. */
  onCreated?: (valueId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const addAttributeValue = useStore((state) => state.addAttributeValue);

  function handleSave() {
    if (!value.trim()) return;
    const valueId = addAttributeValue(attributeId, value.trim());
    onCreated?.(valueId);
    setValue("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Plus />
          ערך חדש
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוספת ערך חדש</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-value">ערך</Label>
          <Input
            id="new-value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
            }}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              ביטול
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!value.trim()}>
            שמירה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
