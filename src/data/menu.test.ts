import { describe, expect, it } from "vitest";
import { site } from "../config/site";
import { categories } from "./categories";
import { isEventEligible, minQuantityOf, products } from "./products";

/** Guards the live menu against drifting from the business flyers. */
describe("real menu matches the flyers", () => {
  const packs = products.filter((p) => p.category === "packs");
  const trays = products.filter((p) => p.category === "trays");

  it("has exactly the two flyer categories — no drinks or other sections", () => {
    expect(categories.map((c) => c.name)).toEqual(["Small Chops Packs", "For the Tray"]);
    expect(products.every((p) => ["packs", "trays"].includes(p.category))).toBe(true);
    expect(products).toHaveLength(13);
  });

  it("Small Chops Packs: 7 packs, correct prices and contents, from 1 (10 for events), event-eligible", () => {
    expect(packs.map((p) => p.price)).toEqual([2000, 2500, 3000, 3200, 3500, 4000, 4700]);
    expect(packs.every((p) => (p.minQuantity ?? 1) === 1 && p.eventEligible === true && isEventEligible(p))).toBe(true);
    expect(packs.every((p) => minQuantityOf(p) === 1 && minQuantityOf(p, true) === 10)).toBe(true);
    const contents = Object.fromEntries(packs.map((p) => [p.price, p.contents]));
    expect(contents[2000]).toEqual(["Spring Roll", "Samosa", "Corndog", "Puff Puff"]);
    expect(contents[3200]).toEqual(["Spring Roll", "Samosa", "Gizzard", "Chicken BBQ", "Mosa", "Puff Puff", "Corndog"]);
    expect(contents[4700]).toEqual(["Spring Roll", "Samosa", "Snail", "Gizzard", "Crispy Prawn", "Chicken BBQ", "Mosa", "Puff Puff"]);
  });

  it("For the Tray: 6 packages, correct prices, not event-eligible, no minimum", () => {
    expect(trays.map((p) => p.price)).toEqual([15000, 27000, 32000, 35000, 42000, 50000]);
    expect(trays.every((p) => p.eventEligible === false && !isEventEligible(p))).toBe(true);
    expect(trays.every((p) => minQuantityOf(p) === 1 && minQuantityOf(p, true) === 1)).toBe(true);
    const t15 = trays.find((p) => p.price === 15000)!;
    expect(t15.contents).toEqual(["5pcs Vegetable Spring Roll", "5pcs Beef Samosa", "5pcs Chicken BBQ", "1pcs Mosa", "20pcs Puff Puff"]);
    const t50 = trays.find((p) => p.price === 50000)!;
    expect(t50.contents).toHaveLength(8);
    expect(t50.contents).toContain("10pcs Breaded Prawn");
  });

  it("only the 7 Small Chops Packs are event-eligible", () => {
    expect(products.filter(isEventEligible).map((p) => p.id)).toEqual(packs.map((p) => p.id));
    // A non-Pack product can't become event-eligible, even if flagged by mistake.
    expect(isEventEligible({ ...trays[0]!, eventEligible: true })).toBe(false);
  });

  it("every product is available and has no invented options", () => {
    expect(products.every((p) => p.available)).toBe(true);
    expect(products.every((p) => !p.options || p.options.length === 0)).toBe(true);
  });

  it("uses the real business details", () => {
    expect(site.name).toBe("Available City Chops and Grill");
    expect(site.whatsappOrderNumber).toBe("2348189794504");
    expect(site.contact.phones.map((p) => p.tel)).toEqual(["+2347040078067", "+2349079299530"]);
    expect(site.contact.email).toBe("availablecitychopsandgrill@gmail.com");
    expect(site.contact.address).toBe("60 Glover Street, Lagos Island, Lagos");
    expect(site.contact.hours).toBe("");
    expect(site.url).toBe("https://availablecitychopsandgrill.com");
  });
});
