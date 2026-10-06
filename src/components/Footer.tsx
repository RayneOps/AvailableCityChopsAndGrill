import { site } from "../config/site";
import { paths } from "../lib/router";
import { Brand } from "./Brand";
import { socialLinks } from "./Contact";
import { Link } from "./Link";

export function Footer() {
  const { contact } = site;
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Brand variant="footer" />
          <p>{site.tagline}</p>
          <ul className="footer__social" aria-label="Social media">
            {socialLinks().map(({ key, href, label, Icon }) => (
              <li key={key}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label={label}>
                  <Icon size={20} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="footer__col" aria-label="Footer">
          <p className="footer__h">Order</p>
          <a href="#menu">Menu</a>
          <a href="#events">Events</a>
          <a href="#favorites">Favorites</a>
          <Link href={paths.order()}>Your order</Link>
          <a href="#how">How it works</a>
        </nav>

        <address className="footer__col">
          <p className="footer__h">Contact</p>
          <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer">
            {contact.address}
          </a>
          <a href={`https://wa.me/${site.whatsappOrderNumber}`} target="_blank" rel="noopener noreferrer">
            WhatsApp: {site.whatsappDisplay}
          </a>
          {contact.phones.map((p) => (
            <a key={p.tel} href={`tel:${p.tel}`}>
              Call: {p.display}
            </a>
          ))}
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
        </address>

        <p className="footer__copy">
          © {new Date().getFullYear()} {site.name}. Orders are confirmed on WhatsApp, and payment details are shared after
          confirmation.
        </p>
      </div>
    </footer>
  );
}
