/**
 * ============================================================
 *  BUSINESS CONFIGURATION — edit this file to update the site.
 * ============================================================
 * Everything here is real business information supplied by
 * Available City Chops and Grill. Empty values are hidden automatically.
 *
 * Images (logo, product photos, flyers, gallery) are picked up
 * automatically from /public/images — see public/images/README.md.
 */

export type PhoneNumber = {
  /** As shown to customers, e.g. "0704 007 8067". */
  display: string;
  /** International format for tel: links, e.g. "+2347040078067". */
  tel: string;
};

export type SiteConfig = {
  name: string;
  /** One factual line used in the hero, footer and SEO. */
  tagline: string;
  url: string;
  hero: { headline: string; subtext: string };
  /** WHATSAPP_ORDER_NUMBER — international format, digits only (no "+", no leading 0). */
  whatsappOrderNumber: string;
  /** Shown to customers next to the WhatsApp icon. */
  whatsappDisplay: string;
  orderRefPrefix: string;
  contact: { phones: PhoneNumber[]; email: string; address: string; mapsUrl: string; hours: string };
  social: { instagram: string; tiktok: string; snapchat: string };
  delivery: { mode: "tbc" | "fixed"; fixedFee: number; areas: string[] };
  pickup: { note: string };
  eventTypes: string[];
};

export const site: SiteConfig = {
  name: "Available City Chops and Grill",
  tagline: "Small chops, trays and event packs in Lagos.",
  url: "https://availablecitychopsandgrill.com",

  hero: {
    headline: "Available City Chops and Grill",
    subtext:
      "Small chops, trays and event packs in Lagos. Choose your order here and send it to us on WhatsApp — we'll confirm and share payment details.",
  },

  whatsappOrderNumber: (import.meta.env.VITE_WHATSAPP_ORDER_NUMBER as string | undefined) || "2348189794504",
  whatsappDisplay: "0818 979 4504",

  orderRefPrefix: "ACG",

  contact: {
    phones: [
      { display: "0704 007 8067", tel: "+2347040078067" },
      { display: "0907 929 9530", tel: "+2349079299530" },
    ],
    email: "availablecitychopsandgrill@gmail.com",
    address: "60 Glover Street, Lagos Island, Lagos",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=60+Glover+Street%2C+Lagos+Island%2C+Lagos",
    /** Not supplied yet — leave empty so nothing is invented. */
    hours: "",
  },

  social: {
    instagram: "https://www.instagram.com/available_city_chops_and_grill/",
    tiktok: "https://www.tiktok.com/@availablecitychops1",
    snapchat: "https://snapchat.com/t/y1lZh4Ag",
  },

  delivery: {
    /**
     * "tbc"   → "Delivery fee to be confirmed" (quoted on WhatsApp)
     * "fixed" → a flat fee added to every delivery order (set `fixedFee`)
     */
    mode: "tbc",
    fixedFee: 0,
    /** Optional list of delivery areas. Empty = free-text area field. */
    areas: [],
  },

  pickup: {
    note: "We'll confirm your pickup time on WhatsApp.",
  },

  /** Options for "Type of event" when ordering packs for an event. */
  eventTypes: ["Birthday", "Wedding", "Corporate event", "Church / religious event", "Party", "Other"],
};
