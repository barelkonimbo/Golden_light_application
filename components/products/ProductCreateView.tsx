"use client";

import { ProductDataSection } from "@/components/products/ProductDataSection";
import { ImageUploadField } from "@/components/products/shared/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { ArrowRight } from "lucide-react";

export function ProductCreateView() {
  const name = useStore((state) => state.draft.name);
  const description = useStore((state) => state.draft.description);
  const imageUrl = useStore((state) => state.draft.imageUrl);
  const setName = useStore((state) => state.setName);
  const setDescription = useStore((state) => state.setDescription);
  const setProductImage = useStore((state) => state.setProductImage);
  const setView = useStore((state) => state.setView);
  const saveDraft = useStore((state) => state.saveDraft);
  const editingProductId = useStore((state) => state.editingProductId);

  const isEditing = editingProductId !== null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
      <div className="sticky top-0 z-10 -mx-8 flex items-center justify-between border-b bg-zinc-50/95 px-8 py-4 backdrop-blur-sm dark:bg-black/95">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView("list")}>
            <ArrowRight />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditing ? "עדכון מוצר" : "הוספת מוצר חדש"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setView("list")}>
            ביטול
          </Button>
          <Button onClick={saveDraft} disabled={!name.trim()}>
            {isEditing ? "עדכון מוצר" : "שמירת מוצר"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label>תמונת מוצר</Label>
            <ImageUploadField value={imageUrl} onChange={setProductImage} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="product-name">שם המוצר</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
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
