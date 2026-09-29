import type { CheckoutDetails } from "../types";
import { parseISODate, toISODate } from "./format";
import { cleanLine } from "./sanitize";

/**
 * Nigerian numbers: 0803 123 4567, +234 803 123 4567, 234803…
 * International numbers are accepted with a leading "+".
 * Returns a tidy display version, or null if invalid.
 */
export function normalizePhone(input: string): string | null {
  const compact = input.replace(/[\s().-]/g, "");
  let m = /^(?:\+?234|0)([789][01]\d{8})$/.exec(compact);
  if (m) {
    const n = m[1]!;
    return `0${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
  }
  m = /^\+(\d{8,15})$/.exec(compact);
  if (m && !m[1]!.startsWith("234")) return `+${m[1]}`;
  return null;
}

export type CheckoutErrors = Partial<Record<CheckoutField, string>>;
export type CheckoutField =
  | "name"
  | "phone"
  | "fulfillment"
  | "area"
  | "address"
  | "date"
  | "time"
  | "eventGuests";

/** Order the errors appear in the form, used to focus the first one. */
export const FIELD_ORDER: CheckoutField[] = [
  "name",
  "phone",
  "fulfillment",
  "area",
  "address",
  "eventGuests",
  "date",
  "time",
];

export const MAX_GUESTS = 10000;

export function validateCheckout(details: CheckoutDetails, now: Date = new Date()): CheckoutErrors {
  const errors: CheckoutErrors = {};

  const name = cleanLine(details.name, 80);
  if (!name) errors.name = "Please enter your name.";
  else if (name.length < 2) errors.name = "Please enter your full name.";

  if (!details.phone.trim()) errors.phone = "Please enter your WhatsApp or phone number.";
  else if (!normalizePhone(details.phone)) errors.phone = "Please enter a valid phone number, e.g. 0803 123 4567.";

  if (details.fulfillment !== "delivery" && details.fulfillment !== "pickup") {
    errors.fulfillment = "Please choose delivery or pickup.";
  }

  if (details.fulfillment === "delivery") {
    if (!cleanLine(details.area)) errors.area = "Please enter your area.";
    if (!cleanLine(details.address, 200)) errors.address = "Please enter your delivery address.";
    else if (cleanLine(details.address, 200).length < 6) errors.address = "Please enter your full delivery address.";
  }

  const date = parseISODate(details.date);
  const today = toISODate(now);
  if (!details.date) errors.date = "Please choose a date.";
  else if (!date) errors.date = "Please choose a valid date.";
  else if (details.date < today) errors.date = "Please choose today or a future date.";

  if (!details.time) errors.time = "Please choose a time.";
  else if (!/^\d{2}:\d{2}$/.test(details.time)) errors.time = "Please choose a valid time.";
  else if (details.date === today) {
    const [h, m] = details.time.split(":").map(Number);
    if (h! * 60 + m! < now.getHours() * 60 + now.getMinutes()) errors.time = "That time has already passed today.";
  }

  if (details.event.enabled) {
    const guests = Number(details.event.guests);
    if (!details.event.guests.trim()) errors.eventGuests = "Please enter the number of guests.";
    else if (!Number.isInteger(guests) || guests < 1) errors.eventGuests = "Please enter a whole number of guests.";
    else if (guests > MAX_GUESTS) errors.eventGuests = "For very large events, please chat with us on WhatsApp.";
  }

  return errors;
}
