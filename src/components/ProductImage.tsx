import { useState } from "react";
import { getCategory } from "../data/categories";
import { formatNaira } from "../lib/format";
import type { Product } from "../types";

type Props = {
  product: Product;
  sizes?: string;
  eager?: boolean;
  className?: string;
};

/**
 * Product photo with a shimmer while loading. Until a real photo is added
 * (or if it fails to load) a branded "menu board" tile is shown instead —
 * no invented food photography.
 */
export function ProductImage({ product, sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw", eager, className = "" }: Props) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const img = product.image;

  if (!img || state === "error") {
    const category = getCategory(product.category)?.name ?? "";
    return (
      <div className={`pimg pimg--tile pimg--${product.category} ${className}`} role="img" aria-label={product.name}>
        <span className="pimg__cat" aria-hidden="true">
          {category}
        </span>
        <span className="pimg__price" aria-hidden="true">
          {formatNaira(product.price)}
        </span>
        <span className="pimg__per" aria-hidden="true">
          {product.unit ? `per ${product.unit.one}` : ""}
        </span>
        <span className="pimg__count" aria-hidden="true">
          {product.contents ? `${product.contents.length} items inside` : ""}
        </span>
      </div>
    );
  }

  return (
    <div className={`pimg ${className}`} data-state={state}>
      <img
        src={img.src}
        srcSet={img.srcSet}
        sizes={img.srcSet ? sizes : undefined}
        alt={img.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
      />
    </div>
  );
}
