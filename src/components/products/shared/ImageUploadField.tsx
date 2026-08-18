"use client";

import { useRef, useState } from "react";
import { uploadProductImage } from "@/lib/api";
import { toFriendlyMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Loader2, Star, Upload, X } from "lucide-react";

export function ImageUploadField({
  values,
  onChange,
  thumbnailUrl,
  onThumbnailChange,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
  /** When provided (together with onThumbnailChange), each image tile gets a
   *  "set as main image" toggle. Omit for image fields where picking a main
   *  image doesn't apply. */
  thumbnailUrl?: string | null;
  onThumbnailChange?: (url: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    try {
      let current = values;
      for (const file of files) {
        const url = await uploadProductImage(file);
        current = [...current, url];
        onChange(current);
      }
    } catch (err) {
      setError(toFriendlyMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  function handleAddUrl() {
    const url = urlInput.trim();
    if (!url) return;
    onChange([...values, url]);
    setUrlInput("");
  }

  function handleRemove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {values.map((url, index) => {
          const isThumbnail = onThumbnailChange && (thumbnailUrl ? thumbnailUrl === url : index === 0);
          return (
            <div
              key={`${url}-${index}`}
              className="bg-muted group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
            >
              <img src={url} alt="" className="size-full object-cover" />
              {onThumbnailChange && (
                <button
                  type="button"
                  onClick={() => onThumbnailChange(isThumbnail ? null : url)}
                  aria-label={isThumbnail ? "תמונה ראשית" : "הפיכה לתמונה ראשית"}
                  title={isThumbnail ? "תמונה ראשית" : "הפיכה לתמונה ראשית"}
                  className={`absolute bottom-1 left-1 rounded-full p-0.5 transition-opacity ${
                    isThumbnail
                      ? "bg-background/80 opacity-100"
                      : "bg-background/80 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Star className={`size-3.5 ${isThumbnail ? "fill-current" : ""}`} />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label="הסרת תמונה"
                className="bg-background/80 absolute top-1 right-1 rounded-full p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
        {isUploading && (
          <div className="bg-muted flex size-20 shrink-0 items-center justify-center rounded-lg border">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        )}
        {values.length === 0 && !isUploading && (
          <div className="bg-muted flex size-20 shrink-0 items-center justify-center rounded-lg border">
            <ImageIcon className="text-muted-foreground size-6" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="הדבקת כתובת URL של תמונה"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddUrl();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddUrl} disabled={!urlInput.trim()}>
            הוספה
          </Button>
        </div>
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    </div>
  );
}
