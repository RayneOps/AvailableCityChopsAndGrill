import { site } from "../../config/site";
import { formatNaira } from "../../lib/format";
import { deliveryFeeFor } from "../../lib/order";
import { closeOverlays } from "../../lib/router";
import type { FulfillmentType } from "../../types";
import { IconBag, IconWallet } from "../Icons";

export function EmptyOrder() {
  return (
    <div className="opanel__body">
      <div className="empty empty--tall">
        <span className="empty__icon" aria-hidden="true">
          <IconBag size={30} />
        </span>
        <p className="empty__title">Your order is empty</p>
        <p className="empty__text">Browse the menu and tap “Add” on a pack or tray.</p>
        <button type="button" className="btn btn--primary" onClick={closeOverlays}>
          Browse menu
        </button>
      </div>
    </div>
  );
}

/** Subtotal / delivery / total. Never invents a delivery price. */
export function OrderTotals({ subtotal, fulfillment }: { subtotal: number; fulfillment: FulfillmentType | "" }) {
  const fee = fulfillment ? deliveryFeeFor(fulfillment) : null;
  let deliveryText: string;
  if (fulfillment === "pickup") deliveryText = "No delivery fee";
  else if (fulfillment === "delivery") deliveryText = fee === null ? "To be confirmed" : fee === 0 ? "Free" : formatNaira(fee);
  else deliveryText = site.delivery.mode === "fixed" ? `${formatNaira(site.delivery.fixedFee)} if delivered` : "To be confirmed";

  const known = fulfillment !== "" && fee !== null;
  const total = subtotal + (known ? (fee ?? 0) : 0);

  return (
    <dl className="totals">
      <div className="totals__row">
        <dt>Subtotal</dt>
        <dd>{formatNaira(subtotal)}</dd>
      </div>
      <div className="totals__row">
        <dt>Delivery</dt>
        <dd className={known ? "" : "totals__muted"}>{deliveryText}</dd>
      </div>
      <div className="totals__row totals__row--total">
        <dt>Total</dt>
        <dd>
          {formatNaira(total)}
          {!known && fulfillment !== "pickup" && <span className="totals__plus"> + delivery</span>}
        </dd>
      </div>
    </dl>
  );
}

export function PaymentNote() {
  return (
    <div className="paynote">
      <IconWallet size={20} />
      <p>
        <strong>No payment on this website.</strong> After we confirm your order on WhatsApp, we'll send you the payment
        details.
      </p>
    </div>
  );
}
