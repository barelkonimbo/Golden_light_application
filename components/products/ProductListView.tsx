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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import {
  PRODUCT_TYPE_LABELS,
  PUBLICATION_STATUS_LABELS,
  Product,
  productPriceLabel,
  productSku,
  productStatus,
} from "@/lib/types";
import { ImageIcon, Loader2, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";

const ALL = "__all__";

type SortOption =
  | "date-desc"
  | "date-asc"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

const SORT_LABELS: Record<SortOption, string> = {
  "date-desc": "תאריך יצירה (חדש לישן)",
  "date-asc": "תאריך יצירה (ישן לחדש)",
  "name-asc": "שם (א-ת)",
  "name-desc": "שם (ת-א)",
  "price-asc": "מחיר (מהנמוך לגבוה)",
  "price-desc": "מחיר (מהגבוה לנמוך)",
};

function sortPrice(product: Product): number {
  if (product.productType === "simple") return Number(product.simple.price) || 0;
  const prices = product.variant.variants.map((variant) => Number(variant.price) || 0);
  return prices.length > 0 ? Math.min(...prices) : 0;
}

export function ProductListView() {
  const products = useStore((state) => state.products);
  const productsStatus = useStore((state) => state.productsStatus);
  const productsPage = useStore((state) => state.productsPage);
  const productsPageSize = useStore((state) => state.productsPageSize);
  const productsTotal = useStore((state) => state.productsTotal);
  const productsSearch = useStore((state) => state.productsSearch);
  const setProductsPage = useStore((state) => state.setProductsPage);
  const setProductsPageSize = useStore((state) => state.setProductsPageSize);
  const setProductsSearch = useStore((state) => state.setProductsSearch);
  const fetchProducts = useStore((state) => state.fetchProducts);
  const categories = useStore((state) => state.categories);
  const startCreateProduct = useStore((state) => state.startCreateProduct);
  const startEditProduct = useStore((state) => state.startEditProduct);
  const deleteProduct = useStore((state) => state.deleteProduct);
  const deletingProductId = useStore((state) => state.deletingProductId);
  const deleteError = useStore((state) => state.deleteError);
  const [query, setQuery] = useState(productsSearch);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [productTypeFilter, setProductTypeFilter] = useState(ALL);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  const totalPages = Math.max(1, Math.ceil(productsTotal / productsPageSize));
  const isProductsLoading = productsStatus === "loading";

  function categoryNames(categoryIds: string[]) {
    return categoryIds
      .map((id) => categories.find((category) => category.id === id)?.name)
      .filter((name): name is string => Boolean(name));
  }

  const visibleProducts = useMemo(() => {
    // Text search (name/description/handle/SKU) runs server-side against the
    // whole catalog - `products` already only contains matches. These are
    // extra client-side filters layered on top of that page.
    const filtered = products.filter((product) => {
      if (categoryFilter !== ALL && !product.organization.categoryIds.includes(categoryFilter)) {
        return false;
      }
      if (statusFilter !== ALL && productStatus(product) !== statusFilter) {
        return false;
      }
      if (productTypeFilter !== ALL && product.productType !== productTypeFilter) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return a.createdAt.localeCompare(b.createdAt);
        case "date-desc":
          return b.createdAt.localeCompare(a.createdAt);
        case "name-asc":
          return a.name.localeCompare(b.name, "he");
        case "name-desc":
          return b.name.localeCompare(a.name, "he");
        case "price-asc":
          return sortPrice(a) - sortPrice(b);
        case "price-desc":
          return sortPrice(b) - sortPrice(a);
        default:
          return 0;
      }
    });
    return sorted;
  }, [products, categoryFilter, statusFilter, productTypeFilter, sortBy]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">מוצרים</h1>
          <p className="text-muted-foreground text-sm">
            {visibleProducts.length} מוצגים מתוך {productsTotal} מוצרים בקטלוג
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="רענון רשימת המוצרים"
            onClick={() => void fetchProducts()}
            disabled={isProductsLoading}
          >
            <RefreshCw className={isProductsLoading ? "animate-spin" : undefined} />
          </Button>
          <Button onClick={startCreateProduct}>
            <Plus />
            הוספת מוצר חדש
          </Button>
        </div>
      </div>

      {deleteError && <p className="text-destructive text-sm">{deleteError}</p>}

      <div className="relative max-w-sm">
        <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void setProductsSearch(query.trim());
          }}
          placeholder="חיפוש לפי שם, מק&quot;ט או תיאור (בכל הקטלוג) - הקשה על Enter לחיפוש"
          className="ps-9 pe-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              if (productsSearch) void setProductsSearch("");
            }}
            aria-label="ניקוי חיפוש"
            className="text-muted-foreground hover:text-foreground absolute end-3 top-1/2 -translate-y-1/2"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>כל הקטגוריות</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>כל הסטטוסים</SelectItem>
            {Object.entries(PUBLICATION_STATUS_LABELS).map(([status, label]) => (
              <SelectItem key={status} value={status}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>כל סוגי המוצרים</SelectItem>
            {Object.entries(PRODUCT_TYPE_LABELS).map(([type, label]) => (
              <SelectItem key={type} value={type}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-56 sm:ms-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 w-16 ps-6" />
              <TableHead>שם</TableHead>
              <TableHead>מק&quot;ט</TableHead>
              <TableHead>מחיר</TableHead>
              <TableHead>קטגוריות</TableHead>
              <TableHead>תאריך יצירה</TableHead>
              <TableHead className="w-10 pe-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="ps-6">
                  <div className="bg-muted flex size-10 items-center justify-center overflow-hidden rounded-md border">
                    {product.imageUrls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrls[0]}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-muted-foreground size-4" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="מחיקת מוצר"
                        disabled={deletingProductId === product.id}
                      >
                        {deletingProductId === product.id ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Trash2 />
                        )}
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
                        <AlertDialogAction
                          onClick={() => deleteProduct(product.id).catch(() => {})}
                        >
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

      <div className="flex flex-wrap items-center justify-between gap-4" dir="rtl">
        <div className="flex items-center gap-2 text-sm">
          <span>הצג</span>
          <Select
            value={String(productsPageSize)}
            onValueChange={(value) => void setProductsPageSize(Number(value))}
            disabled={isProductsLoading}
          >
            <SelectTrigger
              className="h-9 w-24"
              aria-label="מספר מוצרים בעמוד"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>מוצרים בעמוד</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => void setProductsPage(productsPage - 1)}
            disabled={isProductsLoading || productsPage <= 1}
          >
            הקודם
          </Button>

          <span className="min-w-28 text-center text-sm">
            עמוד {productsPage} מתוך {totalPages}
          </span>

          <div className="flex items-center gap-2 text-sm">
            <span>מעבר לעמוד</span>
            <Select
              value={String(productsPage)}
              onValueChange={(value) => void setProductsPage(Number(value))}
              disabled={isProductsLoading || productsTotal === 0}
            >
              <SelectTrigger
                className="h-9 w-20"
                aria-label="מעבר לעמוד"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <SelectItem
                      key={pageNumber}
                      value={String(pageNumber)}
                    >
                      {pageNumber}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => void setProductsPage(productsPage + 1)}
            disabled={
              isProductsLoading ||
              productsPage >= totalPages ||
              productsTotal === 0
            }
          >
            הבא
          </Button>
        </div>
      </div>
    </div>
  );
}