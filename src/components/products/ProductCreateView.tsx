"use client";

import { useState } from "react";
import { ProductDataSection } from "@/components/products/ProductDataSection";
import { AdditionalMediaSection } from "@/components/products/shared/AdditionalMediaSection";
import { ImageUploadField } from "@/components/products/shared/ImageUploadField";
import { RelatedGroupsSection } from "@/components/products/shared/RelatedGroupsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast-store";
import { toFriendlyMessage } from "@/lib/errors";
import { ArrowRight } from "lucide-react";

export function ProductCreateView() {
  const name = useStore((state) => state.draft.name);
  const description = useStore((state) => state.draft.description);
  const imageUrls = useStore((state) => state.draft.imageUrls);
  const thumbnailUrl = useStore((state) => state.draft.thumbnailUrl);
  const productType = useStore((state) => state.draft.productType);
  const handle = useStore((state) => state.draft.variant.handle);
  const setName = useStore((state) => state.setName);
  const setDescription = useStore((state) => state.setDescription);
  const setProductImages = useStore((state) => state.setProductImages);
  const setThumbnail = useStore((state) => state.setThumbnail);
  const setVariantHandle = useStore((state) => state.setVariantHandle);
  const setView = useStore((state) => state.setView);
  const saveDraft = useStore((state) => state.saveDraft);
  const editingProductId = useStore((state) => state.editingProductId);
  const isSaving = useStore((state) => state.isSaving);
  const saveAttempted = useStore((state) => state.saveAttempted);
  const [nameTouched, setNameTouched] = useState(false);

  const isEditing = editingProductId !== null;
  const showNameError = (nameTouched || saveAttempted) && !name.trim();

  function handleSave() {
    saveDraft()
      .then(() => {
        toast.success(isEditing ? "המוצר עודכן בהצלחה" : "המוצר נוסף בהצלחה");
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((error) => {
        toast.error(
          isEditing ? "עדכון המוצר נכשל" : "הוספת המוצר נכשלה",
          toFriendlyMessage(error)
        );
      });
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6 md:p-8">
      <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 border-b bg-zinc-50/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:-mx-8 md:px-8 dark:bg-black/95">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView("list")}>
            <ArrowRight />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {isEditing ? "עדכון מוצר" : "הוספת מוצר חדש"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setView("list")}>
            ביטול
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? "שומר..." : isEditing ? "עדכון מוצר" : "שמירת מוצר"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label>תמונת מוצר</Label>
            <ImageUploadField
              values={imageUrls}
              onChange={setProductImages}
              thumbnailUrl={thumbnailUrl}
              onThumbnailChange={setThumbnail}
            />
            {imageUrls.length > 1 && (
              <p className="text-muted-foreground text-sm">
                יש ללחוץ על סמל הכוכב בתמונה כדי לקבוע אותה כתמונה הראשית של המוצר.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="product-name">
              שם המוצר <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setNameTouched(true)}
              aria-invalid={showNameError}
            />
            {showNameError && <p className="text-destructive text-sm">שדה חובה</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="product-description">תיאור המוצר</Label>
            <Textarea
              id="product-description"
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          {productType === "variant" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="product-handle">מזהה</Label>
              <Input
                id="product-handle"
                value={handle}
                onChange={(event) => setVariantHandle(event.target.value)}
                placeholder="לדוגמה: metro-flag, nexos"
              />
              <p className="text-muted-foreground text-sm">
                יש להזין מזהה טקסטואלי (מילה אחת, ללא רווחים) עבור המוצר, לדוגמה: metro-flag, nexos. השדה אינו חובה - אם יישאר ריק, Medusa תיצור מזהה אוטומטית.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>מדיה נוספת</CardTitle>
        </CardHeader>
        <CardContent>
          <AdditionalMediaSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>קבוצות מוצרים קשורים</CardTitle>
        </CardHeader>
        <CardContent>
          <RelatedGroupsSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>נתוני מוצר</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductDataSection />
        </CardContent>
      </Card>
    </div>
  );
}
