import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { navigate } from "../lib/router";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; replace?: boolean };

/** In-app link for hash routes: real <a href> (shareable, new-tab friendly) + history-aware navigation. */
export function Link({ href, replace, onClick, ...rest }: Props) {
  function handle(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href, { replace });
  }
  return <a href={href} onClick={handle} {...rest} />;
}
