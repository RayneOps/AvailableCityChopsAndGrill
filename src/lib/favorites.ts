import { createPersistedStore, useStore } from "./store";

/** Favourite product ids, saved on this device only (no account needed). */
export const favoritesStore = createPersistedStore<string[]>("acg-favorites-v1", [], (raw) =>
  Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : null,
);

export const useFavorites = () => useStore(favoritesStore);

export function toggleFavorite(ids: string[], productId: string): string[] {
  return ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId];
}

export const favorites = {
  toggle: (productId: string) => favoritesStore.set((ids) => toggleFavorite(ids, productId)),
  has: (productId: string) => favoritesStore.get().includes(productId),
};
