"use client";

import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { productPriceLabel, productSku } from "@/lib/types";
import { Plus, Search, Trash2 } from "lucide-react";

export function ProductListView() {
  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories);
  const startCreateProduct = useStore((state) => state.startCreateProduct);
  const startEditProduct = useStore((state) => state.startEditProduct);
  const deleteProduct = useStore((state) => state.deleteProduct);
  const [query, setQuery] = useState("");

  function categoryNames(categoryIds: string[]) {
    return categoryIds
      .map((id) => categories.find((category) => category.id === id)?.name)
      .filter((name): name is string => Boolean(name));
  }

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        productSku(product),
        ...categoryNames(product.organization.categoryIds),
        ...product.organization.tags,
        ...(product.productType === "variant"
          ? product.variant.variants.map((variant) => variant.sku)
          : []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, query, categories]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">מוצרים</h1>
          <p className="text-muted-foreground text-sm">
            {filteredProducts.length} מתוך {products.length} מוצרים בקטלוג
          </p>
        </div>
        <Button onClick={startCreateProduct}>
          <Plus />
          הוספת מוצר חדש
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="חיפוש לפי שם, מק&quot;ט, תיאור, קטגוריה או תגית"
          className="ps-9"
        />
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 ps-6">שם</TableHead>
              <TableHead>מק&quot;ט</TableHead>
              <TableHead>מחיר</TableHead>
              <TableHead>קטגוריות</TableHead>
              <TableHead>תאריך יצירה</TableHead>
              <TableHead className="w-10 pe-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="ps-6 font-medium">
                  <button
                    type="button"
                    onClick={() => startEditProduct(product.id)}
                    className="text-start text-blue-600 underline decoration-blue-600/30 underline-offset-4 transition-colors hover:decoration-blue-600 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:decoration-blue-400"
                  >
                    {product.name}
                  </button>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {productSku(product) || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {productPriceLabel(product)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {(() => {
                    const names = categoryNames(product.organization.categoryIds);
                    return names.length > 0 ? names.join(", ") : "—";
                  })()}
                </TableCell>
                <TableCell className="text-muted-foreground">{product.createdAt}</TableCell>
                <TableCell className="pe-6">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="מחיקת מוצר">
                        <Trash2 />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>מחיקת מוצר</AlertDialogTitle>
                        <AlertDialogDescription>
                          האם למחוק את המוצר &quot;{product.name}&quot;? פעולה זו אינה ניתנת לביטול.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteProduct(product.id)}>
                          מחיקה
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
