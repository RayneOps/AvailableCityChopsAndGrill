import { useSyncExternalStore } from "react";

/**
 * Tiny persisted store (no dependencies). State survives page refreshes via
 * localStorage; if storage is unavailable (private mode, blocked) it simply
 * lives in memory for the session.
 */
export type Store<T> = {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createPersistedStore<T>(
  key: string,
  initial: T,
  revive: (raw: unknown) => T | null,
): Store<T> {
  let state = initial;
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    if (raw) state = revive(JSON.parse(raw)) ?? initial;
  } catch {
    /* ignore corrupt or unavailable storage */
  }

  const listeners = new Set<() => void>();

  return {
    get: () => state,
    set(next) {
      state = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
      try {
        if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(state));
      } catch {
        /* storage full or blocked — keep in-memory state */
      }
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
