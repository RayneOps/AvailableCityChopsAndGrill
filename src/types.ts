/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

export type Category = {
  id: string;
  name: string;
  /** Short line shown under the category heading (e.g. flyer notes). */
  notes?: string[];
  /**
   * Base filename (no extension) of the category's flyer in /public/images/flyers.
   * If the file exists, a "View price list" button shows it.
   */
  flyer?: string;
  /** Added to the WhatsApp message when the order contains this category. */
  orderNote?: string;
};

/** How a product is counted, e.g. { one: "pack", many: "packs" }. */
export type Unit = { one: string; many: string };

export type OptionChoice = {
  id: string;
  name: string;
  /** Added to the product's base price when chosen (₦, whole naira). */
  priceDelta?: number;
  available?: boolean;
};

export type ProductOption = {
  id: string;
  /** Heading shown to the customer, e.g. "Choose size". */
  name: string;
  /** Short label used in the cart and WhatsApp message, e.g. "Size". Defaults to `name`. */
  label?: string;
  /** "single" renders radio buttons, "multiple" renders checkboxes. */
  type: "single" | "multiple";
  /** For "single": the customer must pick one. For "multiple": at least `min`. */
  required?: boolean;
  min?: number;
  max?: number;
  /** Choice pre-selected for "single" options. Defaults to the first available choice when required. */
  defaultChoiceId?: string;
  choices: OptionChoice[];
};

export type ProductImage = {
  src: string;
  /** Optional responsive sources, e.g. "/images/products/x-400.webp 400w, /images/products/x-800.webp 800w". */
  srcSet?: string;
  alt: string;
};

export type Product = {
  id: string;
  /** Full, unique name used in the cart and WhatsApp message. */
  name: string;
  /** Shorter title for menu cards (the price is shown separately). Defaults to `name`. */
  shortName?: string;
  description: string;
  /** What's inside the package, exactly as listed on the flyer. */
  contents?: string[];
  /** Base price in whole naira. */
  price: number;
  category: string;
  image?: ProductImage;
  available: boolean;
  options?: ProductOption[];
  /**
   * Can this product be ordered for an event? Must be stated explicitly on every
   * product. Only Small Chops Packs may be event-eligible (see isEventEligible).
   */
  eventEligible: boolean;
  /** Minimum quantity when the order is an event order (Small Chops Packs: 10). */
  eventMinQuantity?: number;
  /** Allow a free-text note on this item (defaults to true). */
  allowNotes?: boolean;
  /** Small label on the card, e.g. "Min. 10 packs". Keep factual. */
  badge?: string;
  /** Minimum order quantity (defaults to 1). */
  minQuantity?: number;
  /** How the product is counted. Defaults to item/items. */
  unit?: Unit;
};

export type GalleryImage = {
  src: string;
  alt: string;
};

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

/** optionId → chosen choice ids */
export type Selections = Record<string, string[]>;

export type CartLine = {
  lineId: string;
  productId: string;
  quantity: number;
  selections: Selections;
  notes?: string;
};

/* ------------------------------------------------------------------ */
/* Checkout / Order                                                    */
/* ------------------------------------------------------------------ */

export type FulfillmentType = "delivery" | "pickup";

export type EventDetails = {
  enabled: boolean;
  type: string;
  name: string;
  guests: string;
  requirements: string;
};

export type CheckoutDetails = {
  name: string;
  phone: string;
  fulfillment: FulfillmentType | "";
  area: string;
  address: string;
  directions: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  notes: string;
  event: EventDetails;
};

export type OrderItemOption = {
  name: string;
  value: string;
  price?: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  options: OrderItemOption[];
  notes?: string;
  unit?: Unit;
  contents?: string[];
};

/** The validated, priced order handed to the WhatsApp builder. */
export type Order = {
  reference: string;
  customer: { name: string; phone: string };
  fulfillment: {
    type: FulfillmentType;
    area?: string;
    address?: string;
    directions?: string;
    date: string;
    time: string;
  };
  items: OrderItem[];
  event?: {
    type?: string;
    name?: string;
    guests: number;
    requirements?: string;
  };
  notes?: string;
  /** Business notes that apply to this order (e.g. packaging cost to be confirmed). */
  confirmNotes?: string[];
  subtotal: number;
  /** null = delivery fee to be confirmed by the business. */
  deliveryFee: number | null;
};
