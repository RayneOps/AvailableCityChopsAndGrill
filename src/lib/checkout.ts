import type { CheckoutDetails } from "../types";
import { createPersistedStore, useStore } from "./store";

export const emptyDetails: CheckoutDetails = {
  name: "",
  phone: "",
  fulfillment: "",
  area: "",
  address: "",
  directions: "",
  date: "",
  time: "",
  notes: "",
  event: { enabled: false, type: "", name: "", guests: "", requirements: "" },
};

function reviveDetails(raw: unknown): CheckoutDetails | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const ev = (r.event ?? {}) as Record<string, unknown>;
  return {
    name: str(r.name),
    phone: str(r.phone),
    fulfillment: r.fulfillment === "delivery" || r.fulfillment === "pickup" ? r.fulfillment : "",
    area: str(r.area),
    address: str(r.address),
    directions: str(r.directions),
    date: str(r.date),
    time: str(r.time),
    notes: str(r.notes),
    event: {
      enabled: ev.enabled === true,
      type: str(ev.type),
      name: str(ev.name),
      guests: str(ev.guests),
      requirements: str(ev.requirements),
    },
  };
}

/** Customer details are remembered on this device so repeat orders are quick. */
export const checkoutStore = createPersistedStore<CheckoutDetails>("acg-checkout-v1", emptyDetails, reviveDetails);
export const useCheckout = () => useStore(checkoutStore);

export function updateDetails(patch: Partial<CheckoutDetails>) {
  checkoutStore.set((d) => ({ ...d, ...patch }));
}

export function updateEvent(patch: Partial<CheckoutDetails["event"]>) {
  checkoutStore.set((d) => ({ ...d, event: { ...d.event, ...patch } }));
}

/** After an order: keep name/phone/address for next time, clear order-specific fields. */
export function resetOrderSpecificDetails() {
  checkoutStore.set((d) => ({ ...d, date: "", time: "", notes: "", event: emptyDetails.event }));
}

/* ---- Last hand-off (so the "Order ready" screen survives a refresh / app switch) ---- */

export type Handoff = { reference: string; message: string; url: string | null; createdAt: number };

export const handoffStore = createPersistedStore<Handoff | null>("acg-handoff-v1", null, (raw) => {
  const r = raw as Handoff | null;
  return r && typeof r.reference === "string" && typeof r.message === "string" ? r : null;
});
export const useHandoff = () => useStore(handoffStore);

/** Reference for the order currently being reviewed (regenerated when the order changes). */
export const draftRefStore = createPersistedStore<string>("acg-ref-v1", "", (raw) => (typeof raw === "string" ? raw : null));
export const useDraftRef = () => useStore(draftRefStore);
