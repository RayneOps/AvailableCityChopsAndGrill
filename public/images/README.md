# Images: Available City Chops and Grill

The site picks up images from these folders by itself when it is built or run
with `npm run dev`. **You never need to edit a React component to add, remove or
replace an image.** After you change files, run `npm run build` (or redeploy).

```
public/images/
├── brand/              who the business is
│   ├── logo.png
│   ├── favicon.png
│   └── og-image.png
├── products/           what customers order
│   ├── packs/          the seven Small Chops Pack photos (+ shared pack.jpg)
│   └── trays/          the six For the Tray photos (+ shared tray.jpg)
├── flyers/             the original menu / price-list flyers
│   ├── pack-flyer.jpeg
│   └── tray-flyer.jpeg
└── gallery/            rotating general food / event / business photos
```

Keep the four kinds separate: a product photo goes in `products/`, a flyer in
`flyers/`, and everything else in `gallery/`.

## brand/: logo and brand assets

| File           | Used for                                                                                   |
|----------------|--------------------------------------------------------------------------------------------|
| `logo.png`     | Desktop and mobile header, footer, hero, "Order ready" screen, structured data (SEO)       |
| `favicon.png`  | Browser tab icon and home-screen icon. Falls back to `logo.png` if missing                 |
| `og-image.png` | Preview shown when the link is shared on WhatsApp, Instagram, X… (1200×630). Falls back to `logo.png` |

- The logo is always shown at its own aspect ratio. It is never stretched,
  cropped or redrawn.
- **To replace it:** overwrite the file, keeping the same name. `.jpg`, `.webp`
  and `.svg` also work (e.g. `logo.webp`).
- The business name only shows as text if `logo.*` is missing.

## products/packs/: Small Chops Packs (7)

| Product                     | File                     |
|-----------------------------|--------------------------|
| Small Chops Pack — ₦2,000   | `packs/pack-2000.jpg`    |
| Small Chops Pack — ₦2,500   | `packs/pack-2500.jpg`    |
| Small Chops Pack — ₦3,000   | `packs/pack-3000.jpg`    |
| Small Chops Pack — ₦3,200   | `packs/pack-3200.jpg`    |
| Small Chops Pack — ₦3,500   | `packs/pack-3500.jpg`    |
| Small Chops Pack — ₦4,000   | `packs/pack-4000.jpg`    |
| Small Chops Pack — ₦4,700   | `packs/pack-4700.jpg`    |

## products/trays/: For the Tray (6)

| Product                     | File                     |
|-----------------------------|--------------------------|
| Tray Package — ₦15,000      | `trays/tray-15000.jpg`   |
| Tray Package — ₦27,000      | `trays/tray-27000.jpg`   |
| Tray Package — ₦32,000      | `trays/tray-32000.jpg`   |
| Tray Package — ₦35,000      | `trays/tray-35000.jpg`   |
| Tray Package — ₦42,000      | `trays/tray-42000.jpg`   |
| Tray Package — ₦50,000      | `trays/tray-50000.jpg`   |

- The number in the filename is the price, so each photo matches its product.
- **Shared photo:** `packs/pack.jpg` is shown on every pack and `trays/tray.jpg`
  on every tray until that product has its own photo (e.g. `pack-2000.jpg`).
- `.jpg`, `.jpeg`, `.png` and `.webp` all work.
- Recommended: square, about 800×800, under 150 KB.
- **To replace a photo:** overwrite the file, keeping the same name.
- A product with no photo shows a branded price tile, not a stock image.
- Prices and contents come from `src/data/products.ts`, never from the photo.

## flyers/: original menu flyers

```
flyers/pack-flyer.jpeg    ← "SMALL CHOPS PACKS" price-list flyer
flyers/tray-flyer.jpeg    ← "FOR THE TRAY" price-list flyer
```

These are the original price-list artwork, not product photos. When a flyer is
present, its menu section gets a **View price list** button that opens it
full-screen. The menu itself is always built from `src/data/products.ts`.

## gallery/: rotating general photography

Drop photos into `gallery/`. Any number works. **Adding a gallery photo needs no
code change.**

- **To add a photo:** copy it into the folder. Photos are shown in filename order
  (`gallery-01.jpg`, `gallery-02.jpg`, … `gallery-10.jpg` sorts correctly).
- **To remove a photo:** delete the file.
- Alt text (for screen readers) comes from the filename:
  `puff-puff-tray.jpg` → "Puff puff tray". Generic names like `gallery-07.jpg` or
  `658002.jpg` get "Available City Chops and Grill — photo 7", so descriptive names are better.
- Up to 6 photo boxes show on the page. With more photos than boxes, each box
  changes to a new photo every 60 seconds. The boxes take turns (one box changes
  every 10 s with 6 boxes), so no two ever change at the same time. With reduced
  motion turned on, photos stay put. Photos load lazily. "View all photos" opens
  the full collection.
- Avoid copying the same photo in twice: it can then appear in two boxes at once.
- Recommended: long edge about 1200px, WebP or JPG, under 250 KB each. Large
  camera photos slow the site down on mobile data, so resize them first
  (for example with squoosh.app).
