import { site } from "../config/site";
import { updateDetails, updateEvent, useCheckout } from "../lib/checkout";
import { toISODate } from "../lib/format";
import type { CheckoutErrors } from "../lib/validation";
import { Field } from "./Field";

type Props = {
  /** "compact" (inside a product) shows only the essentials; the rest is asked at checkout. */
  variant: "compact" | "full";
  errors?: CheckoutErrors;
  idPrefix: string;
};

/**
 * Event / catering details. These live on the ORDER (one event per order),
 * so filling them in on a product carries through to checkout.
 * The event date & time are the order's date & time.
 */
export function EventFields({ variant, errors = {}, idPrefix }: Props) {
  const details = useCheckout();
  const ev = details.event;
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <div className="event-fields">
      <div className="form-grid">
        <Field id={id("guests")} label="Number of guests" error={errors.eventGuests} required>
          <input
            id={id("guests")}
            type="number"
            inputMode="numeric"
            min={1}
            max={10000}
            step={1}
            placeholder="e.g. 50"
            value={ev.guests}
            onChange={(e) => updateEvent({ guests: e.target.value })}
          />
        </Field>

        {variant === "full" && (
          <Field id={id("type")} label="Type of event" optional>
            <select id={id("type")} value={ev.type} onChange={(e) => updateEvent({ type: e.target.value })}>
              <option value="">Select…</option>
              {site.eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {variant === "compact" && (
        <div className="form-grid">
          <Field id={id("date")} label="Event date" optional>
            <input
              id={id("date")}
              type="date"
              min={toISODate(new Date())}
              value={details.date}
              onChange={(e) => updateDetails({ date: e.target.value })}
            />
          </Field>
          <Field id={id("time")} label="Time food is needed" optional>
            <input id={id("time")} type="time" value={details.time} onChange={(e) => updateDetails({ time: e.target.value })} />
          </Field>
        </div>
      )}

      {variant === "full" && (
        <>
          <Field id={id("name")} label="Event name" optional>
            <input
              id={id("name")}
              type="text"
              autoComplete="off"
              maxLength={80}
              placeholder="e.g. Ada's 30th birthday"
              value={ev.name}
              onChange={(e) => updateEvent({ name: e.target.value })}
            />
          </Field>
          <Field id={id("req")} label="Special requirements" optional>
            <textarea
              id={id("req")}
              rows={3}
              maxLength={400}
              placeholder="Serving time, packaging, dietary needs…"
              value={ev.requirements}
              onChange={(e) => updateEvent({ requirements: e.target.value })}
            />
          </Field>
        </>
      )}

      {variant === "compact" && <p className="hint">You'll add the venue and any other event details at checkout.</p>}
    </div>
  );
}
