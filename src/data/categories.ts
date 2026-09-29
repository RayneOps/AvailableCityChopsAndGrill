import type { Category } from "../types";

/**
 * Menu categories, in display order (wording from the business flyers).
 * Categories with no products are hidden automatically.
 */
export const categories: Category[] = [
  {
    id: "packs",
    name: "Small Chops Packs",
    notes: ["Minimum of 10 packs."],
    flyer: "small-chops-packs",
  },
  {
    id: "trays",
    name: "For the Tray",
    notes: [
      "Packaging cost varies from ₦200 - ₦1,500 depending on the content of your box.",
      "Discount applies for all bulk orders.",
    ],
    flyer: "for-the-tray",
    orderNote:
      "Packaging cost (₦200 - ₦1,500 depending on the content of the box) and any bulk discount to be confirmed.",
  },
];

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
