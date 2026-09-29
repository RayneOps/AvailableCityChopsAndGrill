import { usePricedCart } from "../../hooks/useOrder";
import { closeOverlays, goBack, paths, type OrderStep } from "../../lib/router";
import { IconBack, IconClose } from "../Icons";
import { CartStep } from "./CartStep";
import { DetailsStep } from "./DetailsStep";
import { ReviewStep } from "./ReviewStep";
import { SentStep } from "./SentStep";

const TITLES: Record<OrderStep, string> = {
  cart: "Your order",
  details: "Checkout",
  review: "Review your order",
  sent: "Almost done",
};
const PREV: Partial<Record<OrderStep, OrderStep>> = { details: "cart", review: "details" };
const PROGRESS: OrderStep[] = ["cart", "details", "review"];

export function OrderPanel({ step }: { step: OrderStep }) {
  const priced = usePricedCart();
  const prev = PREV[step];
  const current = PROGRESS.indexOf(step);

  return (
    <div className="opanel" data-step={step}>
      <header className="opanel__head">
        {prev ? (
          <button type="button" className="icon-btn" onClick={() => goBack(paths.order(prev))} aria-label="Back">
            <IconBack />
          </button>
        ) : (
          <span className="icon-btn-spacer" />
        )}
        <div className="opanel__titles">
          <h2 id="opanel-title" className="opanel__title">
            {TITLES[step]}
          </h2>
          {step === "cart" && priced.itemCount > 0 && (
            <p className="opanel__sub">{priced.quantityLabel}</p>
          )}
        </div>
        <button type="button" className="icon-btn" onClick={closeOverlays} aria-label="Close order">
          <IconClose />
        </button>
      </header>

      {current >= 0 && (
        <ol className="progress" aria-label="Order progress">
          {PROGRESS.map((s, i) => (
            <li
              key={s}
              className={`progress__step ${i < current ? "is-done" : ""} ${i === current ? "is-current" : ""}`}
              aria-current={i === current ? "step" : undefined}
            >
              <span>{["Order", "Details", "Review"][i]}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="opanel__stage" key={step}>
        {step === "cart" && <CartStep />}
        {step === "details" && <DetailsStep />}
        {step === "review" && <ReviewStep />}
        {step === "sent" && <SentStep />}
      </div>
    </div>
  );
}
