import { site } from "../config/site";
import { getCategory } from "../data/categories";
import type { CheckoutDetails, Order } from "../types";
import type { PricedCart } from "./pricing";
import { cleanLine, cleanMultiline } from "./sanitize";
import { normalizePhone } from "./validation";

const REF_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O, 1/I/L

/**
 * Short, human-friendly reference for the WhatsApp message, e.g. "ACG-7K3M".
 * It is NOT a server-side order record — just something both sides can quote.
 */
export function generateOrderRef(prefix: string = site.orderRefPrefix, random: () => number = secureRandom): string {
  let code = "";
  for (let i = 0; i < 4; i++) code += REF_ALPHABET[Math.floor(random() * REF_ALPHABET.length)];
  return prefix ? `${prefix}-${code}` : code;
}

function secureRandom(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint32Array(1))[0]! / 2 ** 32;
  }
  return Math.random();
}

export function deliveryFeeFor(fulfillment: CheckoutDetails["fulfillment"]): number | null {
  if (fulfillment !== "delivery") return 0;
  return site.delivery.mode === "fixed" ? site.delivery.fixedFee : null;
}

/**
 * Event ordering only applies when the order contains event-eligible items
 * (Small Chops Packs). Otherwise any saved event details are ignored.
 */
export function effectiveDetails(details: CheckoutDetails, cart: Pick<PricedCart, "hasEventItems">): CheckoutDetails {
  if (details.event.enabled && !cart.hasEventItems) return { ...details, event: { ...details.event, enabled: false } };
  return details;
}

/**
 * Turns the priced cart + (already validated) checkout details into a clean Order.
 * Only orderable lines are included; all text is sanitised.
 */
export function buildOrder(cart: PricedCart, rawDetails: CheckoutDetails, reference: string): Order {
  const details = effectiveDetails(rawDetails, cart);
  const fulfillment = details.fulfillment === "pickup" ? "pickup" : "delivery";
  const event = details.event.enabled
    ? {
        type: cleanLine(details.event.type, 60) || undefined,
        name: cleanLine(details.event.name, 80) || undefined,
        guests: Math.max(1, Math.floor(Number(details.event.guests) || 0)),
        requirements: cleanMultiline(details.event.requirements, 400) || undefined,
      }
    : undefined;

  return {
    reference,
    customer: {
      name: cleanLine(details.name, 80),
      phone: normalizePhone(details.phone) ?? cleanLine(details.phone, 20),
    },
    fulfillment: {
      type: fulfillment,
      ...(fulfillment === "delivery"
        ? {
            area: cleanLine(details.area, 80),
            address: cleanLine(details.address, 200),
            directions: cleanLine(details.directions, 200) || undefined,
          }
        : {}),
      date: details.date,
      time: details.time,
    },
    items: cart.lines
      .filter((l) => l.status === "ok")
      .map((l) => ({
        productId: l.line.productId,
        name: l.name,
        quantity: l.line.quantity,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
        options: l.options,
        notes: l.line.notes ? cleanLine(l.line.notes, 200) : undefined,
        unit: l.unit,
        contents: l.contents,
      })),
    event,
    notes: cleanMultiline(details.notes, 600) || undefined,
    confirmNotes: cart.categories.map((c) => getCategory(c)?.orderNote).filter((n): n is string => !!n),
    subtotal: cart.subtotal,
    deliveryFee: deliveryFeeFor(fulfillment),
  };
}
