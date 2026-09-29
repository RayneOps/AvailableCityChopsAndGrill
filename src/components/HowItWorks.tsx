import { IconBag, IconList, IconWallet, IconWhatsApp } from "./Icons";

const STEPS = [
  { Icon: IconBag, title: "Choose", text: "Add small chops packs or trays to your order." },
  { Icon: IconList, title: "Add details", text: "Delivery or pickup, date and time." },
  { Icon: IconWhatsApp, title: "Send on WhatsApp", text: "Your order opens in WhatsApp — tap Send." },
  { Icon: IconWallet, title: "Confirm & pay", text: "We confirm and send payment details." },
];

export function HowItWorks() {
  return (
    <section id="how" className="how" aria-labelledby="how-title" data-reveal>
      <div className="container">
        <p className="eyebrow">How it works</p>
        <h2 id="how-title" className="section-title">
          Ordering takes a minute
        </h2>
        <ol className="how__steps">
          {STEPS.map(({ Icon, title, text }, i) => (
            <li key={title} className="how__step">
              <span className="how__icon" aria-hidden="true">
                <Icon size={22} />
                <span className="how__num">{i + 1}</span>
              </span>
              <span>
                <strong className="how__title">{title}</strong>
                <span className="how__text">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
