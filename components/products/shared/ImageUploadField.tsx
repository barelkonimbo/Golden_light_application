"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Upload, X } from "lucide-react";

export function ImageUploadField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isBlob = value?.startsWith("blob:") ?? false;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onChange(URL.createObjectURL(file));
    event.target.value = "";
  }

  return (
    <div className="flex items-start gap-4">
      <div className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <ImageIcon className="text-muted-foreground size-6" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Input
          placeholder="הדבקת כתובת URL של תמונה"
          value={isBlob ? "" : (value ?? "")}
          onChange={(event) => onChange(event.target.value || null)}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
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
      </div>
    </div>
  );
}
