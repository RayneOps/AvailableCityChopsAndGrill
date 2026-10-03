# Available City Chops and Grill: ordering website

Production site for **https://availablecitychopsandgrill.com**.

Customers browse the menu (Small Chops Packs and For the Tray), save favourites, add items
to the cart, choose delivery or pickup, add event details for Packs, review the order, and open
**WhatsApp with the order already typed**. The customer taps Send themselves. The business
then confirms the order and sends payment details on WhatsApp. The site has no accounts, no
database and no online payments.

```
Browse → Product → Cart → Checkout → Review → WhatsApp (customer taps Send)
```

## Quick start

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests: menu, pricing, cart, validation, WhatsApp message, gallery timing
npm run typecheck  # TypeScript
npm run build      # production build → dist/
```

`dist/` is a static site, so it can be deployed to any static host (Vercel, Netlify,
Cloudflare Pages, cPanel, etc.). The build already targets
`https://availablecitychopsandgrill.com` for the canonical URL, Open Graph, `sitemap.xml`,
`robots.txt` and structured data.

Optional build-time overrides (you don't need them for production):

| Variable | Purpose |
|---|---|
| `SITE_URL` | Use a different base URL, e.g. for a staging preview |
| `VITE_WHATSAPP_ORDER_NUMBER` | Send orders to a different WhatsApp number (default `2348189794504`) |

## Where to change things

| What | Where |
|---|---|
| Business name, contact numbers, email, address, social links, delivery mode | `src/config/site.ts` |
| Menu (products, prices, contents, minimum quantity, event eligibility) | `src/data/products.ts` |
| Menu sections and flyer notes | `src/data/categories.ts` |
| Logo, product photos, flyers, gallery, share image | `public/images/`. See [`public/images/README.md`](public/images/README.md) |
| Brand colours and fonts | `src/styles/tokens.css` |
| Page title and SEO description | `index.html` |

The menu comes from the two business flyers. Don't add items, prices or options that aren't on them.

## Business rules built in

- **Small Chops Packs:** no minimum. Quantity starts at 1 pack.
  The cart and WhatsApp message show e.g. "₦2,000/pack × 3 packs".
  (A per-product minimum can still be set with `minQuantity` in `src/data/products.ts`.)
- **Event orders:** only Packs show "Ordering for an event?". Event details apply to the whole
  order. The order date/time is the event date/time, and the delivery address is the venue.
- **For the Tray:** normal ordering. The flyer notes (packaging ₦200 – ₦1,500, bulk discount)
  are shown on the menu and added to the WhatsApp message as "to be confirmed". Nothing is
  calculated automatically.
- **Delivery fee:** "To be confirmed" (`delivery.mode: "tbc"`). The total shows as "₦X + delivery".
- **Favourites:** saved on the customer's device (`localStorage`). The cart and checkout details also survive a refresh.
- **Gallery:** every box changes every 60 s on a staggered schedule, so no two boxes change at
  once. Rotation pauses off-screen and in hidden tabs, and turns off for reduced motion.

## How it's built

- **Vite + React + TypeScript**, plain CSS with design tokens. Runtime dependencies: React and one self-hosted font.
- `vite.config.ts` scans `public/images/*` at build time (`virtual:site-assets`), so adding or
  removing an image needs no code change. It also generates the canonical/OG tags, favicon, `robots.txt` and `sitemap.xml`.
- `src/lib/pricing.ts` recomputes every price from the catalog and never trusts prices stored in the browser.
- `src/lib/whatsapp.ts` builds the readable message and the `https://wa.me/2348189794504?text=…` link.
- Overlays use hash routes (`#/item/small-chops-pack-2000`, `#/order`, `#/order/details`,
  `#/order/review`, `#/order/sent`). The phone's back button closes sheets.
