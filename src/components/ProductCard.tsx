import { minQuantityOf } from "../data/products";
import { cart } from "../lib/cart";
import { formatNaira, formatQuantity } from "../lib/format";
import { paths } from "../lib/router";
import { showToast } from "../lib/toast";
import type { CartLine, Product } from "../types";
import { FavoriteButton } from "./FavoriteButton";
import { IconPlus } from "./Icons";
import { Link } from "./Link";
import { ProductImage } from "./ProductImage";
import { QuantityStepper } from "./QuantityStepper";

type Props = {
  product: Product;
  /** Cart lines for this product. */
  lines: CartLine[];
  /** Position in the grid, used to stagger the entrance animation. */
  index?: number;
};

const PREVIEW = 3;

export function ProductCard({ product, lines, index = 0 }: Props) {
  const simple = !product.options || product.options.length === 0;
  const min = minQuantityOf(product);
  const inCart = lines.reduce((n, l) => n + l.quantity, 0);
  // The "plain" line (no note) is what the card's stepper controls for simple products.
  const plainLine = simple ? lines.find((l) => !l.notes) : undefined;
  const fromPrice = product.options?.some((o) => o.required && o.choices.some((c) => (c.priceDelta ?? 0) > 0));
  const contents = product.contents ?? [];
  const title = product.shortName ?? product.name;

  function quickAdd() {
    cart.add({ productId: product.id, selections: {}, quantity: min });
    showToast(min > 1 ? `Added ${formatQuantity(min, product.unit)} of ${product.name}` : `Added ${product.name}`);
  }

  return (
    <article className="pcard" style={{ "--i": Math.min(index, 8) } as React.CSSProperties}>
      <div className="pcard__media">
        <Link href={paths.item(product.id)} className="pcard__medialink" tabIndex={-1} aria-hidden="true">
          <ProductImage product={product} />
        </Link>
        {product.badge && <span className="pcard__badge">{product.badge}</span>}
        <FavoriteButton product={product} className="pcard__fav" />
        {inCart > 0 && !plainLine && (
          <span className="pcard__incart" aria-hidden="true">
            {formatQuantity(inCart, product.unit)} in order
          </span>
        )}
      </div>

      <div className="pcard__body">
        <h3 className="pcard__title">
          <Link href={paths.item(product.id)} aria-label={`${product.name} — view details`}>
            {title}
          </Link>
        </h3>
        {contents.length > 0 ? (
          <ul className="pcard__contents" aria-label="Contents">
            {contents.slice(0, PREVIEW).map((c) => (
              <li key={c}>{c}</li>
            ))}
            {contents.length > PREVIEW && <li className="pcard__more">+{contents.length - PREVIEW} more</li>}
          </ul>
        ) : (
          <p className="pcard__desc">{product.description}</p>
        )}

        <p className="pcard__price">
          {fromPrice && <span className="pcard__from">from </span>}
          {formatNaira(product.price)}
          {product.unit && <span className="pcard__per">/{product.unit.one}</span>}
        </p>
        {inCart > 0 && !plainLine && <p className="sr-only">{formatQuantity(inCart, product.unit)} already in your order.</p>}
      </div>

      <div className={`pcard__action ${plainLine ? "pcard__action--stepper" : ""}`}>
        {!product.available ? null : plainLine ? (
          <QuantityStepper
            size="sm"
            value={plainLine.quantity}
            label={title}
            removeAt={min}
            onChange={(q) => cart.setQuantity(plainLine.lineId, q)}
          />
        ) : simple ? (
          <button
            type="button"
            className="btn-add"
            onClick={quickAdd}
            aria-label={
              min > 1 ? `Add ${formatQuantity(min, product.unit)} of ${product.name} to order` : `Add ${product.name} to order`
            }
          >
            <IconPlus size={18} />
            <span>{min > 1 ? `Add ${min}` : "Add"}</span>
          </button>
        ) : (
          <Link href={paths.item(product.id)} className="btn-add" aria-label={`Choose options for ${product.name}`}>
            <IconPlus size={18} />
            <span>Add</span>
          </Link>
        )}
      </div>
    </article>
  );
}
