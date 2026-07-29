"use client";

import { ProductCreateView } from "@/components/products/ProductCreateView";
import { ProductListView } from "@/components/products/ProductListView";
import { useStore } from "@/lib/store";

export default function Home() {
  const view = useStore((state) => state.view);

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      {view === "list" ? <ProductListView /> : <ProductCreateView />}
    </main>
  );
}
