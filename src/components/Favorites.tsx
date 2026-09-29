import { getProduct } from "../data/products";
import { useFavorites } from "../lib/favorites";
import { IconHeart } from "./Icons";
import { useLinesByProduct } from "./Menu";
import { ProductCard } from "./ProductCard";

/** Products the customer has hearted, saved on their device. */
export function Favorites() {
  const ids = useFavorites();
  const linesByProduct = useLinesByProduct();
  const items = ids.map(getProduct).filter((p) => p !== undefined);

  return (
    <section id="favorites" className="favs" aria-labelledby="favs-title">
      <div className="container">
        <div className="favs__head">
          <h2 id="favs-title" className="favs__title">
            <IconHeart size={22} filled /> Your favorites
          </h2>
          {items.length > 0 && <span className="favs__count">{items.length}</span>}
        </div>

        {items.length === 0 ? (
          <div className="favs__empty">
            <p>
              <strong>Your favorites will appear here ❤️</strong>
              <span>Tap the heart on any item to save it for next time.</span>
            </p>
          </div>
        ) : (
          <div className="favs__row">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} lines={linesByProduct.get(p.id) ?? []} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
