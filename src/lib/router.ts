import { useSyncExternalStore } from "react";

/**
 * Minimal hash router for the overlays (product sheet, order panel).
 * Using the URL means the phone's back button closes sheets, and product
 * links like /#/item/small-chops-pack-2000 can be shared.
 */

export type Route =
  | { name: "home" }
  | { name: "item"; productId: string; editLineId?: string }
  | { name: "order"; step: OrderStep };

export type OrderStep = "cart" | "details" | "review" | "sent";
const STEPS: OrderStep[] = ["cart", "details", "review", "sent"];

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, "");
  if (!path.startsWith("/")) return { name: "home" }; // plain in-page anchors like #menu
  const [pathname = "", query = ""] = path.split("?");
  const parts = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  if (parts[0] === "item" && parts[1]) {
    const edit = new URLSearchParams(query).get("edit") ?? undefined;
    return { name: "item", productId: parts[1], editLineId: edit };
  }
  if (parts[0] === "order") {
    const step = (parts[1] ?? "cart") as OrderStep;
    return { name: "order", step: STEPS.includes(step) ? step : "cart" };
  }
  return { name: "home" };
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", emit);
  window.addEventListener("popstate", emit);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const getHash = () => (typeof location === "undefined" ? "" : location.hash);

let cached: { hash: string; route: Route } = { hash: "\0", route: { name: "home" } };
function getRoute(): Route {
  const hash = getHash();
  if (cached.hash !== hash) cached = { hash, route: parseHash(hash) };
  return cached.route;
}

export const useRoute = () => useSyncExternalStore(subscribe, getRoute, getRoute);

export const paths = {
  item: (id: string, editLineId?: string) =>
    `#/item/${encodeURIComponent(id)}${editLineId ? `?edit=${encodeURIComponent(editLineId)}` : ""}`,
  order: (step: OrderStep = "cart") => (step === "cart" ? "#/order" : `#/order/${step}`),
};

/** Depth of overlay entries we pushed, so "close" can go back instead of stacking history. */
function depth(): number {
  return (history.state as { overlayDepth?: number } | null)?.overlayDepth ?? 0;
}

export function navigate(hash: string, { replace = false } = {}) {
  const url = hash ? hash : location.pathname + location.search;
  if (replace) history.replaceState({ overlayDepth: depth() }, "", url);
  else history.pushState({ overlayDepth: depth() + 1 }, "", url);
  emit();
}

/** Close all overlays, returning to the page underneath. */
export function closeOverlays() {
  const d = depth();
  if (d > 0) history.go(-d);
  else navigate("", { replace: true });
}

/** Step back one overlay level (e.g. Review → Details). */
export function goBack(fallback: string) {
  if (depth() > 1) history.back();
  else navigate(fallback, { replace: true });
}
