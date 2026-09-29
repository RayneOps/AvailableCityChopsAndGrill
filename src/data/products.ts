import { productImages } from "virtual:site-assets";
import type { Product, ProductImage } from "../types";

/**
 * ============================================================
 *  MENU — from the Available City Chops and Grill flyers
 * ============================================================
 * Source of truth: "PRICE LIST — SMALL CHOPS PACKS (MINIMUM OF 10 PACKS)"
 * and "Small Chops Menu — FOR THE TRAY — Price List Package".
 * Do not add items, prices or contents that are not on the flyers.
 *
 * Prices are whole naira.
 *
 * Photos: save a photo as /public/images/products/<product id>.jpg
 * (or .jpeg/.png/.webp), e.g. small-chops-pack-2000.jpg or tray-15000.jpg.
 * It is picked up automatically. Products without a photo show a
 * branded price tile instead.
 */

const PACK = { one: "pack", many: "packs" };
const TRAY = { one: "tray", many: "trays" };

function pack(price: number, contents: string[]): Product {
  return {
    id: `small-chops-pack-${price}`,
    name: `Small Chops Pack — ₦${price.toLocaleString("en-US")}`,
    shortName: "Small Chops Pack",
    description: `${contents.length} small chops per pack.`,
    contents,
    price,
    category: "packs",
    available: true,
    supportsEventOrder: true,
    minQuantity: 10,
    unit: PACK,
    badge: "Min. 10 packs",
  };
}

function tray(price: number, contents: string[]): Product {
  return {
    id: `tray-${price}`,
    name: `Tray Package — ₦${price.toLocaleString("en-US")}`,
    shortName: "Tray Package",
    description: "Small chops for the tray.",
    contents,
    price,
    category: "trays",
    available: true,
    unit: TRAY,
  };
}

const catalog: Product[] = [
  /* ---------- SMALL CHOPS PACKS (MINIMUM OF 10 PACKS) ---------- */
  pack(2000, ["Spring Roll", "Samosa", "Corndog", "Puff Puff"]),
  pack(2500, ["Spring Roll", "Samosa", "Chicken BBQ", "Mosa", "Puff Puff"]),
  pack(3000, ["Spring Roll", "Samosa", "Corndog", "Chicken BBQ", "Mosa", "Puff Puff"]),
  pack(3200, ["Spring Roll", "Samosa", "Gizzard", "Chicken BBQ", "Mosa", "Puff Puff", "Corndog"]),
  pack(3500, ["Spring Roll", "Samosa", "Snail", "Gizzard", "Chicken BBQ"]),
  pack(4000, ["Spring Roll", "Samosa", "Snail", "Gizzard", "Stick meat", "Chicken BBQ", "Mosa", "Puff Puff"]),
  pack(4700, ["Spring Roll", "Samosa", "Snail", "Gizzard", "Crispy Prawn", "Chicken BBQ", "Mosa", "Puff Puff"]),

  /* ---------- FOR THE TRAY — Price List Package ---------- */
  tray(15000, ["5pcs Vegetable Spring Roll", "5pcs Beef Samosa", "5pcs Chicken BBQ", "1pcs Mosa", "20pcs Puff Puff"]),
  tray(27000, ["10pcs Vegetable Spring Roll", "10pcs Beef Samosa", "10pcs Chicken BBQ", "30pcs Mosa", "30pcs Puff Puff"]),
  tray(32000, [
    "10pcs Vegetable Spring Roll",
    "10pcs Beef Samosa",
    "5pcs Peppered Gizzard",
    "10pcs Chicken BBQ",
    "30pcs Mosa",
    "30pcs Puff Puff",
  ]),
  tray(35000, [
    "10pcs Vegetable Spring Roll",
    "10pcs Beef Samosa",
    "7pcs Peppered Snail",
    "10pcs Chicken BBQ",
    "40pcs Mosa",
    "50pcs Puff Puff",
  ]),
  tray(42000, [
    "10pcs Vegetable Spring Roll",
    "10pcs Beef Samosa",
    "10pcs Peppered Gizzard",
    "10pcs Chicken BBQ",
    "10pcs Stick Meat",
    "30pcs Mosa",
    "30pcs Puff Puff",
  ]),
  tray(50000, [
    "10pcs Vegetable Spring Roll",
    "10pcs Beef Samosa",
    "10pcs Peppered Gizzard",
    "10pcs Chicken BBQ",
    "10pcs Peppered Snail",
    "10pcs Breaded Prawn",
    "30pcs Mosa",
    "30pcs Puff Puff",
  ]),
];

/** Attach a photo from /public/images/products/<id>.<ext> when one exists. */
function findImage(product: Product): ProductImage | undefined {
  const file = productImages.find((f) => f.replace(/\.[^.]+$/, "").toLowerCase() === product.id);
  return file ? { src: `/images/products/${encodeURIComponent(file)}`, alt: product.name } : undefined;
}

export const products: Product[] = catalog.map((p) => ({ ...p, image: p.image ?? findImage(p) }));

const byId = new Map(products.map((p) => [p.id, p]));

export function getProduct(id: string): Product | undefined {
  return byId.get(id);
}

/** Smallest quantity a customer may order (1 unless the flyer states a minimum). */
export const minQuantityOf = (p: Product | undefined) => Math.max(1, p?.minQuantity ?? 1);
