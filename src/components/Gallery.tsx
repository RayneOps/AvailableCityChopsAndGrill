import { useEffect, useRef, useState } from "react";
import { gallery } from "../data/gallery";
import { canRotate, initialTiles, pickNextImage, stepMs, tileForTick } from "../lib/galleryRotation";
import type { GalleryImage } from "../types";
import { IconChevronLeft, IconChevronRight, IconClose, IconImage } from "./Icons";
import { Sheet } from "./Sheet";

export const hasGallery = gallery.length > 0;

/** Number of photo boxes on the page (the collection itself can be any size). */
const MAX_TILES = 6;

function preload(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

type TileState = { image: number; prev: number | null; version: number };

export function Gallery() {
  const count = Math.min(MAX_TILES, gallery.length);
  const [tiles, setTiles] = useState<TileState[]>(() => initialTiles(count).map((image) => ({ image, prev: null, version: 0 })));
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  // Images currently shown or about to be shown, so two boxes never show the same photo.
  const reserved = useRef(initialTiles(count));
  const cursor = useRef(count);
  const tick = useRef(0);

  // Only rotate while the gallery is on screen (saves data on phones).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !("IntersectionObserver" in window)) return setInView(true);
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Staggered rotation: one box changes every 60s / boxes, so each box changes every 60s
  // but never at the same moment as another.
  useEffect(() => {
    if (!canRotate(gallery.length, count) || reduced || !inView) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      tick.current += 1;
      const tile = tileForTick(tick.current, count);
      const others = reserved.current.filter((_, i) => i !== tile);
      const next = pickNextImage([...others, reserved.current[tile]!], cursor.current, gallery.length);
      cursor.current = next.cursor;
      reserved.current[tile] = next.image;
      void preload(gallery[next.image]!.src).then(() =>
        setTiles((prev) =>
          prev.map((t, i) => (i === tile ? { image: next.image, prev: t.image, version: t.version + 1 } : t)),
        ),
      );
    }, stepMs(count));
    return () => window.clearInterval(id);
  }, [count, reduced, inView]);

  if (!hasGallery) return null;

  return (
    <section id="gallery" className="gallery" aria-labelledby="gallery-title" ref={sectionRef} data-reveal>
      <div className="container">
        <p className="eyebrow">Gallery</p>
        <h2 id="gallery-title" className="section-title">
          From our kitchen
        </h2>
        <ul className={`gallery__grid gallery__grid--${count}`}>
          {tiles.map((t, i) => {
            const img = gallery[t.image]!;
            const prev = t.prev !== null ? gallery[t.prev] : undefined;
            return (
              <li key={i} className={`gtile gtile--${i + 1}`}>
                <button
                  type="button"
                  className="gtile__btn"
                  onClick={() => setOpenAt(t.image)}
                  aria-label={`View photo: ${img.alt}`}
                  data-tile={i}
                  data-image={t.image}
                  data-version={t.version}
                >
                  {prev && <img className="gtile__img gtile__img--prev" src={prev.src} alt="" aria-hidden="true" />}
                  <img
                    key={t.version}
                    className={`gtile__img ${t.version ? "gtile__img--enter" : ""}`}
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              </li>
            );
          })}
        </ul>
        {gallery.length > count && (
          <button type="button" className="btn btn--secondary gallery__all" onClick={() => setOpenAt(0)}>
            <IconImage size={18} /> View all {gallery.length} photos
          </button>
        )}
      </div>

      <Sheet open={openAt !== null} onClose={() => setOpenAt(null)} variant="bottom" labelledBy="lightbox-title" className="sheet--lightbox">
        {openAt !== null && <Lightbox images={gallery} start={openAt} onClose={() => setOpenAt(null)} />}
      </Sheet>
    </section>
  );
}

/** Swipeable (scroll-snap) lightbox with arrow buttons and keyboard support. Works for any number of images. */
export function Lightbox({ images, start, onClose }: { images: GalleryImage[]; start: number; onClose: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);

  useEffect(() => {
    const el = track.current;
    if (el) el.scrollTo({ left: start * el.clientWidth, behavior: "instant" as ScrollBehavior });
  }, [start]);

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(images.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  const single = images.length === 1;

  return (
    <div
      className="lightbox"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <h2 id="lightbox-title" className="sr-only">
        {single ? images[0]!.alt : `Photo ${index + 1} of ${images.length}`}
      </h2>
      <div
        className="lightbox__track"
        ref={track}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {images.map((img, i) => (
          <figure key={img.src} className="lightbox__slide" aria-hidden={i !== index}>
            {/* Only mount images near the current one, so large galleries stay light. */}
            {Math.abs(i - index) <= 2 || Math.abs(i - start) <= 1 ? (
              <img src={img.src} alt={img.alt} decoding="async" />
            ) : null}
          </figure>
        ))}
      </div>
      <div className="lightbox__bar">
        {!single && (
          <>
            <button type="button" className="icon-btn" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous photo">
              <IconChevronLeft />
            </button>
            <span className="lightbox__count" aria-live="polite">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => go(index + 1)}
              disabled={index === images.length - 1}
              aria-label="Next photo"
            >
              <IconChevronRight />
            </button>
          </>
        )}
        <button type="button" className="icon-btn lightbox__close" onClick={onClose} aria-label="Close">
          <IconClose />
        </button>
      </div>
    </div>
  );
}
