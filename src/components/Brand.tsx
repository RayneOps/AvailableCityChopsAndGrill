import { logo } from "virtual:site-assets";
import { site } from "../config/site";

/**
 * The logo from /public/images/brand/logo.png, shown at its own aspect ratio.
 * Only if that file is missing does the business name show as text instead
 * (split over two lines so it fits narrow phones).
 */
export function Brand({ variant = "header" }: { variant?: "header" | "footer" }) {
  return (
    <span className={`brand-mark brand-mark--${variant}`}>
      {logo ? (
        <img className="brand-mark__logo" src={logo} alt={site.name} decoding="async" />
      ) : (
        <span className="brand-mark__name">
          <span>Available City</span> <span>Chops and Grill</span>
        </span>
      )}
    </span>
  );
}

/** Large logo for hero / confirmation areas. Returns null if no logo has been added. */
export function Logo({ size, className = "" }: { size: number; className?: string }) {
  if (!logo) return null;
  return <img className={`logo ${className}`} src={logo} alt={`${site.name} logo`} width={size} height={size} decoding="async" />;
}
