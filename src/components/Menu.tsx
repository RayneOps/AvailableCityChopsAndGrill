import { useMemo, useRef, useState } from "react";
import { flyerImages } from "virtual:site-assets";
import { categories } from "../data/categories";
import { products } from "../data/products";
import { useCart } from "../lib/cart";
import type { CartLine, Category, GalleryImage } from "../types";
import { Lightbox } from "./Gallery";
import { IconImage, IconInfo } from "./Icons";
import { ProductCard } from "./ProductCard";
import { Sheet } from "./Sheet";

const ALL = "all";

/** The category's flyer in /public/images/flyers, if one has been added. */
function flyerFor(category: Category): GalleryImage | null {
  if (!category.flyer) return null;
  const file = flyerImages.find((f) => f.replace(/\.[^.]+$/, "").toLowerCase() === category.flyer);
  return file ? { src: `/images/flyers/${encodeURIComponent(file)}`, alt: `${category.name} price list` } : null;
}

export function useLinesByProduct() {
  const lines = useCart();
  return useMemo(() => {
    const map = new Map<string, CartLine[]>();
    for (const l of lines) map.set(l.productId, [...(map.get(l.productId) ?? []), l]);
    return map;
  }, [lines]);
}

export function Menu() {
  const linesByProduct = useLinesByProduct();
  const [active, setActive] = useState<string>(ALL);
  const [flyer, setFlyer] = useState<GalleryImage | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const visibleCategories = useMemo(() => categories.filter((c) => products.some((p) => p.category === c.id)), []);

  function select(id: string) {
    setActive(id);
    // If the category bar is stuck to the top, bring the start of the list into view.
    const section = sectionRef.current;
    if (section && section.getBoundingClientRect().top < 0) {
      section.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }

  const groups = (active === ALL ? visibleCategories : visibleCategories.filter((c) => c.id === active)).map((c) => ({
    category: c,
    items: products.filter((p) => p.category === c.id),
  }));

  let index = 0;

  return (
    <section id="menu" className="menu" ref={sectionRef} aria-labelledby="menu-title">
      <div className="container menu__head" data-reveal>
        <p className="eyebrow">Menu</p>
        <h2 id="menu-title" className="section-title">
          Small chops, packed your way
        </h2>
      </div>

      <nav className="catnav" aria-label="Menu categories">
        <div className="catnav__scroller container">
          {[{ id: ALL, name: "All" }, ...visibleCategories].map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={active === c.id} onClick={() => select(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="container menu__body" key={active}>
        {groups.map(({ category, items }) => {
          const flyerImage = flyerFor(category);
          return (
            <div key={category.id} id={`cat-${category.id}`} className="menu__group">
              <div className="menu__grouphead">
                <h3 className="menu__cat">{category.name}</h3>
                {flyerImage && (
                  <button type="button" className="link-btn link-btn--sm" onClick={() => setFlyer(flyerImage)}>
                    <IconImage size={16} /> View price list
                  </button>
                )}
              </div>
              {category.notes && (
                <ul className="menu__notes">
                  {category.notes.map((n) => (
                    <li key={n}>
                      <IconInfo size={16} />
                      {n}
                    </li>
                  ))}
                </ul>
              )}
              <div className="pgrid">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} lines={linesByProduct.get(p.id) ?? []} index={index++} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={!!flyer} onClose={() => setFlyer(null)} variant="bottom" labelledBy="lightbox-title" className="sheet--lightbox">
        {flyer && <Lightbox images={[flyer]} start={0} onClose={() => setFlyer(null)} />}
      </Sheet>
    </section>
  );
}
