import { useRef, useState } from "react";
import { site } from "../../config/site";
import { useCheckoutValidation, usePricedCart } from "../../hooks/useOrder";
import { draftRefStore, updateDetails, updateEvent } from "../../lib/checkout";
import { toISODate } from "../../lib/format";
import { generateOrderRef } from "../../lib/order";
import { navigate, paths } from "../../lib/router";
import { FIELD_ORDER, type CheckoutField } from "../../lib/validation";
import type { FulfillmentType } from "../../types";
import { EventFields } from "../EventFields";
import { Field } from "../Field";
import { IconAlert, IconParty, IconPin, IconStore, IconTruck } from "../Icons";
import { EmptyOrder, OrderTotals, PaymentNote } from "./shared";

/** DOM id to focus for each validated field. */
const FIELD_IDS: Record<CheckoutField, string> = {
  name: "co-name",
  phone: "co-phone",
  fulfillment: "co-ful-delivery",
  area: "co-area",
  address: "co-address",
  eventGuests: "cevent-guests",
  date: "co-date",
  time: "co-time",
};

export function DetailsStep() {
  const priced = usePricedCart();
  const { details, errors } = useCheckoutValidation();
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({});
  const summaryRef = useRef<HTMLParagraphElement>(null);

  if (priced.itemCount === 0) return <EmptyOrder />;

  const shown = (f: CheckoutField) => (submitted || touched[f] ? errors[f] : undefined);
  const touch = (f: CheckoutField) => () => setTouched((t) => ({ ...t, [f]: true }));
  const errorCount = Object.keys(errors).length;
  const isEvent = details.event.enabled;
  // Event ordering is only offered for Small Chops Packs.
  const eventAvailable = priced.hasEventItems;

  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const quickDates = [
    { label: "Today", value: toISODate(today) },
    { label: "Tomorrow", value: toISODate(tomorrow) },
  ];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (errorCount > 0) {
      const first = FIELD_ORDER.find((f) => errors[f]);
      if (first) {
        const el = document.getElementById(FIELD_IDS[first]);
        el?.focus();
        el?.scrollIntoView({ block: "center" });
      }
      return;
    }
    if (!draftRefStore.get()) draftRefStore.set(generateOrderRef());
    navigate(paths.order("review"));
  }

  return (
    <form className="opanel__form" onSubmit={submit} noValidate>
      <div className="opanel__body">
        <fieldset className="fsection">
          <legend className="fsection__title">Your details</legend>
          <Field id="co-name" label="Full name" error={shown("name")} required>
            <input
              id="co-name"
              type="text"
              autoComplete="name"
              autoCapitalize="words"
              maxLength={80}
              value={details.name}
              onChange={(e) => updateDetails({ name: e.target.value })}
              onBlur={touch("name")}
            />
          </Field>
          <Field
            id="co-phone"
            label="WhatsApp / phone number"
            hint="We'll use this to confirm your order."
            error={shown("phone")}
            required
          >
            <input
              id="co-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0803 123 4567"
              maxLength={20}
              value={details.phone}
              onChange={(e) => updateDetails({ phone: e.target.value })}
              onBlur={touch("phone")}
            />
          </Field>
        </fieldset>

        <fieldset className="fsection" aria-describedby={shown("fulfillment") ? "co-ful-error" : undefined}>
          <legend className="fsection__title">How would you like to receive your order?</legend>
          <div className="segmented">
            {(
              [
                { value: "delivery", label: "Delivery", sub: "To your address", Icon: IconTruck },
                { value: "pickup", label: "Pickup", sub: "Collect from us", Icon: IconStore },
              ] as const
            ).map(({ value, label, sub, Icon }) => (
              <label key={value} className="segmented__opt">
                <input
                  id={`co-ful-${value}`}
                  type="radio"
                  name="fulfillment"
                  value={value}
                  checked={details.fulfillment === value}
                  onChange={() => updateDetails({ fulfillment: value as FulfillmentType })}
                  aria-invalid={shown("fulfillment") ? true : undefined}
                />
                <span className="segmented__card">
                  <Icon size={22} />
                  <span className="segmented__label">{label}</span>
                  <span className="segmented__sub">{sub}</span>
                </span>
              </label>
            ))}
          </div>
          {shown("fulfillment") && (
            <p id="co-ful-error" className="field__error">
              {shown("fulfillment")}
            </p>
          )}

          {details.fulfillment === "delivery" && (
            <div className="reveal-in">
              {site.delivery.areas.length > 0 ? (
                <Field id="co-area" label="Area" error={shown("area")} required>
                  <select
                    id="co-area"
                    value={details.area}
                    onChange={(e) => updateDetails({ area: e.target.value })}
                    onBlur={touch("area")}
                  >
                    <option value="">Select your area…</option>
                    {site.delivery.areas.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field id="co-area" label="Area / neighbourhood" error={shown("area")} required>
                  <input
                    id="co-area"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="e.g. Lagos Island"
                    maxLength={80}
                    value={details.area}
                    onChange={(e) => updateDetails({ area: e.target.value })}
                    onBlur={touch("area")}
                  />
                </Field>
              )}
              <Field
                id="co-address"
                label={isEvent ? "Event venue / delivery address" : "Full delivery address"}
                error={shown("address")}
                required
              >
                <input
                  id="co-address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="House number, street, estate"
                  maxLength={200}
                  value={details.address}
                  onChange={(e) => updateDetails({ address: e.target.value })}
                  onBlur={touch("address")}
                />
              </Field>
              <Field id="co-directions" label="Landmark / directions" optional>
                <input
                  id="co-directions"
                  type="text"
                  placeholder="e.g. Opposite the filling station"
                  maxLength={200}
                  value={details.directions}
                  onChange={(e) => updateDetails({ directions: e.target.value })}
                />
              </Field>
              <p className="hint">
                {site.delivery.mode === "fixed"
                  ? "A flat delivery fee is added to your total."
                  : "Delivery fee to be confirmed on WhatsApp, based on your location."}
              </p>
            </div>
          )}

          {details.fulfillment === "pickup" && (
            <div className="pickup-info reveal-in">
              <IconPin size={20} />
              <div>
                {site.contact.address && <p className="pickup-info__addr">Pickup from {site.contact.address}</p>}
                <p>{site.pickup.note}</p>
              </div>
            </div>
          )}
        </fieldset>

        <fieldset className="fsection">
          <legend className="fsection__title">{isEvent ? "When is the event?" : "When do you want it?"}</legend>
          <div className="quick-dates" role="group" aria-label="Quick date options">
            {quickDates.map((q) => (
              <button
                key={q.label}
                type="button"
                className="chip chip--sm"
                aria-pressed={details.date === q.value}
                onClick={() => updateDetails({ date: q.value })}
              >
                {q.label}
              </button>
            ))}
          </div>
          <div className="form-grid">
            <Field id="co-date" label={isEvent ? "Event date" : "Date"} error={shown("date")} required>
              <input
                id="co-date"
                type="date"
                min={toISODate(today)}
                value={details.date}
                onChange={(e) => updateDetails({ date: e.target.value })}
                onBlur={touch("date")}
              />
            </Field>
            <Field id="co-time" label={isEvent ? "Time food is needed" : "Time"} error={shown("time")} required>
              <input
                id="co-time"
                type="time"
                value={details.time}
                onChange={(e) => updateDetails({ time: e.target.value })}
                onBlur={touch("time")}
              />
            </Field>
          </div>
        </fieldset>

        {eventAvailable && (
        <div className={`event-box ${isEvent ? "event-box--on" : ""}`}>
          <label className="switch">
            <input type="checkbox" checked={isEvent} onChange={(e) => updateEvent({ enabled: e.target.checked })} />
            <span className="switch__track" aria-hidden="true" />
            <span className="switch__text">
              <span className="switch__title">
                <IconParty size={18} /> Ordering for an event?
              </span>
              <span className="switch__sub">For your Small Chops Packs — applies to the whole order</span>
            </span>
          </label>
          {isEvent && (
            <div className="event-box__fields">
              <EventFields variant="full" idPrefix="cevent" errors={{ eventGuests: shown("eventGuests") }} />
            </div>
          )}
        </div>
        )}

        <fieldset className="fsection">
          <legend className="sr-only">Notes</legend>
          <Field id="co-notes" label="Anything else we should know?" optional>
            <textarea
              id="co-notes"
              rows={3}
              maxLength={600}
              placeholder="Allergies, packaging, delivery instructions…"
              value={details.notes}
              onChange={(e) => updateDetails({ notes: e.target.value })}
            />
          </Field>
        </fieldset>

        <OrderTotals subtotal={priced.subtotal} fulfillment={details.fulfillment} />
        <PaymentNote />
      </div>

      <div className="opanel__foot">
        {submitted && errorCount > 0 && (
          <p ref={summaryRef} className="form-summary" role="alert">
            <IconAlert size={18} />
            {errorCount === 1 ? "Please fix the highlighted field." : `Please fix the ${errorCount} highlighted fields.`}
          </p>
        )}
        <button type="submit" className="btn btn--primary btn--block btn--lg">
          Review order
        </button>
      </div>
    </form>
  );
}
