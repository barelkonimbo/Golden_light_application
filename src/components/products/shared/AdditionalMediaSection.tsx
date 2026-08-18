"use client";

import { useEffect, useRef, useState } from "react";
import { ADDITIONAL_MEDIA_ACCEPT } from "@/lib/api";
import { getThumbnailUrl, isImageType } from "@/lib/additionalMediaThumbnail";
import { toFriendlyMessage } from "@/lib/errors";
import { useStore } from "@/lib/store";
import { useImageWithRetry } from "@/hooks/useImageWithRetry";
import { Button } from "@/components/ui/button";
import { MediaStatusSelect } from "@/components/products/shared/MediaStatusSelect";
import { AdditionalMediaItem, MediaStatus } from "@/lib/types";
import { FileText, ImageIcon, Loader2, Music, Upload, Video, X } from "lucide-react";

function mediaIcon(mediaType: string) {
  if (mediaType === "video") return Video;
  if (mediaType === "audio") return Music;
  if (isImageType(mediaType)) return ImageIcon;
  return FileText;
}

/** Image types render an actual (small-variant) thumbnail; everything else
 *  falls back to a type icon. Tolerates the media Lambda's processing
 *  window - a thumbnail requested right after upload can 404 briefly before
 *  the resized variant lands in S3 - via useImageWithRetry. */
function MediaThumbnail({ item }: { item: AdditionalMediaItem }) {
  const isImage = isImageType(item.mediaType);
  const thumbnailUrl = isImage ? getThumbnailUrl(item.url, item.mediaWidthArray) : null;
  const { src, status, onLoad, onError } = useImageWithRetry(thumbnailUrl);
  const Icon = mediaIcon(item.mediaType);

  if (!isImage) {
    return (
      <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md border">
        <Icon className="text-muted-foreground size-4" />
      </div>
    );
  }

  return (
    <div className="bg-muted relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border">
      {status !== "ready" && (
        <Icon
          className={`absolute size-4 ${
            status === "failed" ? "text-destructive" : "text-muted-foreground animate-pulse"
          }`}
        />
      )}
      {status !== "failed" && src && (
        <img
          src={src}
          alt={item.alt ?? item.fileName}
          loading="lazy"
          decoding="async"
          onLoad={onLoad}
          onError={onError}
          className={`size-full object-cover ${status === "ready" ? "" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

export function AdditionalMediaSection() {
  const editingProductId = useStore((state) => state.editingProductId);
  const items = useStore((state) => state.additionalMedia);
  const status = useStore((state) => state.additionalMediaStatus);
  const error = useStore((state) => state.additionalMediaError);
  const isUploading = useStore((state) => state.uploadingAdditionalMedia);
  const loadAdditionalMedia = useStore((state) => state.loadAdditionalMedia);
  const uploadAdditionalMediaFile = useStore((state) => state.uploadAdditionalMediaFile);
  const setAdditionalMediaStatus = useStore((state) => state.setAdditionalMediaStatus);
  const removeAdditionalMedia = useStore((state) => state.removeAdditionalMedia);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProductId) loadAdditionalMedia(editingProductId);
  }, [editingProductId, loadAdditionalMedia]);

  if (!editingProductId) {
    return (
      <p className="text-muted-foreground text-sm">
        יש לשמור את המוצר לפני הוספת מדיה נוספת (קבצי PDF, וידאו וכו&apos;).
      </p>
    );
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setUploadError(null);
    for (const file of files) {
      try {
        await uploadAdditionalMediaFile(file);
      } catch (err) {
        setUploadError(toFriendlyMessage(err));
      }
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await removeAdditionalMedia(id);
    } catch (err) {
      setUploadError(toFriendlyMessage(err));
    } finally {
      setRemovingId(null);
    }
  }

  async function handleStatusChange(id: string, status: MediaStatus) {
    setUpdatingStatusId(id);
    try {
      await setAdditionalMediaStatus(id, status);
    } catch (err) {
      setUploadError(toFriendlyMessage(err));
    } finally {
      setUpdatingStatusId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {status === "loading" && items.length === 0 && (
        <p className="text-muted-foreground text-sm">טוען...</p>
      )}
      {(error || uploadError) && (
        <p className="text-destructive text-sm">{uploadError ?? error}</p>
      )}

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-2"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-2 text-sm hover:underline"
                >
                  <MediaThumbnail item={item} />
                  <span className="truncate">{item.fileName}</span>
                </a>
                <div className="flex shrink-0 items-center gap-2">
                  <MediaStatusSelect
                    value={item.status}
                    onChange={(status) => handleStatusChange(item.id, status)}
                    disabled={updatingStatusId === item.id}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item.id)}
                    disabled={removingId === item.id}
                    aria-label="הסרת קובץ"
                  >
                    {removingId === item.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
          {isUploading ? "מעלה..." : "העלאת קובץ"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ADDITIONAL_MEDIA_ACCEPT}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
