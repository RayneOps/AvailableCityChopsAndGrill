import { useMemo } from "react";
import { useCart } from "../lib/cart";
import { useCheckout } from "../lib/checkout";
import { priceCart } from "../lib/pricing";
import { effectiveDetails } from "../lib/order";
import { validateCheckout } from "../lib/validation";

/** The priced cart. Event minimums apply while the customer is ordering for an event. */
export function usePricedCart() {
  const lines = useCart();
  const event = useCheckout().event.enabled;
  return useMemo(() => priceCart(lines, undefined, event), [lines, event]);
}

/** Checkout details + validation. Event details only count when the order contains Packs. */
export function useCheckoutValidation() {
  const raw = useCheckout();
  const priced = usePricedCart();
  const details = useMemo(() => effectiveDetails(raw, priced), [raw, priced]);
  const errors = useMemo(() => validateCheckout(details), [details]);
  return { details, errors, valid: Object.keys(errors).length === 0 };
}
