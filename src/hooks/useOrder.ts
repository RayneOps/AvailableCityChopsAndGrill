import { useMemo } from "react";
import { useCart } from "../lib/cart";
import { useCheckout } from "../lib/checkout";
import { priceCart } from "../lib/pricing";
import { effectiveDetails } from "../lib/order";
import { validateCheckout } from "../lib/validation";

export function usePricedCart() {
  const lines = useCart();
  return useMemo(() => priceCart(lines), [lines]);
}

/** Checkout details + validation. Event details only count when the order contains Packs. */
export function useCheckoutValidation() {
  const raw = useCheckout();
  const priced = usePricedCart();
  const details = useMemo(() => effectiveDetails(raw, priced), [raw, priced]);
  const errors = useMemo(() => validateCheckout(details), [details]);
  return { details, errors, valid: Object.keys(errors).length === 0 };
}
