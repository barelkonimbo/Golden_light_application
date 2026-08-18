"use client";

import { useEffect, useMemo, useState } from "react";
import { listProducts } from "@/lib/api";
import { toFriendlyMessage } from "@/lib/errors";
import { useStore } from "@/lib/store";
import { Product, RelatedGroup, RelatedGroupItem, RelatedProductSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageIcon, Loader2 } from "lucide-react";

const PAGE_SIZE = 10;

function productRow(id: string, info: RelatedProductSummary | undefined) {
  return info ?? { id, title: id, thumbnailUrl: null };
}

export function ManageRelatedGroupModal({
  productId,
  group,
  open,
  onOpenChange,
}: {
  productId: string;
  group: RelatedGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const salesChannels = useStore((state) => state.salesChannels);
  const getRelatedGroupItems = useStore((state) => state.getRelatedGroupItems);
  const syncRelatedGroupItems = useStore((state) => state.syncRelatedGroupItems);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [channelsByProduct, setChannelsByProduct] = useState<Map<string, Set<string>>>(new Map());
  const [productInfo, setProductInfo] = useState<Map<string, RelatedProductSummary>>(new Map());

  const [search, setSearch] = useState("");
  const [searchPage, setSearchPage] = useState(0);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    getRelatedGroupItems(productId, group.id)
      .then(({ items, products }) => {
        if (cancelled) return;
        const map = new Map<string, Set<string>>();
        for (const item of items) {
          const set = map.get(item.relatedProductId) ?? new Set<string>();
          set.add(item.salesChannelId);
          map.set(item.relatedProductId, set);
        }
        setChannelsByProduct(map);
        setProductInfo((prev) => {
          const next = new Map(prev);
          for (const p of products) next.set(p.id, p);
          return next;
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(toFriendlyMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, group.id, getRelatedGroupItems]);

  useEffect(() => {
    let cancelled = false;
    setIsSearching(true);
    setSearchError(null);
    listProducts(searchPage + 1, PAGE_SIZE, search)
      .then((result) => {
        if (cancelled) return;
        const items = result.items.filter((p) => p.id !== productId);
        setSearchResults(items);
        setSearchTotal(result.total);
        setProductInfo((prev) => {
          const next = new Map(prev);
          for (const p of items) {
            next.set(p.id, { id: p.id, title: p.name, thumbnailUrl: p.thumbnailUrl || p.imageUrls[0] || null });
          }
          return next;
        });
      })
      .catch((err) => {
        if (!cancelled) setSearchError(toFriendlyMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, search, searchPage]);

  function toggleChannel(id: string, channelId: string) {
    setChannelsByProduct((prev) => {
      const next = new Map(prev);
      const current = new Set(next.get(id) ?? []);
      if (current.has(channelId)) current.delete(channelId);
      else current.add(channelId);
      if (current.size === 0) next.delete(id);
      else next.set(id, current);
      return next;
    });
  }

  function toggleAllChannels(id: string) {
    setChannelsByProduct((prev) => {
      const next = new Map(prev);
      const current = next.get(id) ?? new Set<string>();
      const allChecked = salesChannels.length > 0 && salesChannels.every((sc) => current.has(sc.id));
      if (allChecked) next.delete(id);
      else next.set(id, new Set(salesChannels.map((sc) => sc.id)));
      return next;
    });
  }

  const selectedIds = useMemo(() => [...channelsByProduct.keys()], [channelsByProduct]);

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    try {
      const items: RelatedGroupItem[] = [];
      channelsByProduct.forEach((channels, relatedProductId) => {
        channels.forEach((salesChannelId) => items.push({ relatedProductId, salesChannelId }));
      });
      await syncRelatedGroupItems(productId, group.id, items);
      onOpenChange(false);
    } catch (err) {
      setSaveError(toFriendlyMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  const searchPageCount = Math.max(1, Math.ceil(searchTotal / PAGE_SIZE));

  function renderRow(id: string, info: RelatedProductSummary) {
    const checkedChannels = channelsByProduct.get(id) ?? new Set<string>();
    const allChecked = salesChannels.length > 0 && salesChannels.every((sc) => checkedChannels.has(sc.id));
    const someChecked = checkedChannels.size > 0 && !allChecked;

    return (
      <TableRow key={id}>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="bg-muted flex size-8 shrink-0 items-center justify-center overflow-hidden rounded border">
              {info.thumbnailUrl ? (
                <img src={info.thumbnailUrl} alt="" className="size-full object-cover" />
              ) : (
                <ImageIcon className="text-muted-foreground size-4" />
              )}
            </div>
            <span className="max-w-48 truncate text-sm">{info.title}</span>
          </div>
        </TableCell>
        <TableCell>
          <Checkbox
            checked={allChecked ? true : someChecked ? "indeterminate" : false}
            onCheckedChange={() => toggleAllChannels(id)}
          />
        </TableCell>
        {salesChannels.map((channel) => (
          <TableCell key={channel.id}>
            <Checkbox
              checked={checkedChannels.has(channel.id)}
              onCheckedChange={() => toggleChannel(id, channel.id)}
            />
          </TableCell>
        ))}
      </TableRow>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>ניהול &quot;{group.title}&quot;</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="חיפוש מוצרים..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              setSearchPage(0);
            }
          }}
        />

        {isLoading ? (
          <p className="text-muted-foreground text-sm">טוען...</p>
        ) : loadError ? (
          <p className="text-destructive text-sm">{loadError}</p>
        ) : (
          <div className="flex-1 overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>מוצר</TableHead>
                  <TableHead>כלל הערוצים</TableHead>
                  {salesChannels.map((channel) => (
                    <TableHead key={channel.id}>{channel.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2 + salesChannels.length} className="bg-muted/50 text-sm font-medium">
                    נבחרו ({selectedIds.length})
                  </TableCell>
                </TableRow>
                {selectedIds.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2 + salesChannels.length} className="text-muted-foreground text-sm">
                      טרם נבחרו מוצרים
                    </TableCell>
                  </TableRow>
                )}
                {selectedIds.map((id) => renderRow(id, productRow(id, productInfo.get(id))))}

                <TableRow>
                  <TableCell colSpan={2 + salesChannels.length} className="bg-muted/50 text-sm font-medium">
                    תוצאות חיפוש
                  </TableCell>
                </TableRow>
                {isSearching && (
                  <TableRow>
                    <TableCell colSpan={2 + salesChannels.length} className="text-muted-foreground text-sm">
                      טוען...
                    </TableCell>
                  </TableRow>
                )}
                {searchError && (
                  <TableRow>
                    <TableCell colSpan={2 + salesChannels.length} className="text-destructive text-sm">
                      {searchError}
                    </TableCell>
                  </TableRow>
                )}
                {!isSearching &&
                  searchResults.map((product) =>
                    renderRow(product.id, {
                      id: product.id,
                      title: product.name,
                      thumbnailUrl: product.thumbnailUrl || product.imageUrls[0] || null,
                    })
                  )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {searchTotal > 0 && `עמוד ${searchPage + 1} מתוך ${searchPageCount}`}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={searchPage === 0}
              onClick={() => setSearchPage((p) => Math.max(0, p - 1))}
            >
              הקודם
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={searchPage + 1 >= searchPageCount}
              onClick={() => setSearchPage((p) => p + 1)}
            >
              הבא
            </Button>
          </div>
        </div>

        {saveError && <p className="text-destructive text-sm">{saveError}</p>}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            ביטול
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="animate-spin" /> : null}
            {isSaving ? "שומר..." : "שמירה"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
