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

export function AddAttributeDialog({
  onCreated,
}: {
  onCreated: (attributeId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const addAttribute = useStore((state) => state.addAttribute);

  function handleSave() {
    if (!name.trim() || !value.trim()) return;
    const { attributeId } = addAttribute(name.trim(), value.trim());
    onCreated(attributeId);
    setName("");
    setValue("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Plus />
          תכונה חדשה
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוספת תכונה חדשה</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-attr-name">שם התכונה</Label>
            <Input
              id="new-attr-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='למשל: "צבע"'
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-attr-value">ערך</Label>
            <Input
              id="new-attr-value"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder='למשל: "אדום"'
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              ביטול
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!name.trim() || !value.trim()}>
            שמירה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
