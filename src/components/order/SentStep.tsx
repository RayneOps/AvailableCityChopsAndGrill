import { useEffect } from "react";
import { site } from "../../config/site";
import { cart } from "../../lib/cart";
import { draftRefStore, handoffStore, resetOrderSpecificDetails, useHandoff } from "../../lib/checkout";
import { copyText } from "../../lib/clipboard";
import { closeOverlays, navigate, paths } from "../../lib/router";
import { showToast } from "../../lib/toast";
import { Logo } from "../Brand";
import { IconCheck, IconCopy, IconWhatsApp } from "../Icons";

export function SentStep() {
  const handoff = useHandoff();

  useEffect(() => {
    if (!handoff) navigate(paths.order(), { replace: true });
  }, [handoff]);

  if (!handoff) return null;

  async function copy() {
    const ok = await copyText(handoff!.message);
    showToast(ok ? "Order copied — paste it into WhatsApp" : "Couldn't copy. Please select the text below.");
  }

  function startNew() {
    cart.clear();
    draftRefStore.set("");
    resetOrderSpecificDetails();
    handoffStore.set(null);
    closeOverlays();
  }

  return (
    <>
      <div className="opanel__body sent">
        <div className="sent__hero">
          <Logo size={88} className="sent__logo" />
          <span className="sent__badge" aria-hidden="true">
            <IconCheck size={34} />
          </span>
          <h3 className="sent__title">Order ready</h3>
          <p className="sent__text">
            Your order <strong>#{handoff.reference}</strong> for {site.name} has been prepared in WhatsApp.
            <br />
            <strong>Send the message to complete your order.</strong>
          </p>
        </div>

        {handoff.url && (
          <a href={handoff.url} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp btn--block btn--lg">
            <IconWhatsApp size={22} /> Open WhatsApp
          </a>
        )}

        <div className="sent__fallback">
          <p className="sent__q">Didn't open WhatsApp?</p>
          <button type="button" className="btn btn--secondary btn--block" onClick={copy}>
            <IconCopy size={18} /> Copy order message
          </button>
          <details className="sent__preview">
            <summary>View order message</summary>
            <pre tabIndex={0}>{handoff.message}</pre>
          </details>
        </div>

        <ol className="next-steps" aria-label="What happens next">
          <li>
            <span>
              <strong>Send</strong> the message in WhatsApp.
            </span>
          </li>
          <li>
            <span>
              We <strong>confirm</strong> your order and send payment details.
            </span>
          </li>
          <li>
            <span>
              You <strong>pay</strong>, and we get your order ready.
            </span>
          </li>
        </ol>
      </div>

      <div className="opanel__foot opanel__foot--split">
        <button type="button" className="btn btn--secondary" onClick={closeOverlays}>
          Back to menu
        </button>
        <button type="button" className="btn btn--primary" onClick={startNew}>
          New order
        </button>
      </div>
    </>
  );
}
