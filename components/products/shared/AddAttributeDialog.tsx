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
  onCreated: (attributeId: string, valueIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addAttribute = useStore((state) => state.addAttribute);

  async function handleSave() {
    const values = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!name.trim() || values.length === 0) return;

    setIsSaving(true);
    setError(null);
    try {
      const { attributeId, valueIds } = await addAttribute(name.trim(), values);
      onCreated(attributeId, valueIds);
      setName("");
      setValue("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירת התכונה נכשלה");
    } finally {
      setIsSaving(false);
    }
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
            <Label htmlFor="new-attr-value">ערך (ניתן להוסיף כמה ערכים, מופרדים בפסיק)</Label>
            <Input
              id="new-attr-value"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder='למשל: "אדום, כחול, ירוק"'
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              ביטול
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!name.trim() || !value.trim() || isSaving}>
            {isSaving ? "שומר..." : "שמירה"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
