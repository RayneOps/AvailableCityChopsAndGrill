import { useEffect, useRef, useState } from "react";
import { usePricedCart } from "../hooks/useOrder";
import { formatNaira } from "../lib/format";
import { paths } from "../lib/router";
import { IconArrow, IconBag } from "./Icons";
import { Link } from "./Link";

/** Persistent "View order" bar, shown whenever the order has items. */
export function CartBar({ hidden }: { hidden: boolean }) {
  const { itemCount, subtotal, quantityLabel } = usePricedCart();
  const [bump, setBump] = useState(false);
  const prev = useRef(itemCount);

  useEffect(() => {
    if (itemCount !== prev.current) {
      prev.current = itemCount;
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 400);
      return () => window.clearTimeout(t);
    }
  }, [itemCount]);

  const visible = itemCount > 0 && !hidden;

  return (
    <div className={`cartbar ${visible ? "is-visible" : ""}`} aria-hidden={!visible}>
      <Link href={paths.order()} className={`cartbar__btn ${bump ? "is-bumping" : ""}`} tabIndex={visible ? 0 : -1}>
        <span className="cartbar__count">
          <IconBag size={20} />
          {quantityLabel}
        </span>
        <span className="cartbar__total">{formatNaira(subtotal)}</span>
        <span className="cartbar__cta">
          View order <IconArrow size={18} />
        </span>
      </Link>
    </div>
  );
}
