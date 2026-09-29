# Images: Available City Chops and Grill

The site picks up images from these folders by itself when it is built or run
with `npm run dev`. **You never need to edit a React component to add, remove or
replace an image.** After you change files, run `npm run build` (or redeploy).

```
public/images/
├── logo/       the circular logo
├── products/   one photo per product (optional)
├── flyers/     the two price-list flyers (optional "View price list" button)
├── gallery/    as many food/business photos as you like
└── brand/      optional social share image (og-image.jpg)
```

## Logo

Put the logo here:

```
public/images/logo/available-city-chops-and-grill-logo.png
```

- PNG with a transparent background works best. Square, at least 512×512.
- It is used in the header, mobile header, footer, hero, the "Order ready"
  screen, the favicon/app icon and the social share preview (unless you add an
  `og-image`).
- It is always shown as a square/circle and keeps its proportions, so it will not be stretched.
- **To replace it:** overwrite the file, keeping the same name. `.webp`, `.jpg` and
  `.svg` also work. If the folder has more than one image, the file whose
  name starts with `available-city-chops-and-grill-logo` is used.
- With no logo in the folder, the site shows the business name as text.

## Product photos

Name each photo after the product ID:

| Product                     | Filename                     |
|-----------------------------|------------------------------|
| Small Chops Pack — ₦2,000   | `small-chops-pack-2000.jpg`  |
| Small Chops Pack — ₦2,500   | `small-chops-pack-2500.jpg`  |
| Small Chops Pack — ₦3,000   | `small-chops-pack-3000.jpg`  |
| Small Chops Pack — ₦3,200   | `small-chops-pack-3200.jpg`  |
| Small Chops Pack — ₦3,500   | `small-chops-pack-3500.jpg`  |
| Small Chops Pack — ₦4,000   | `small-chops-pack-4000.jpg`  |
| Small Chops Pack — ₦4,700   | `small-chops-pack-4700.jpg`  |
| Tray Package — ₦15,000      | `tray-15000.jpg`             |
| Tray Package — ₦27,000      | `tray-27000.jpg`             |
| Tray Package — ₦32,000      | `tray-32000.jpg`             |
| Tray Package — ₦35,000      | `tray-35000.jpg`             |
| Tray Package — ₦42,000      | `tray-42000.jpg`             |
| Tray Package — ₦50,000      | `tray-50000.jpg`             |

- `.jpg`, `.jpeg`, `.png` and `.webp` all work.
- Recommended: square, about 800×800, under 150 KB.
- **To replace a photo:** overwrite the file, keeping the same name.
- A product with no photo shows a branded price tile, not a stock image.

## Flyers (price lists)

```
public/images/flyers/small-chops-packs.jpg   ← yellow "SMALL CHOPS PACKS" flyer
public/images/flyers/for-the-tray.jpg        ← black "FOR THE TRAY" flyer
```

When a flyer is present, its menu section gets a **View price list** button.
The menu itself is always built from `src/data/products.ts`, never from the image.

## Gallery

Drop photos into `public/images/gallery/`. Any number works.

- **To add a photo:** copy it into the folder. Photos are shown in filename order
  (`gallery-01.jpg`, `gallery-02.jpg`, … `gallery-10.jpg` sorts correctly).
- **To remove a photo:** delete the file.
- Alt text (for screen readers) comes from the filename:
  `puff-puff-tray.jpg` → "Puff puff tray". Generic names like `gallery-07.jpg` get
  "Available City Chops and Grill — photo 7", so descriptive names are better.
- Up to 6 photo boxes show on the page. With more photos than boxes, each box
  changes to a new photo every 60 seconds. The boxes take turns (one box changes
  every 10 s with 6 boxes), so no two ever change at the same time. With reduced
  motion turned on, photos stay put. "View all photos" opens the full collection.
- Recommended: long edge about 1200px, WebP or JPG, under 250 KB each. Large
  camera photos slow the site down on mobile data, so resize them first
  (for example with squoosh.app).

## Social share image (optional)

`public/images/brand/og-image.jpg`, 1200×630. This is the preview shown when the link is
shared on WhatsApp, Instagram, X and similar apps. Without it, the logo is used.
