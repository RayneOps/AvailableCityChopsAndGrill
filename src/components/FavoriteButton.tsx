import { useState } from "react";
import { favorites, useFavorites } from "../lib/favorites";
import { showToast } from "../lib/toast";
import type { Product } from "../types";
import { IconHeart } from "./Icons";

/** Heart toggle. Favourites are saved on this device (no account needed). */
export function FavoriteButton({ product, className = "" }: { product: Product; className?: string }) {
  const ids = useFavorites();
  const active = ids.includes(product.id);
  const [pop, setPop] = useState(0);

  return (
    <button
      type="button"
      className={`fav-btn ${active ? "is-active" : ""} ${className}`}
      aria-pressed={active}
      aria-label={active ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
      onClick={() => {
        favorites.toggle(product.id);
        setPop((n) => n + 1);
        showToast(active ? "Removed from favorites" : "Saved to favorites");
      }}
    >
      <IconHeart key={pop} size={20} filled={active} className={pop ? "fav-btn__icon is-popping" : "fav-btn__icon"} />
    </button>
  );
}
