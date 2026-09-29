import type { ReactNode } from "react";
import { site } from "../config/site";
import { buildWhatsAppUrl } from "../lib/whatsapp";
import { IconClock, IconInstagram, IconMail, IconPhone, IconPin, IconSnapchat, IconTikTok, IconWhatsApp } from "./Icons";

type Item = { key: string; icon: ReactNode; label: string; value: string; href?: string; external?: boolean; accent?: string };

export type SocialLink = { key: string; label: string; href: string; Icon: typeof IconWhatsApp };

/** WhatsApp + the supplied social profiles (only those configured). */
export function socialLinks(): SocialLink[] {
  const { social } = site;
  const links: SocialLink[] = [{ key: "wa", label: "WhatsApp", href: buildWhatsAppUrl(site.whatsappOrderNumber), Icon: IconWhatsApp }];
  if (social.instagram) links.push({ key: "ig", label: "Instagram", href: social.instagram, Icon: IconInstagram });
  if (social.tiktok) links.push({ key: "tt", label: "TikTok", href: social.tiktok, Icon: IconTikTok });
  if (social.snapchat) links.push({ key: "sc", label: "Snapchat", href: social.snapchat, Icon: IconSnapchat });
  return links;
}

function contactItems(): Item[] {
  const { contact } = site;
  const items: Item[] = [
    {
      key: "wa",
      icon: <IconWhatsApp />,
      label: "WhatsApp orders",
      value: site.whatsappDisplay,
      href: buildWhatsAppUrl(site.whatsappOrderNumber),
      external: true,
      accent: "wa",
    },
  ];
  contact.phones.forEach((p, i) =>
    items.push({ key: `ph${i}`, icon: <IconPhone />, label: "Call us", value: p.display, href: `tel:${p.tel}` }),
  );
  if (contact.email) items.push({ key: "em", icon: <IconMail />, label: "Email", value: contact.email, href: `mailto:${contact.email}` });
  if (contact.address) {
    items.push({ key: "ad", icon: <IconPin />, label: "Address", value: contact.address, href: contact.mapsUrl, external: true });
  }
  if (contact.hours) items.push({ key: "hr", icon: <IconClock />, label: "Hours", value: contact.hours });
  return items;
}

export function Contact() {
  const items = contactItems();
  const socials = socialLinks().filter((s) => s.key !== "wa");
  return (
    <section id="contact" className="contact" aria-labelledby="contact-title" data-reveal>
      <div className="container">
        <p className="eyebrow">Contact</p>
        <h2 id="contact-title" className="section-title">
          Talk to us
        </h2>
        <ul className="contact__list">
          {items.map((it) => {
            const inner = (
              <>
                <span className={`contact__icon ${it.accent ? `contact__icon--${it.accent}` : ""}`} aria-hidden="true">
                  {it.icon}
                </span>
                <span className="contact__text">
                  <span className="contact__label">{it.label}</span>
                  <span className="contact__value">{it.value}</span>
                </span>
              </>
            );
            return (
              <li key={it.key}>
                {it.href ? (
                  <a className="contact__card" href={it.href} {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {inner}
                  </a>
                ) : (
                  <div className="contact__card">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>

        {socials.length > 0 && (
          <div className="contact__social">
            <p className="contact__follow">Follow us</p>
            <ul className="social-row">
              {socials.map(({ key, label, href, Icon }) => (
                <li key={key}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={`social-btn social-btn--${key}`}>
                    <Icon size={20} />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
