import type { Order } from "../types";
import { site } from "../config/site";
import { formatDate, formatNaira, formatQuantity, formatTime } from "./format";

/**
 * WhatsApp order hand-off.
 *   1. buildOrderMessage(order)  → readable text
 *   2. buildWhatsAppUrl(number, text) → https://wa.me/<number>?text=<encoded>
 *
 * Opening the URL only PRE-FILLS the chat — the customer still taps Send.
 */

/** Digits only, international format without "+" (e.g. 2348031234567). */
export function normalizeWhatsAppNumber(value: string): string | null {
  const digits = value.replace(/[\s()+-]/g, "");
  if (!/^[1-9]\d{9,14}$/.test(digits)) return null;
  return digits;
}

export function isWhatsAppConfigured(value: string): boolean {
  return normalizeWhatsAppNumber(value) !== null;
}

export function buildWhatsAppUrl(number: string, message?: string): string {
  const phone = normalizeWhatsAppNumber(number);
  if (!phone) throw new Error("Invalid WhatsApp number configuration");
  return message ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/${phone}`;
}

/**
 * Customer text must not interfere with our *bold* section headings or
 * open a ```monospace``` block, so those markers are swapped for look-alikes.
 */
function plain(text: string): string {
  return text.replace(/\*/g, "∗").replace(/`/g, "'").trim();
}

export function totalLabel(subtotal: number, deliveryFee: number | null): string {
  if (deliveryFee === null) return `${formatNaira(subtotal)} + delivery`;
  return formatNaira(subtotal + deliveryFee);
}

export function deliveryLabel(order: Pick<Order, "fulfillment" | "deliveryFee">): string {
  if (order.fulfillment.type === "pickup") return "Pickup (no delivery fee)";
  return order.deliveryFee === null ? "To be confirmed" : order.deliveryFee === 0 ? "Free" : formatNaira(order.deliveryFee);
}

export function buildOrderMessage(order: Order, businessName: string = site.name): string {
  const out: string[] = [];
  const section = (title: string, ...lines: (string | undefined | false)[]) => {
    const body = lines.filter((l): l is string => !!l);
    if (body.length === 0) return;
    out.push("", `*${title}*`, ...body);
  };

  out.push(`*${businessName.toUpperCase()}*`, "Hello! I'd like to place an order.", `Order ref: #${order.reference}`);
  if (order.event) out.push("", "*EVENT ORDER*");

  // Items: name, unit price, quantity (with units, e.g. "10 packs"), contents, item total.
  const itemLines: string[] = [];
  order.items.forEach((item, i) => {
    if (i > 0) itemLines.push("");
    const perUnit = item.unit ? `/${item.unit.one}` : " each";
    itemLines.push(`${i + 1}. ${plain(item.name)}`);
    itemLines.push(`   Price: ${formatNaira(item.unitPrice)}${perUnit}`);
    itemLines.push(`   Quantity: ${formatQuantity(item.quantity, item.unit)}`);
    if (item.contents?.length) itemLines.push(`   Contents: ${item.contents.map(plain).join(", ")}`);
    for (const opt of item.options) itemLines.push(`   ${plain(opt.name)}: ${plain(opt.value)}`);
    if (item.notes) itemLines.push(`   Note: ${plain(item.notes)}`);
    itemLines.push(`   Item total: ${formatNaira(item.lineTotal)}`);
  });
  section("ORDER", ...itemLines);

  const f = order.fulfillment;
  const how = f.type === "delivery" ? "Delivery" : "Pickup";
  section("ORDER TYPE", order.event ? `Event order · ${how}` : how);

  if (order.event) {
    const e = order.event;
    section(
      "EVENT DETAILS",
      e.type && `Type: ${plain(e.type)}`,
      e.name && `Event: ${plain(e.name)}`,
      `Guests: ${e.guests}`,
      e.requirements && `Requirements: ${plain(e.requirements)}`,
    );
  }

  section(order.event ? "EVENT DATE & TIME" : "DATE & TIME", `${formatDate(f.date)}, ${formatTime(f.time)}`);

  if (f.type === "delivery") {
    section(
      order.event ? "EVENT VENUE / DELIVERY ADDRESS" : "DELIVERY ADDRESS",
      f.area && `Area: ${plain(f.area)}`,
      f.address && `Address: ${plain(f.address)}`,
      f.directions && `Directions: ${plain(f.directions)}`,
    );
  }

  section("CUSTOMER", `Name: ${plain(order.customer.name)}`, `Phone: ${order.customer.phone}`);

  section(
    "SUMMARY",
    `Subtotal: ${formatNaira(order.subtotal)}`,
    `Delivery: ${deliveryLabel(order)}`,
    `*Total: ${totalLabel(order.subtotal, order.deliveryFee)}*`,
    ...(order.confirmNotes ?? []).map((n) => `Note: ${n}`),
  );

  if (order.notes) section("SPECIAL INSTRUCTIONS", plain(order.notes));

  out.push("", "Please confirm my order and send the payment details. Thank you!");
  return out.join("\n");
}
