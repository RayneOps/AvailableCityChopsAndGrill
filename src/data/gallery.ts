import { galleryImages } from "virtual:site-assets";
import { site } from "../config/site";
import type { GalleryImage } from "../types";

/**
 * Gallery photos are loaded automatically from /public/images/gallery.
 * Add or delete files there — no code changes needed. Files are shown in
 * filename order (gallery-01.jpg, gallery-02.jpg, …).
 *
 * Alt text comes from the filename: "puff-puff-tray.jpg" → "Puff puff tray".
 * Generic names like "gallery-07.jpg" become "Available City Chops and Grill — photo 7".
 */
function altFromFilename(file: string, index: number): string {
  const base = file.replace(/\.[^.]+$/, "");
  const words = base.replace(/[-_]+/g, " ").trim();
  if (!words || /^(gallery|img|image|photo|pic|dsc|whatsapp image)?\s*[\d\s.]*$/i.test(words)) {
    return `${site.name} — photo ${index + 1}`;
  }
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export const gallery: GalleryImage[] = galleryImages.map((file, i) => ({
  src: `/images/gallery/${encodeURIComponent(file)}`,
  alt: altFromFilename(file, i),
}));
