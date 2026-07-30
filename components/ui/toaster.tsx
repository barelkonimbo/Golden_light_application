"use client";

import { useToastStore, type ToastVariant } from "@/lib/toast-store";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; iconClass: string; borderClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-green-600 dark:text-green-400",
    borderClass: "border-s-green-600 dark:border-s-green-500",
  },
  error: {
    icon: XCircle,
    iconClass: "text-destructive",
    borderClass: "border-s-destructive",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-s-amber-600 dark:border-s-amber-500",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-s-blue-600 dark:border-s-blue-500",
  },
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex flex-col items-end gap-2 p-4 sm:p-6">
      {toasts.map((item) => {
        const style = VARIANT_STYLES[item.variant];
        const Icon = style.icon;
        return (
          <div
            key={item.id}
            role={item.variant === "error" ? "alert" : "status"}
            className={cn(
              "animate-in fade-in slide-in-from-top-2 bg-card text-card-foreground pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-s-4 p-4 shadow-lg duration-200",
              style.borderClass
            )}
          >
            <Icon className={cn("mt-0.5 size-5 shrink-0", style.iconClass)} />
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium">{item.title}</p>
              {item.description && (
                <p className="text-muted-foreground mt-0.5 text-sm whitespace-pre-line">
                  {item.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="סגירת התראה"
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
