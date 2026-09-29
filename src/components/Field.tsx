import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
};

/** Label + control + hint/error, wired up with aria-invalid / aria-describedby. */
export function Field({ id, label, error, hint, required, optional, children, className = "" }: Props) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const control = Children.only(children);
  const enhanced = isValidElement(control)
    ? cloneElement(control as ReactElement<Record<string, unknown>>, {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })
    : control;

  return (
    <div className={`field ${error ? "field--error" : ""} ${className}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {optional && <span className="field__opt"> (optional)</span>}
      </label>
      {enhanced}
      {hint && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
