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
  /** Called after the value(s) are added to the attribute's shared value pool. Does not select them. */
  onCreated?: (valueIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addAttributeValue = useStore((state) => state.addAttributeValue);

  async function handleSave() {
    const values = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (values.length === 0) return;

    setIsSaving(true);
    setError(null);
    try {
      const valueIds = await Promise.all(values.map((item) => addAttributeValue(attributeId, item)));
      onCreated?.(valueIds);
      setValue("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירת הערך נכשלה");
    } finally {
      setIsSaving(false);
    }
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
          <Label htmlFor="new-value">ערך (ניתן להוסיף כמה ערכים, מופרדים בפסיק)</Label>
          <Input
            id="new-value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder='למשל: "אדום, כחול, ירוק"'
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
            }}
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              ביטול
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!value.trim() || isSaving}>
            {isSaving ? "שומר..." : "שמירה"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
