import { productImages } from "virtual:site-assets";
import { EVENT_MIN_PACKS, isEventEligible, products } from "../data/products";
import { updateEvent } from "../lib/checkout";
import { formatNaira, formatQuantity } from "../lib/format";
import { navigate, paths } from "../lib/router";
import { IconArrow, IconCheck, IconParty } from "./Icons";
import { ProductImage } from "./ProductImage";

/** Event orders are Small Chops Packs only — this list is derived, never hand-picked. */
const eventPacks = products.filter((p) => isEventEligible(p) && p.available);

const EVENT_PHOTO = "packs/pack.jpg";

const OCCASIONS = ["Birthday", "Wedding", "Party", "Celebration", "Gathering", "Corporate event"];

/** Turn on event ordering, then open the pack: quantity starts at the event minimum. */
function orderForEvent(productId: string) {
  updateEvent({ enabled: true });
  navigate(paths.item(productId));
}

export function Events() {
  if (eventPacks.length === 0) return null;
  // The shared pack photo (many packs laid out for an event), else any pack photo.
  const photo = productImages.includes(EVENT_PHOTO)
    ? { src: `/images/products/${EVENT_PHOTO}` }
    : eventPacks.find((p) => p.image)?.image;

  return (
    <section id="events" className="events" aria-labelledby="events-title">
      <div className="events__glow" aria-hidden="true" />
      <div className="container">
        <div className={`events__intro ${photo ? "events__intro--photo" : ""}`} data-reveal>
          <div className="events__copy">
            <p className="eyebrow events__eyebrow">
              <IconParty size={16} /> Events
            </p>
            <h2 id="events-title" className="events__title">
              Planning an <span>Event?</span>
            </h2>
            <p className="events__text">
              Make your celebration easier with our Small Chops Packs, prepared for events and gatherings.
            </p>

            <p className="events__for">Choose from our Small Chops Packs for your next:</p>
            <ul className="events__occasions">
              {OCCASIONS.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>

            <div className="events__rule">
              <p className="events__rule-line">
                <span>Event orders</span>
                <IconArrow size={18} />
                <strong>Small Chops Packs</strong>
              </p>
              <p className="events__rule-note">
                Minimum order: {EVENT_MIN_PACKS} packs. For the Tray packages are regular menu orders.
              </p>
            </div>

            <div className="events__ctas">
              <a href="#event-packs" className="btn btn--primary btn--lg">
                Explore Event Packs <IconArrow size={20} />
              </a>
            </div>
          </div>

          {photo && (
            <figure className="events__visual">
              <img src={photo.src} alt="Small Chops Packs prepared for an event" loading="lazy" decoding="async" />
              <figcaption className="events__badge">
                <strong>{EVENT_MIN_PACKS}</strong>
                <span>
                  pack minimum
                  <br />
                  for events
                </span>
              </figcaption>
            </figure>
          )}
        </div>

        <div id="event-packs" className="events__packs" data-reveal>
          <div className="events__packs-head">
            <h3 className="events__h3">Event Small Chops Packs</h3>
            <p className="events__sub">Prices are per pack. Event orders start at {EVENT_MIN_PACKS} packs.</p>
          </div>
          <ul className="epacks">
            {eventPacks.map((p, i) => (
              <li key={p.id} className="epack" style={{ "--i": i } as React.CSSProperties}>
                <div className="epack__media">
                  <ProductImage product={p} sizes="(min-width: 1024px) 25vw, 70vw" />
                  <span className="epack__tag">
                    <IconCheck size={14} /> Event eligible
                  </span>
                </div>
                <div className="epack__body">
                  <h4 className="epack__title">{p.shortName ?? p.name}</h4>
                  <p className="epack__price">
                    {formatNaira(p.price)}
                    <span>/pack</span>
                  </p>
                  {p.contents && (
                    <ul className="epack__contents" aria-label="Contents">
                      {p.contents.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  )}
                  <p className="epack__min">
                    <strong>Minimum order: {formatQuantity(EVENT_MIN_PACKS, p.unit)}</strong>
                    <span>
                      {formatNaira(p.price)} × {EVENT_MIN_PACKS} = {formatNaira(p.price * EVENT_MIN_PACKS)}
                    </span>
                  </p>
                  <button
                    type="button"
                    className="btn btn--primary btn--block epack__cta"
                    onClick={() => orderForEvent(p.id)}
                    aria-label={`Order ${p.name} for an event`}
                  >
                    <IconParty size={18} /> Order for Event
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
