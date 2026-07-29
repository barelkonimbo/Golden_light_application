"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Plus } from "lucide-react";

export function ProductListView() {
  const products = useStore((state) => state.products);
  const startCreateProduct = useStore((state) => state.startCreateProduct);
  const startEditProduct = useStore((state) => state.startEditProduct);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">מוצרים</h1>
          <p className="text-muted-foreground text-sm">
            {products.length} מוצרים בקטלוג
          </p>
        </div>
        <Button onClick={startCreateProduct}>
          <Plus />
          הוספת מוצר חדש
        </Button>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 ps-6">שם</TableHead>
              <TableHead>מק&quot;ט</TableHead>
              <TableHead>מחיר</TableHead>
              <TableHead>קטגוריות</TableHead>
              <TableHead className="pe-6">תאריך יצירה</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
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
                  {product.categories.length > 0 ? product.categories.join(", ") : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground pe-6">{product.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
