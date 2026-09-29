import { describe, expect, it } from "vitest";
import type { CartLine, CheckoutDetails, Product } from "../types";
import { addLine, removeLine, setLineQuantity, updateLine } from "./cart";
import { emptyDetails } from "./checkout";
import { toggleFavorite } from "./favorites";
import { formatDate, formatNaira, formatQuantity, formatTime } from "./format";
import { canRotate, changeTimeMs, pickNextImage, ROTATE_MS, stepMs, tileForTick } from "./galleryRotation";
import { buildOrder, effectiveDetails, generateOrderRef } from "./order";
import { defaultSelections, normalizeSelections, priceCart, validateSelections } from "./pricing";
import { cleanLine, cleanMultiline } from "./sanitize";
import { normalizePhone, validateCheckout } from "./validation";
import { buildOrderMessage, buildWhatsAppUrl, isWhatsAppConfigured, normalizeWhatsAppNumber } from "./whatsapp";

/* Fixture catalog shaped like the real menu (packs with a minimum, trays),
   plus one item with options to keep the option engine covered. */
const PACK = { one: "pack", many: "packs" };
const TRAY = { one: "tray", many: "trays" };
const catalog: Product[] = [
  {
    id: "pack-2000",
    name: "Small Chops Pack — ₦2,000",
    description: "",
    contents: ["Spring Roll", "Samosa", "Corndog", "Puff Puff"],
    price: 2000,
    category: "packs",
    available: true,
    supportsEventOrder: true,
    minQuantity: 10,
    unit: PACK,
  },
  {
    id: "pack-4700",
    name: "Small Chops Pack — ₦4,700",
    description: "",
    price: 4700,
    category: "packs",
    available: true,
    supportsEventOrder: true,
    minQuantity: 10,
    unit: PACK,
  },
  {
    id: "tray-15000",
    name: "Tray Package — ₦15,000",
    description: "",
    contents: ["5pcs Vegetable Spring Roll", "20pcs Puff Puff"],
    price: 15000,
    category: "trays",
    available: true,
    unit: TRAY,
  },
  {
    id: "configurable",
    name: "Configurable Item",
    description: "",
    price: 10000,
    category: "trays",
    available: true,
    options: [
      {
        id: "size",
        name: "Choose size",
        label: "Size",
        type: "single",
        required: true,
        choices: [
          { id: "s", name: "Small" },
          { id: "l", name: "Large", priceDelta: 5000 },
          { id: "xl", name: "Party", priceDelta: 9000, available: false },
        ],
      },
      {
        id: "extras",
        name: "Extras",
        type: "multiple",
        max: 2,
        choices: [
          { id: "a", name: "Extra A", priceDelta: 1000 },
          { id: "b", name: "Extra B", priceDelta: 500 },
          { id: "c", name: "Extra C", priceDelta: 250 },
        ],
      },
    ],
  },
  { id: "gone", name: "Retired Item", description: "", price: 1000, category: "trays", available: false },
];
const lookup = (id: string) => catalog.find((p) => p.id === id);
const configurable = lookup("configurable")!;
const minOf = (id: string) => lookup(id)?.minQuantity ?? 1;

const NOW = new Date(2026, 8, 26, 12, 0); // 26 Sep 2026, 12:00 local

const deliveryDetails: CheckoutDetails = {
  ...emptyDetails,
  name: "  Ada   Obi ",
  phone: "0801 234 5678",
  fulfillment: "delivery",
  area: "Lagos Island",
  address: "12 Example Street, Lagos Island",
  directions: "Opposite the bank",
  date: "2026-09-27",
  time: "18:00",
  notes: "Please pack them separately.",
};

/** Add like the real cart does: minimums come from the catalog. */
function add(lines: CartLine[], productId: string, quantity = 1, selections = {}, notes?: string) {
  return addLine(lines, { productId, quantity, selections, notes }, minOf(productId));
}

describe("formatting", () => {
  it("formats naira deterministically", () => {
    expect(formatNaira(25000)).toBe("₦25,000");
    expect(formatNaira(0)).toBe("₦0");
    expect(formatNaira(1234567)).toBe("₦1,234,567");
  });
  it("formats quantities with units", () => {
    expect(formatQuantity(10, PACK)).toBe("10 packs");
    expect(formatQuantity(1, TRAY)).toBe("1 tray");
    expect(formatQuantity(3)).toBe("3 items");
  });
  it("formats dates and times", () => {
    expect(formatDate("2026-09-27")).toBe("Sun, 27 Sep 2026");
    expect(formatTime("18:00")).toBe("6:00 PM");
    expect(formatTime("00:30")).toBe("12:30 AM");
  });
});

describe("Small Chops Packs — minimum of 10", () => {
  it("adding a pack starts at 10 packs", () => {
    const lines = add([], "pack-2000", 1);
    expect(lines[0]!.quantity).toBe(10);
    const cart = priceCart(lines, lookup);
    expect(cart.subtotal).toBe(20000); // ₦2,000 × 10
    expect(cart.quantityLabel).toBe("10 packs");
  });
  it("₦4,700 × 10 = ₦47,000", () => {
    expect(priceCart(add([], "pack-4700", 10), lookup).subtotal).toBe(47000);
  });
  it("can go above 10 but not below — going below removes the line", () => {
    let lines = add([], "pack-2000", 10);
    const id = lines[0]!.lineId;
    lines = setLineQuantity(lines, id, 11, 10);
    expect(lines[0]!.quantity).toBe(11);
    lines = setLineQuantity(lines, id, 10, 10);
    expect(lines[0]!.quantity).toBe(10);
    expect(setLineQuantity(lines, id, 9, 10)).toHaveLength(0);
  });
  it("editing a pack can't drop it below 10", () => {
    const lines = add([], "pack-2000", 10);
    const edited = updateLine(lines, lines[0]!.lineId, { selections: {}, quantity: 3 }, 10);
    expect(edited[0]!.quantity).toBe(10);
  });
  it("stale stored quantities below the minimum are flagged, not priced", () => {
    const stale: CartLine[] = [{ lineId: "x", productId: "pack-2000", quantity: 2, selections: {} }];
    const cart = priceCart(stale, lookup);
    expect(cart.lines[0]!.status).toBe("belowMin");
    expect(cart.hasProblems).toBe(true);
    expect(cart.subtotal).toBe(0);
  });
});

describe("Trays", () => {
  it("prices trays normally (minimum 1)", () => {
    let lines = add([], "tray-15000", 1);
    expect(lines[0]!.quantity).toBe(1);
    lines = setLineQuantity(lines, lines[0]!.lineId, 3);
    const cart = priceCart(lines, lookup);
    expect(cart.subtotal).toBe(45000);
    expect(cart.quantityLabel).toBe("3 trays");
    expect(cart.hasEventItems).toBe(false);
  });
  it("mixed orders count items", () => {
    const cart = priceCart(add(add([], "tray-15000"), "pack-2000"), lookup);
    expect(cart.quantityLabel).toBe("11 items");
    expect(cart.subtotal).toBe(35000);
    expect(cart.hasEventItems).toBe(true);
  });
});

describe("cart basics", () => {
  it("merges identical items", () => {
    let lines = add([], "tray-15000");
    lines = add(lines, "tray-15000", 2);
    expect(lines).toHaveLength(1);
    expect(lines[0]!.quantity).toBe(3);
  });
  it("clamps silly quantities and removes lines", () => {
    expect(add([], "tray-15000", 5000)[0]!.quantity).toBe(999);
    expect(add([], "tray-15000", -2)).toHaveLength(0);
    const lines = add(add([], "tray-15000"), "pack-2000");
    expect(removeLine(lines, lines[0]!.lineId).map((l) => l.productId)).toEqual(["pack-2000"]);
  });
  it("ignores stored prices — price always comes from the catalog", () => {
    const lines = [{ lineId: "x", productId: "tray-15000", quantity: 2, selections: {}, price: 1 } as CartLine];
    expect(priceCart(lines, lookup).subtotal).toBe(30000);
  });
  it("flags unavailable and missing products and excludes them from totals", () => {
    let lines = add([], "tray-15000");
    lines = add(lines, "gone");
    lines = [...lines, { lineId: "m", productId: "deleted", quantity: 1, selections: {} }];
    const cart = priceCart(lines, lookup);
    expect(cart.lines.map((l) => l.status)).toEqual(["ok", "unavailable", "missing"]);
    expect(cart.subtotal).toBe(15000);
  });
});

describe("option engine (kept for future menu options)", () => {
  it("applies defaults, deltas, max and availability", () => {
    expect(defaultSelections(configurable)).toEqual({ size: ["s"], extras: [] });
    const cart = priceCart(add([], "configurable", 2, { size: ["l"], extras: ["a", "b"] }), lookup);
    expect(cart.lines[0]!.unitPrice).toBe(16500);
    expect(cart.subtotal).toBe(33000);
    expect(validateSelections(configurable, { size: [], extras: [] })).toHaveProperty("size");
    const n = normalizeSelections(configurable, { size: ["xl", "l"], extras: ["c", "a", "b", "zz"] });
    expect(n).toEqual({ size: ["l"], extras: ["a", "b"] });
  });
});

describe("checkout validation", () => {
  it("accepts a complete delivery order and reports missing fields", () => {
    expect(validateCheckout(deliveryDetails, NOW)).toEqual({});
    expect(Object.keys(validateCheckout(emptyDetails, NOW)).sort()).toEqual(["date", "fulfillment", "name", "phone", "time"]);
  });
  it("requires an address only for delivery", () => {
    const d = { ...deliveryDetails, area: "", address: "" };
    expect(validateCheckout(d, NOW)).toMatchObject({ area: expect.any(String), address: expect.any(String) });
    expect(validateCheckout({ ...d, fulfillment: "pickup" }, NOW)).toEqual({});
  });
  it("rejects past dates/times and invalid guests", () => {
    expect(validateCheckout({ ...deliveryDetails, date: "2026-09-25" }, NOW)).toHaveProperty("date");
    expect(validateCheckout({ ...deliveryDetails, date: "2026-09-26", time: "09:00" }, NOW)).toHaveProperty("time");
    const ev = { ...deliveryDetails, event: { ...emptyDetails.event, enabled: true } };
    expect(validateCheckout(ev, NOW)).toHaveProperty("eventGuests");
    expect(validateCheckout({ ...ev, event: { ...ev.event, guests: "50" } }, NOW)).toEqual({});
  });
  it("validates Nigerian phone numbers", () => {
    expect(normalizePhone("08189794504")).toBe("0818 979 4504");
    expect(normalizePhone("+234 704 007 8067")).toBe("0704 007 8067");
    expect(normalizePhone("0801234")).toBeNull();
  });
});

describe("event orders — Packs only", () => {
  const eventDetails: CheckoutDetails = {
    ...deliveryDetails,
    event: { enabled: true, type: "Wedding", name: "Ada & Tunde", guests: "120", requirements: "Serve by 5pm" },
  };
  it("event details are ignored when the order has no packs", () => {
    const trays = priceCart(add([], "tray-15000"), lookup);
    expect(effectiveDetails(eventDetails, trays).event.enabled).toBe(false);
    const order = buildOrder(trays, eventDetails, "ACG-TEST");
    expect(order.event).toBeUndefined();
    expect(buildOrderMessage(order, "Test Kitchen")).not.toContain("EVENT");
  });
  it("event details apply to orders with packs", () => {
    const packs = priceCart(add([], "pack-2000"), lookup);
    const msg = buildOrderMessage(buildOrder(packs, eventDetails, "ACG-TEST"), "Test Kitchen");
    expect(msg).toContain("*EVENT ORDER*");
    expect(msg).toContain("*ORDER TYPE*\nEvent order · Delivery");
    expect(msg).toContain("*EVENT DETAILS*\nType: Wedding\nEvent: Ada & Tunde\nGuests: 120\nRequirements: Serve by 5pm");
    expect(msg).toContain("*EVENT DATE & TIME*\nSun, 27 Sep 2026, 6:00 PM");
    expect(msg).toContain("*EVENT VENUE / DELIVERY ADDRESS*");
  });
});

describe("WhatsApp message", () => {
  const lines = (() => {
    let l = add([], "pack-2000", 10, {}, "No corndog in 2 packs");
    l = add(l, "tray-15000", 2);
    return l;
  })();
  const cart = priceCart(lines, lookup);

  it("delivery message has business name, units, contents and totals", () => {
    const order = buildOrder(cart, deliveryDetails, "ACG-7K3M");
    expect(order.subtotal).toBe(20000 + 30000);
    const msg = buildOrderMessage(order, "Available City Chops and Grill");
    expect(msg.startsWith("*AVAILABLE CITY CHOPS AND GRILL*\nHello! I'd like to place an order.\nOrder ref: #ACG-7K3M")).toBe(true);
    expect(msg).toContain(
      [
        "1. Small Chops Pack — ₦2,000",
        "   Price: ₦2,000/pack",
        "   Quantity: 10 packs",
        "   Contents: Spring Roll, Samosa, Corndog, Puff Puff",
        "   Note: No corndog in 2 packs",
        "   Item total: ₦20,000",
      ].join("\n"),
    );
    expect(msg).toContain("2. Tray Package — ₦15,000\n   Price: ₦15,000/tray\n   Quantity: 2 trays");
    expect(msg).toContain("   Item total: ₦30,000");
    expect(msg).toContain("*ORDER TYPE*\nDelivery");
    expect(msg).toContain("*DELIVERY ADDRESS*\nArea: Lagos Island\nAddress: 12 Example Street, Lagos Island\nDirections: Opposite the bank");
    expect(msg).toContain("*CUSTOMER*\nName: Ada Obi\nPhone: 0801 234 5678");
    expect(msg).toContain("Subtotal: ₦50,000\nDelivery: To be confirmed\n*Total: ₦50,000 + delivery*");
    expect(msg).toContain("*SPECIAL INSTRUCTIONS*\nPlease pack them separately.");
    expect(msg).toContain("Please confirm my order and send the payment details.");
    expect(msg).not.toMatch(/undefined|null|\[object/);
  });

  it("pickup message has no address and no delivery fee", () => {
    const msg = buildOrderMessage(buildOrder(cart, { ...deliveryDetails, fulfillment: "pickup" }, "X"), "T");
    expect(msg).toContain("*ORDER TYPE*\nPickup");
    expect(msg).not.toContain("Address:");
    expect(msg).toContain("*Total: ₦50,000*");
  });

  it("sanitises customer text", () => {
    const nasty = { ...deliveryDetails, name: "*Bold*‮\u0000 Name", notes: "line1\n\n\n\nline2`" };
    const msg = buildOrderMessage(buildOrder(cart, nasty, "X"), "T");
    expect(msg).toContain("Name: ∗Bold∗ Name");
    expect(msg).toContain("line1\n\nline2'");
    expect(cleanLine("  a \n b  ")).toBe("a b");
    expect(cleanMultiline("a\r\nb")).toBe("a\nb");
  });

  it("builds a correctly encoded wa.me URL for the business number", () => {
    const msg = buildOrderMessage(buildOrder(cart, deliveryDetails, "X"), "T");
    const url = buildWhatsAppUrl("2348189794504", msg);
    expect(url.startsWith("https://wa.me/2348189794504?text=")).toBe(true);
    expect(decodeURIComponent(url.split("?text=")[1]!)).toBe(msg);
    expect(url).not.toMatch(/[\s₦×]/);
  });

  it("validates WhatsApp configuration", () => {
    expect(isWhatsAppConfigured("2348189794504")).toBe(true);
    expect(isWhatsAppConfigured("")).toBe(false);
    expect(isWhatsAppConfigured("08189794504")).toBe(false);
    expect(normalizeWhatsAppNumber("+234 818 979 4504")).toBe("2348189794504");
  });
});

describe("favorites", () => {
  it("toggles on and off", () => {
    let ids: string[] = [];
    ids = toggleFavorite(ids, "tray-15000");
    ids = toggleFavorite(ids, "pack-2000");
    expect(ids).toEqual(["tray-15000", "pack-2000"]);
    expect(toggleFavorite(ids, "tray-15000")).toEqual(["pack-2000"]);
  });
});

describe("gallery rotation — staggered", () => {
  it("each box changes every 60s, one box at a time", () => {
    const tiles = 6;
    expect(stepMs(tiles)).toBe(10_000);
    // First 12 ticks: tiles 0..5, 0..5 — never two on the same tick.
    expect(Array.from({ length: 12 }, (_, i) => tileForTick(i + 1, tiles))).toEqual([0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5]);
    // Tile k changes at (k+1)*10s, then every 60s.
    expect(changeTimeMs(0, 1, tiles)).toBe(10_000);
    expect(changeTimeMs(0, 2, tiles) - changeTimeMs(0, 1, tiles)).toBe(ROTATE_MS);
    const times = Array.from({ length: tiles }, (_, t) => changeTimeMs(t, 1, tiles));
    expect(new Set(times).size).toBe(tiles);
  });
  it("4 boxes → offsets of 15s", () => {
    expect([0, 1, 2, 3].map((t) => changeTimeMs(t, 1, 4))).toEqual([15_000, 30_000, 45_000, 60_000]);
  });
  it("never shows the same photo in two boxes", () => {
    expect(pickNextImage([0, 1, 2], 3, 10)).toEqual({ image: 3, cursor: 4 });
    expect(pickNextImage([0, 1, 2], 1, 10)).toEqual({ image: 3, cursor: 4 });
    expect(pickNextImage([8, 9, 0], 8, 10)).toEqual({ image: 1, cursor: 2 });
  });
  it("only rotates when there are more photos than boxes", () => {
    expect(canRotate(6, 6)).toBe(false);
    expect(canRotate(40, 6)).toBe(true);
  });
});

describe("order reference", () => {
  it("is short and prefixed", () => {
    expect(generateOrderRef("ACG", () => 0)).toBe("ACG-2222");
    expect(generateOrderRef("ACG")).toMatch(/^ACG-[2-9A-Z]{4}$/);
  });
});
