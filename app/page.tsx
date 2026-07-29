"use client";

import { useEffect } from "react";
import { ProductCreateView } from "@/components/products/ProductCreateView";
import { ProductListView } from "@/components/products/ProductListView";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function Home() {
  const view = useStore((state) => state.view);
  const lookupsStatus = useStore((state) => state.lookupsStatus);
  const lookupsError = useStore((state) => state.lookupsError);
  const productsStatus = useStore((state) => state.productsStatus);
  const productsError = useStore((state) => state.productsError);
  const hydrate = useStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = lookupsStatus === "loading" || productsStatus === "loading";
  const hasError = lookupsStatus === "error" || productsStatus === "error";

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      {isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
          <p className="text-muted-foreground text-sm">טוען נתונים...</p>
        </div>
      ) : hasError ? (
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium">טעינת הנתונים נכשלה</p>
          {lookupsError && <p className="text-muted-foreground text-sm">{lookupsError}</p>}
          {productsError && <p className="text-muted-foreground text-sm">{productsError}</p>}
          <Button onClick={() => hydrate()}>ניסיון חוזר</Button>
        </div>
      ) : view === "list" ? (
        <ProductListView />
      ) : (
        <ProductCreateView />
      )}
    </main>
  );
}
