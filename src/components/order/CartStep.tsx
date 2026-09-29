import { useEffect, useState } from "react";
import { usePricedCart } from "../../hooks/useOrder";
import { cart } from "../../lib/cart";
import { draftRefStore } from "../../lib/checkout";
import { formatNaira, formatQuantity } from "../../lib/format";
import type { PricedLine } from "../../lib/pricing";
import { closeOverlays, navigate, paths } from "../../lib/router";
import { showToast } from "../../lib/toast";
import { IconAlert, IconEdit, IconTrash } from "../Icons";
import { Link } from "../Link";
import { QuantityStepper } from "../QuantityStepper";
import { EmptyOrder, OrderTotals } from "./shared";

export function CartStep() {
  const priced = usePricedCart();
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!confirmClear) return;
    const t = window.setTimeout(() => setConfirmClear(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirmClear]);

  if (priced.lines.length === 0) return <EmptyOrder />;

  function clearAll() {
    if (!confirmClear) return setConfirmClear(true);
    cart.clear();
    draftRefStore.set("");
    showToast("Order cleared");
  }

  return (
    <>
      <div className="opanel__body">
        {priced.hasProblems && (
          <p className="notice notice--warn" role="alert">
            <IconAlert size={18} />
            Some items need your attention before you can continue.
          </p>
        )}

        <ul className="citems" aria-label="Items in your order">
          {priced.lines.map((pl) => (
            <CartItem key={pl.line.lineId} priced={pl} />
          ))}
        </ul>

        <div className="citems__actions">
          <button type="button" className="link-btn" onClick={closeOverlays}>
            + Add more items
          </button>
          <button type="button" className={`link-btn ${confirmClear ? "link-btn--danger" : "link-btn--muted"}`} onClick={clearAll}>
            {confirmClear ? "Tap again to clear" : "Clear order"}
          </button>
        </div>

        <OrderTotals subtotal={priced.subtotal} fulfillment="" />
      </div>

      <div className="opanel__foot">
        <button
          type="button"
          className="btn btn--primary btn--block btn--lg"
          disabled={priced.hasProblems || priced.itemCount === 0}
          onClick={() => navigate(paths.order("details"))}
        >
          <span>Continue</span>
          <span className="btn__price">{formatNaira(priced.subtotal)}</span>
        </button>
      </div>
    </>
  );
}

function CartItem({ priced }: { priced: PricedLine }) {
  const { line, product, status } = priced;
  const editable = product && status !== "missing" && ((product.options?.length ?? 0) > 0 || product.allowNotes !== false);
  const problem =
    status === "missing"
      ? "This item is no longer on the menu. Please remove it."
      : status === "unavailable"
        ? "Sorry, this item is currently unavailable. Please remove it."
        : status === "invalid"
          ? "The options for this item have changed. Please edit it."
          : status === "belowMin"
            ? `Minimum order is ${formatQuantity(priced.minQuantity, priced.unit)}. Please increase the quantity.`
            : null;

  return (
    <li className={`citem ${problem ? "citem--problem" : ""}`}>
      <div className="citem__main">
        <p className="citem__name">{priced.name}</p>
        {priced.options.length > 0 && (
          <ul className="citem__opts">
            {priced.options.map((o) => (
              <li key={o.name}>
                {o.name}: {o.value}
              </li>
            ))}
          </ul>
        )}
        {line.notes && <p className="citem__note">“{line.notes}”</p>}
        {priced.contents && priced.contents.length > 0 && (
          <p className="citem__contents">{priced.contents.join(" · ")}</p>
        )}
        {problem ? (
          <p className="citem__problem">{problem}</p>
        ) : (
          <p className="citem__unit">
            {formatNaira(priced.unitPrice)}
            {priced.unit ? `/${priced.unit.one}` : " each"} × {formatQuantity(line.quantity, priced.unit)}
            {priced.minQuantity > 1 && <span className="citem__min"> · min. {priced.minQuantity}</span>}
          </p>
        )}
        <div className="citem__links">
          {editable && (
            <Link href={paths.item(line.productId, line.lineId)} className="link-btn link-btn--sm">
              <IconEdit size={15} /> Edit
            </Link>
          )}
          <button
            type="button"
            className="link-btn link-btn--sm link-btn--muted"
            onClick={() => {
              cart.remove(line.lineId);
              showToast(`Removed ${priced.name}`);
            }}
          >
            <IconTrash size={15} /> Remove
          </button>
        </div>
      </div>
      <div className="citem__side">
        {(!problem || status === "belowMin") && (
          <>
            <p className="citem__total">{formatNaira(priced.lineTotal)}</p>
            <QuantityStepper
              size="sm"
              value={line.quantity}
              label={priced.name}
              removeAt={status === "belowMin" ? line.quantity : priced.minQuantity}
              onChange={(q) =>
                cart.setQuantity(line.lineId, status === "belowMin" && q > line.quantity ? priced.minQuantity : q)
              }
            />
          </>
        )}
      </div>
    </li>
  );
}
