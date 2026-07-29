"use client";

import { useRef, useState } from "react";
import { uploadProductImage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";

export function ImageUploadField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadProductImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "העלאת התמונה נכשלה");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
        {isUploading ? (
          <Loader2 className="text-muted-foreground size-5 animate-spin" />
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <ImageIcon className="text-muted-foreground size-6" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Input
          placeholder="הדבקת כתובת URL של תמונה"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value || null)}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload />
            העלאה מהמחשב
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X />
              הסרה
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    </div>
  );
}
