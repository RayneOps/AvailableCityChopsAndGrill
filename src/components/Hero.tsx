import { logo } from "virtual:site-assets";
import { site } from "../config/site";
import { categories } from "../data/categories";
import { products } from "../data/products";
import { formatNaira } from "../lib/format";
import { Logo } from "./Brand";
import { IconArrow, IconCheck, IconWhatsApp } from "./Icons";

const PROMISES = ["No account needed", "Delivery or pickup", "Pay after we confirm"];

/** "Small Chops Packs — from ₦2,000", computed from the real menu. */
const fromPrices = categories
  .map((c) => {
    const prices = products.filter((p) => p.category === c.id).map((p) => p.price);
    return prices.length ? { id: c.id, name: c.name, from: Math.min(...prices) } : null;
  })
  .filter((x) => x !== null);

export function Hero() {
  const { subtext } = site.hero;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__copy">
          <div className="hero__brandrow">
            <Logo size={72} className="hero__logo-sm" />
            <p className="eyebrow eyebrow--pill">
              <IconWhatsApp size={16} /> Order on WhatsApp
            </p>
          </div>
          <h1 id="hero-title" className="hero__title">
            Available City <span className="hero__accent">Chops and Grill</span>
          </h1>
          <p className="hero__text">{subtext}</p>
          <div className="hero__ctas">
            <a href="#cat-packs" className="btn btn--primary btn--lg">
              Order now <IconArrow size={20} />
            </a>
            <a href="#menu" className="btn btn--ghost-light btn--lg">
              Explore menu
            </a>
          </div>
          <ul className="hero__from">
            {fromPrices.map((c) => (
              <li key={c.id}>
                <a href={`#cat-${c.id}`} className="hero__fromchip">
                  <span>{c.name}</span>
                  <strong>from {formatNaira(c.from)}</strong>
                </a>
              </li>
            ))}
            <li>
              <a href="#events" className="hero__fromchip hero__fromchip--event">
                <span>Events</span>
                <strong>Small Chops Packs</strong>
              </a>
            </li>
          </ul>
          <ul className="hero__promises">
            {PROMISES.map((p) => (
              <li key={p}>
                <IconCheck size={16} /> {p}
              </li>
            ))}
          </ul>
        </div>

        {logo && (
          <div className="hero__visual" aria-hidden="true">
            <div className="hero__orbit">
              <span className="hero__ring hero__ring--1" />
              <span className="hero__ring hero__ring--2" />
              <Logo size={340} className="hero__logo-lg" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
