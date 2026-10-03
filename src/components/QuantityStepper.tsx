import { MAX_QTY } from "../lib/cart";
import { IconMinus, IconPlus, IconTrash } from "./Icons";

type Props = {
  value: number;
  onChange: (next: number) => void;
  /** Item name, used in accessible labels ("Increase Tray Package"). */
  label: string;
  /** Lowest value the minus button can reach (it is disabled there). Ignored when `removeAt` is set. */
  min?: number;
  /**
   * At this value the minus button becomes a bin that removes the item
   * (1 unless the product sets `minQuantity`).
   */
  removeAt?: number;
  size?: "sm" | "md";
};

export function QuantityStepper({ value, onChange, label, min = 1, removeAt, size = "md" }: Props) {
  const willRemove = removeAt !== undefined && value <= removeAt;
  const minusDisabled = removeAt === undefined && value <= min;
  return (
    <div className={`stepper stepper--${size}`} role="group" aria-label={`Quantity for ${label}`}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(value - 1)}
        disabled={minusDisabled}
        aria-label={willRemove ? `Remove ${label}` : `Decrease ${label}`}
      >
        {willRemove ? <IconTrash size={16} /> : <IconMinus size={18} />}
      </button>
      <output className="stepper__value" key={value}>
        {value}
      </output>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label={`Increase ${label}`}
      >
        <IconPlus size={18} />
      </button>
    </div>
  );
}
