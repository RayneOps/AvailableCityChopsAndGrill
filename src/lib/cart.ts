import { getProduct, minQuantityOf } from "../data/products";
import type { CartLine, Selections } from "../types";
import { checkoutStore } from "./checkout";
import { lineKey } from "./pricing";
import { createPersistedStore, useStore } from "./store";

export const MAX_QTY = 999;

const clampQty = (qty: number) => Math.max(0, Math.min(MAX_QTY, Math.floor(qty)));

let counter = 0;
const newLineId = () => `l${Date.now().toString(36)}${(counter++).toString(36)}`;

/* ---------------- Pure cart operations (unit tested) ---------------- */

/**
 * Add an item. `min` is the product's minimum order quantity: a new line is
 * raised to at least `min` (e.g. 10 for Small Chops Packs in an event order).
 */
export function addLine(
  lines: CartLine[],
  item: { productId: string; selections: Selections; quantity: number; notes?: string },
  min = 1,
): CartLine[] {
  if (clampQty(item.quantity) === 0) return lines;
  const notes = item.notes?.trim() || undefined;
  const key = lineKey(item.productId, item.selections, notes);
  const existing = lines.find((l) => lineKey(l.productId, l.selections, l.notes) === key);
  if (existing) {
    return lines.map((l) =>
      l === existing ? { ...l, quantity: clampQty(Math.max(min, l.quantity + item.quantity)) } : l,
    );
  }
  const qty = clampQty(Math.max(min, item.quantity));
  return [...lines, { lineId: newLineId(), productId: item.productId, selections: item.selections, quantity: qty, notes }];
}

/** Going below the minimum removes the line (the stepper shows a bin at the minimum). */
export function setLineQuantity(lines: CartLine[], lineId: string, quantity: number, min = 1): CartLine[] {
  const qty = clampQty(quantity);
  if (qty === 0 || qty < min) return removeLine(lines, lineId);
  return lines.map((l) => (l.lineId === lineId ? { ...l, quantity: qty } : l));
}

export function removeLine(lines: CartLine[], lineId: string): CartLine[] {
  return lines.filter((l) => l.lineId !== lineId);
}

/** Replace a line after editing. If the edit makes it identical to another line, they merge. */
export function updateLine(
  lines: CartLine[],
  lineId: string,
  item: { selections: Selections; quantity: number; notes?: string },
  min = 1,
): CartLine[] {
  const target = lines.find((l) => l.lineId === lineId);
  if (!target) return lines;
  if (clampQty(item.quantity) === 0) return removeLine(lines, lineId);
  const notes = item.notes?.trim() || undefined;
  const key = lineKey(target.productId, item.selections, notes);
  const twin = lines.find((l) => l.lineId !== lineId && lineKey(l.productId, l.selections, l.notes) === key);
  if (twin) {
    return lines
      .filter((l) => l.lineId !== lineId)
      .map((l) => (l === twin ? { ...l, quantity: clampQty(Math.max(min, l.quantity + item.quantity)) } : l));
  }
  const qty = clampQty(Math.max(min, item.quantity));
  return lines.map((l) => (l.lineId === lineId ? { ...l, selections: item.selections, notes, quantity: qty } : l));
}

/* ---------------- Persisted store ---------------- */

function reviveLines(raw: unknown): CartLine[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .filter(
      (l): l is CartLine =>
        !!l &&
        typeof l.lineId === "string" &&
        typeof l.productId === "string" &&
        typeof l.quantity === "number" &&
        l.quantity > 0 &&
        typeof l.selections === "object" &&
        l.selections !== null,
    )
    .map((l) => ({ ...l, quantity: clampQty(l.quantity) }));
}

export const cartStore = createPersistedStore<CartLine[]>("acg-cart-v1", [], reviveLines);

export const useCart = () => useStore(cartStore);

/** Packs need their event minimum while the customer is ordering for an event. */
const minFor = (productId: string) => minQuantityOf(getProduct(productId), checkoutStore.get().event.enabled);
const minForLine = (lines: CartLine[], lineId: string) => {
  const line = lines.find((l) => l.lineId === lineId);
  return line ? minFor(line.productId) : 1;
};

/** Cart actions — minimum quantities come from the catalog (and event mode). */
export const cart = {
  add: (item: Parameters<typeof addLine>[1]) => cartStore.set((l) => addLine(l, item, minFor(item.productId))),
  setQuantity: (lineId: string, qty: number) =>
    cartStore.set((l) => setLineQuantity(l, lineId, qty, minForLine(l, lineId))),
  remove: (lineId: string) => cartStore.set((l) => removeLine(l, lineId)),
  update: (lineId: string, item: Parameters<typeof updateLine>[2]) =>
    cartStore.set((l) => updateLine(l, lineId, item, minForLine(l, lineId))),
  clear: () => cartStore.set([]),
};
