import { getProduct as defaultGetProduct } from "../data/products";
import { formatQuantity } from "./format";
import type { CartLine, OrderItemOption, Product, ProductOption, Selections, Unit } from "../types";

/**
 * Pricing is always recomputed from the catalog. Prices stored in the
 * browser (localStorage) are never trusted.
 */

export type ProductLookup = (id: string) => Product | undefined;

function isChoiceAvailable(option: ProductOption, choiceId: string): boolean {
  const choice = option.choices.find((c) => c.id === choiceId);
  return !!choice && choice.available !== false;
}

/** Default selections for a product: required single options get their default/first choice. */
export function defaultSelections(product: Product): Selections {
  const selections: Selections = {};
  for (const option of product.options ?? []) {
    if (option.type === "single" && option.required) {
      const preferred =
        option.defaultChoiceId && isChoiceAvailable(option, option.defaultChoiceId)
          ? option.defaultChoiceId
          : option.choices.find((c) => c.available !== false)?.id;
      selections[option.id] = preferred ? [preferred] : [];
    } else {
      selections[option.id] = [];
    }
  }
  return selections;
}

/** Drops unknown options/choices, enforces single-choice and max rules. */
export function normalizeSelections(product: Product, selections: Selections): Selections {
  const result: Selections = {};
  for (const option of product.options ?? []) {
    const picked = (selections[option.id] ?? []).filter(
      (id, i, arr) => arr.indexOf(id) === i && isChoiceAvailable(option, id),
    );
    // Keep catalog order so identical selections compare equal.
    const ordered = option.choices.map((c) => c.id).filter((id) => picked.includes(id));
    const limit = option.type === "single" ? 1 : (option.max ?? Infinity);
    result[option.id] = ordered.slice(0, limit);
  }
  return result;
}

/** Returns a customer-facing message per option that isn't satisfied. */
export function validateSelections(product: Product, selections: Selections): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const option of product.options ?? []) {
    const count = (selections[option.id] ?? []).length;
    const label = (option.label ?? option.name).toLowerCase();
    if (option.type === "single" && option.required && count !== 1) {
      errors[option.id] = `Please choose a ${label}.`;
    } else if (option.type === "multiple") {
      const min = option.min ?? (option.required ? 1 : 0);
      if (count < min) errors[option.id] = `Please choose at least ${min}.`;
      if (option.max !== undefined && count > option.max) errors[option.id] = `Choose up to ${option.max}.`;
    }
  }
  return errors;
}

export function unitPrice(product: Product, selections: Selections): number {
  let price = product.price;
  for (const option of product.options ?? []) {
    for (const choiceId of selections[option.id] ?? []) {
      price += option.choices.find((c) => c.id === choiceId)?.priceDelta ?? 0;
    }
  }
  return price;
}

/** Human-readable options, e.g. [{ name: "Size", value: "Large", price: 10000 }]. */
export function describeSelections(product: Product, selections: Selections): OrderItemOption[] {
  const described: OrderItemOption[] = [];
  for (const option of product.options ?? []) {
    const chosen = (selections[option.id] ?? [])
      .map((id) => option.choices.find((c) => c.id === id))
      .filter((c) => c !== undefined);
    if (chosen.length === 0) continue;
    const price = chosen.reduce((sum, c) => sum + (c.priceDelta ?? 0), 0);
    described.push({
      name: option.label ?? option.name,
      value: chosen.map((c) => c.name).join(", "),
      ...(price ? { price } : {}),
    });
  }
  return described;
}

/** Stable identity for "same product, same choices, same note" → merge quantities. */
export function lineKey(productId: string, selections: Selections, notes = ""): string {
  const parts = Object.keys(selections)
    .sort()
    .map((k) => `${k}=${[...(selections[k] ?? [])].sort().join("+")}`);
  return `${productId}|${parts.join("&")}|${notes.trim().toLowerCase()}`;
}

/* ------------------------------------------------------------------ */

export type LineStatus = "ok" | "missing" | "unavailable" | "invalid" | "belowMin";

export type PricedLine = {
  line: CartLine;
  product: Product | undefined;
  status: LineStatus;
  name: string;
  unitPrice: number;
  lineTotal: number;
  options: OrderItemOption[];
  minQuantity: number;
  unit?: Unit;
  contents?: string[];
};

export type PricedCart = {
  lines: PricedLine[];
  /** Total of all orderable lines. */
  subtotal: number;
  itemCount: number;
  /** True when some line must be fixed before checkout. */
  hasProblems: boolean;
  /** "10 packs", "2 trays" or, for mixed orders, "12 items". */
  quantityLabel: string;
  /** True when the order contains items that can be ordered for an event (Packs). */
  hasEventItems: boolean;
  /** Category ids present in the (orderable) order. */
  categories: string[];
};

export function priceCart(lines: CartLine[], getProduct: ProductLookup = defaultGetProduct): PricedCart {
  const priced = lines.map((line): PricedLine => {
    const product = getProduct(line.productId);
    if (!product) {
      return {
        line,
        product,
        status: "missing",
        name: "Item no longer on the menu",
        unitPrice: 0,
        lineTotal: 0,
        options: [],
        minQuantity: 1,
      };
    }
    const selections = normalizeSelections(product, line.selections);
    const invalid = Object.keys(validateSelections(product, selections)).length > 0;
    const price = unitPrice(product, selections);
    const minQuantity = Math.max(1, product.minQuantity ?? 1);
    return {
      line,
      product,
      status: !product.available
        ? "unavailable"
        : invalid
          ? "invalid"
          : line.quantity < minQuantity
            ? "belowMin"
            : "ok",
      name: product.name,
      unitPrice: price,
      lineTotal: price * line.quantity,
      options: describeSelections(product, selections),
      minQuantity,
      unit: product.unit,
      contents: product.contents,
    };
  });

  const ok = priced.filter((p) => p.status === "ok");
  const itemCount = ok.reduce((sum, p) => sum + p.line.quantity, 0);
  const units = new Set(ok.map((p) => (p.unit ? `${p.unit.one}|${p.unit.many}` : "")));
  const sharedUnit = units.size === 1 ? ok[0]?.unit : undefined;
  return {
    lines: priced,
    subtotal: ok.reduce((sum, p) => sum + p.lineTotal, 0),
    itemCount,
    hasProblems: priced.some((p) => p.status !== "ok"),
    quantityLabel: formatQuantity(itemCount, sharedUnit),
    hasEventItems: ok.some((p) => p.product?.supportsEventOrder),
    categories: [...new Set(ok.map((p) => p.product!.category))],
  };
}
