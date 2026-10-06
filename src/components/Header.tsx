import { useEffect, useRef, useState } from "react";
import { site } from "../config/site";
import { usePricedCart } from "../hooks/useOrder";
import { paths } from "../lib/router";
import { buildWhatsAppUrl } from "../lib/whatsapp";
import { Brand } from "./Brand";
import { hasGallery } from "./Gallery";
import { IconBag, IconParty, IconWhatsApp } from "./Icons";
import { Link } from "./Link";

export function Header() {
  const { itemCount, quantityLabel } = usePricedCart();
  const [bump, setBump] = useState(false);
  const prevCount = useRef(itemCount);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (itemCount !== prevCount.current) {
      const grew = itemCount > prevCount.current;
      prevCount.current = itemCount;
      if (!grew) return;
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 450);
      return () => window.clearTimeout(t);
    }
  }, [itemCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <div className="container header__inner">
        <a href="#top" className="brand" aria-label={`${site.name} — home`}>
          <Brand />
        </a>

        <nav className="header__nav" aria-label="Main">
          <a href="#menu">Menu</a>
          <a href="#events">Events</a>
          <a href="#favorites">Favorites</a>
          <a href="#how">How it works</a>
          {hasGallery && <a href="#gallery">Gallery</a>}
          <a href="#contact">Contact</a>
        </nav>

        <div className="header__actions">
          {/* Phones and tablets have no nav bar, so Events gets its own shortcut. */}
          <a href="#events" className="header__events">
            <IconParty size={18} />
            <span>Events</span>
          </a>
          <a
            href={buildWhatsAppUrl(site.whatsappOrderNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn icon-btn--wa"
            aria-label="Chat with us on WhatsApp"
          >
            <IconWhatsApp size={22} />
          </a>
          <Link
            href={paths.order()}
            className={`cart-btn ${bump ? "is-bumping" : ""}`}
            aria-label={itemCount ? `View order, ${quantityLabel}` : "View order, empty"}
          >
            <IconBag size={22} />
            <span className="cart-btn__label">Order</span>
            {itemCount > 0 && (
              <span className="cart-btn__count" aria-hidden="true" key={itemCount}>
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
