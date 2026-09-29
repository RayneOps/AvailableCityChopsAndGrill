import { useEffect, useMemo, useState } from "react";
import { site } from "../../config/site";
import { useCheckoutValidation, usePricedCart } from "../../hooks/useOrder";
import { draftRefStore, handoffStore, useDraftRef } from "../../lib/checkout";
import { copyText } from "../../lib/clipboard";
import { formatDate, formatNaira, formatQuantity, formatTime } from "../../lib/format";
import { buildOrder, generateOrderRef } from "../../lib/order";
import { navigate, paths } from "../../lib/router";
import { showToast } from "../../lib/toast";
import { buildOrderMessage, buildWhatsAppUrl, isWhatsAppConfigured } from "../../lib/whatsapp";
import { IconAlert, IconCopy, IconWhatsApp } from "../Icons";
import { Link } from "../Link";
import { EmptyOrder, OrderTotals, PaymentNote } from "./shared";

export function ReviewStep() {
  const priced = usePricedCart();
  const { details, valid } = useCheckoutValidation();
  const reference = useDraftRef();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!draftRefStore.get()) draftRefStore.set(generateOrderRef());
  }, []);

  const order = useMemo(
    () => (valid && priced.itemCount > 0 ? buildOrder(priced, details, reference || "—") : null),
    [valid, priced, details, reference],
  );
  const message = useMemo(() => (order ? buildOrderMessage(order) : ""), [order]);
  const configured = isWhatsAppConfigured(site.whatsappOrderNumber);
  const url = configured && message ? buildWhatsAppUrl(site.whatsappOrderNumber, message) : null;

  if (priced.itemCount === 0) return <EmptyOrder />;

  if (priced.hasProblems || !order) {
    return (
      <div className="opanel__body">
        <div className="empty empty--tall">
          <span className="empty__icon empty__icon--warn" aria-hidden="true">
            <IconAlert size={28} />
          </span>
          <p className="empty__title">A few details are missing</p>
          <p className="empty__text">
            {priced.hasProblems ? "Some items in your order need attention." : "Please complete your details to review your order."}
          </p>
          <Link
            href={priced.hasProblems ? paths.order() : paths.order("details")}
            replace
            className="btn btn--primary"
          >
            {priced.hasProblems ? "Go to your order" : "Complete your details"}
          </Link>
        </div>
      </div>
    );
  }

  function handoff(e: React.MouseEvent) {
    // Prevent accidental double taps from opening WhatsApp twice.
    if (sending) return e.preventDefault();
    setSending(true);
    handoffStore.set({ reference: order!.reference, message, url, createdAt: Date.now() });
    // Let the browser follow the link first, then show the "Order ready" screen behind it.
    window.setTimeout(() => navigate(paths.order("sent"), { replace: true }), 150);
  }

  async function copy() {
    const ok = await copyText(message);
    showToast(ok ? "Order copied — paste it into WhatsApp" : "Couldn't copy. Please select the text manually.");
  }

  const f = order.fulfillment;

  return (
    <>
      <div className="opanel__body">
        <p className="review__ref">
          Order ref <strong>#{order.reference}</strong>
          {order.event && <span className="review__event">Event order</span>}
        </p>

        <section className="rcard" aria-labelledby="rv-customer">
          <header className="rcard__head">
            <h3 id="rv-customer">Customer</h3>
            <Link href={paths.order("details")} className="link-btn link-btn--sm" aria-label="Edit customer details">
              Edit
            </Link>
          </header>
          <p>{order.customer.name}</p>
          <p className="muted">{order.customer.phone}</p>
        </section>

        <section className="rcard" aria-labelledby="rv-fulfil">
          <header className="rcard__head">
            <h3 id="rv-fulfil">{f.type === "delivery" ? "Delivery" : "Pickup"}</h3>
            <Link href={paths.order("details")} className="link-btn link-btn--sm" aria-label="Edit delivery details">
              Edit
            </Link>
          </header>
          {f.type === "delivery" ? (
            <>
              <p>{f.address}</p>
              <p className="muted">{f.area}</p>
              {f.directions && <p className="muted">{f.directions}</p>}
            </>
          ) : (
            <p className="muted">{site.contact.address || site.pickup.note}</p>
          )}
          <p className="rcard__when">
            {formatDate(f.date)} · {formatTime(f.time)}
          </p>
        </section>

        {order.event && (
          <section className="rcard" aria-labelledby="rv-event">
            <header className="rcard__head">
              <h3 id="rv-event">Event</h3>
              <Link href={paths.order("details")} className="link-btn link-btn--sm" aria-label="Edit event details">
                Edit
              </Link>
            </header>
            {order.event.name && <p>{order.event.name}</p>}
            <p className="muted">
              {[order.event.type, `${order.event.guests} guests`].filter(Boolean).join(" · ")}
            </p>
            {order.event.requirements && <p className="muted">{order.event.requirements}</p>}
          </section>
        )}

        <section className="rcard" aria-labelledby="rv-items">
          <header className="rcard__head">
            <h3 id="rv-items">Your order</h3>
            <Link href={paths.order()} className="link-btn link-btn--sm" aria-label="Edit order items">
              Edit
            </Link>
          </header>
          <ul className="rlist">
            {order.items.map((item, i) => (
              <li key={i} className="rlist__item">
                <span className="rlist__qty">{item.quantity}×</span>
                <span className="rlist__name">
                  {item.name}
                  <span className="rlist__opt">
                    {formatNaira(item.unitPrice)}
                    {item.unit ? `/${item.unit.one}` : " each"} × {formatQuantity(item.quantity, item.unit)}
                  </span>
                  {item.contents && item.contents.length > 0 && (
                    <span className="rlist__opt">{item.contents.join(" · ")}</span>
                  )}
                  {item.options.map((o) => (
                    <span key={o.name} className="rlist__opt">
                      {o.name}: {o.value}
                    </span>
                  ))}
                  {item.notes && <span className="rlist__opt">Note: {item.notes}</span>}
                </span>
                <span className="rlist__price">{formatNaira(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <OrderTotals subtotal={order.subtotal} fulfillment={f.type} />
          {order.confirmNotes?.map((n) => (
            <p key={n} className="rcard__note">
              {n}
            </p>
          ))}
        </section>

        {order.notes && (
          <section className="rcard" aria-labelledby="rv-notes">
            <header className="rcard__head">
              <h3 id="rv-notes">Note</h3>
            </header>
            <p className="prewrap">{order.notes}</p>
          </section>
        )}

        <PaymentNote />
      </div>

      <div className="opanel__foot">
        {url ? (
          <>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp btn--block btn--lg"
              onClick={handoff}
              aria-disabled={sending || undefined}
            >
              <IconWhatsApp size={22} />
              Place order on WhatsApp
            </a>
            <p className="foot-hint">WhatsApp will open with your order ready — just tap Send.</p>
          </>
        ) : (
          <>
            <p className="notice notice--warn" role="alert">
              <IconAlert size={18} />
              Ordering on WhatsApp isn't available right now. Copy your order and send it to us directly.
            </p>
            <button type="button" className="btn btn--secondary btn--block btn--lg" onClick={copy}>
              <IconCopy size={20} /> Copy order message
            </button>
          </>
        )}
      </div>
    </>
  );
}
