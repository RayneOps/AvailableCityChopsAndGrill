import { logo } from "virtual:site-assets";
import { site } from "../config/site";

/**
 * Circular logo (from /public/images/logo) + the business name.
 * The name is split over two lines so it fits narrow phones.
 */
export function Brand({ variant = "header" }: { variant?: "header" | "footer" }) {
  return (
    <span className={`brand-mark brand-mark--${variant}`}>
      {logo && <img className="brand-mark__logo" src={logo} alt="" width={48} height={48} decoding="async" />}
      <span className="brand-mark__name">
        <span>Available City</span> <span>Chops and Grill</span>
      </span>
    </span>
  );
}

/** Large logo for hero / confirmation areas. Returns null until a logo is added. */
export function Logo({ size, className = "" }: { size: number; className?: string }) {
  if (!logo) return null;
  return <img className={`logo ${className}`} src={logo} alt={`${site.name} logo`} width={size} height={size} decoding="async" />;
}
