import { useSyncExternalStore } from "react";

export type Toast = { id: number; message: string };

let current: Toast | null = null;
let timer: number | undefined;
let nextId = 1;
const listeners = new Set<() => void>();

export function showToast(message: string, ms = 2200) {
  current = { id: nextId++, message };
  listeners.forEach((l) => l());
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    current = null;
    listeners.forEach((l) => l());
  }, ms);
}

export const useToast = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
