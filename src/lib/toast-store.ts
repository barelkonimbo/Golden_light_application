import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastStoreState {
  toasts: ToastItem[];
  dismiss: (id: number) => void;
}

const DURATIONS: Record<ToastVariant, number> = {
  success: 4000,
  info: 4000,
  warning: 5500,
  error: 6500,
};

let nextId = 1;

export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

function push(variant: ToastVariant, title: string, description?: string) {
  const id = nextId++;
  useToastStore.setState((state) => ({
    toasts: [...state.toasts, { id, variant, title, description }],
  }));
  setTimeout(() => useToastStore.getState().dismiss(id), DURATIONS[variant]);
  return id;
}

export const toast = {
  success: (title: string, description?: string) => push("success", title, description),
  error: (title: string, description?: string) => push("error", title, description),
  info: (title: string, description?: string) => push("info", title, description),
  warning: (title: string, description?: string) => push("warning", title, description),
};
