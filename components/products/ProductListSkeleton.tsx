import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductListSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 shrink-0 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      <Skeleton className="h-9 w-full sm:max-w-sm" />

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <Skeleton className="h-9 w-full rounded-md sm:w-48" />
        <Skeleton className="h-9 w-full rounded-md sm:w-40" />
        <Skeleton className="h-9 w-full rounded-md sm:w-48" />
        <Skeleton className="h-9 w-full rounded-md sm:ms-auto sm:w-56" />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-4 border-b p-4">
            <Skeleton className="size-10 shrink-0 rounded-md" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="hidden h-4 w-28 md:ms-auto md:block" />
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 border-b p-4 last:border-b-0">
              <Skeleton className="size-10 shrink-0 rounded-md" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="hidden h-4 w-24 md:block" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="hidden h-4 w-28 md:ms-auto md:block" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
