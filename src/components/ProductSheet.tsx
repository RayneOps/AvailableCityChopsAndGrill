import { useMemo, useRef, useState } from "react";
import { getCategory } from "../data/categories";
import { getProduct, minQuantityOf } from "../data/products";
import { cart, useCart } from "../lib/cart";
import { updateEvent, useCheckout } from "../lib/checkout";
import { formatDelta, formatNaira, formatQuantity } from "../lib/format";
import { defaultSelections, normalizeSelections, unitPrice, validateSelections } from "../lib/pricing";
import { closeOverlays, goBack, paths } from "../lib/router";
import { showToast } from "../lib/toast";
import type { Product, ProductOption, Selections } from "../types";
import { EventFields } from "./EventFields";
import { IconAlert, IconCheck, IconClose, IconParty } from "./Icons";
import { ProductImage } from "./ProductImage";
import { QuantityStepper } from "./QuantityStepper";

type Props = { productId: string; editLineId?: string };

/** Close the sheet: back to the cart when editing from it, otherwise back to the page. */
export function dismissProductSheet(editLineId?: string) {
  if (editLineId) goBack(paths.order());
  else closeOverlays();
}

export function ProductSheetContent({ productId, editLineId }: Props) {
  const product = getProduct(productId);
  const lines = useCart();
  const editing = editLineId ? lines.find((l) => l.lineId === editLineId && l.productId === productId) : undefined;

  if (!product) {
    return (
      <div className="psheet psheet--missing">
        <SheetClose onClick={closeOverlays} />
        <div className="empty">
          <p className="empty__title" id="psheet-title">
            This item isn't on the menu
          </p>
          <p className="empty__text">It may have been removed or renamed.</p>
          <button type="button" className="btn btn--primary" onClick={closeOverlays}>
            Browse the menu
          </button>
        </div>
      </div>
    );
  }

  // Keyed so switching products (or edit target) resets the form state.
  return <ProductForm key={`${product.id}:${editing?.lineId ?? "new"}`} product={product} editing={editing} />;
}

function SheetClose({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="icon-btn sheet-close" onClick={onClick} aria-label="Close">
      <IconClose />
    </button>
  );
}

function ProductForm({ product, editing }: { product: Product; editing?: ReturnType<typeof useCart>[number] }) {
  const [selections, setSelections] = useState<Selections>(() =>
    editing ? normalizeSelections(product, { ...defaultSelections(product), ...editing.selections }) : defaultSelections(product),
  );
  const min = minQuantityOf(product);
  const [quantity, setQuantity] = useState(Math.max(min, editing?.quantity ?? min));
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const details = useCheckout();
  const formRef = useRef<HTMLFormElement>(null);

  const errors = useMemo(() => validateSelections(product, selections), [product, selections]);
  const price = unitPrice(product, selections);
  const total = price * quantity;

  function toggle(option: ProductOption, choiceId: string, checked: boolean) {
    setSelections((prev) => {
      const current = prev[option.id] ?? [];
      const next =
        option.type === "single" ? [choiceId] : checked ? [...current, choiceId] : current.filter((c) => c !== choiceId);
      return normalizeSelections(product, { ...prev, [option.id]: next });
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      const firstId = Object.keys(errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[data-option="${firstId}"] input`)?.focus();
      return;
    }
    setSubmitting(true);
    if (editing) {
      cart.update(editing.lineId, { selections, quantity, notes });
      showToast(`Updated ${product.name}`);
    } else {
      cart.add({ productId: product.id, selections, quantity, notes });
      showToast(`Added ${formatQuantity(quantity, product.unit)} of ${product.name}`);
    }
    dismissProductSheet(editing?.lineId);
  }

  const allowNotes = product.allowNotes !== false;
  const category = getCategory(product.category);

  return (
    <form className="psheet" onSubmit={submit} ref={formRef} noValidate>
      <div className="psheet__scroll">
        <div className="psheet__media">
          <ProductImage product={product} eager sizes="(min-width: 768px) 560px, 100vw" />
          <SheetClose onClick={() => dismissProductSheet(editing?.lineId)} />
        </div>

        <div className="psheet__intro">
          {product.badge && <span className="tag">{product.badge}</span>}
          <p className="psheet__cat">{category?.name}</p>
          <h2 id="psheet-title" className="psheet__title">
            {product.name}
          </h2>
          <p className="psheet__price">
            {formatNaira(product.price)}
            {product.unit && <span className="psheet__per"> per {product.unit.one}</span>}
          </p>
        </div>

        {product.contents && product.contents.length > 0 && (
          <div className="psheet__section">
            <h3 className="psheet__h">What's inside</h3>
            <ul className="contents-list">
              {product.contents.map((c, i) => (
                <li key={c} style={{ "--i": i } as React.CSSProperties}>
                  <IconCheck size={16} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {min > 1 && (
          <p className="notice notice--info">
            <IconAlert size={18} />
            Minimum order: {formatQuantity(min, product.unit)}.
          </p>
        )}
        {category?.notes && min === 1 && (
          <ul className="notice notice--info notice--list">
            {category.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}

        {!product.available && (
          <p className="notice notice--warn" role="status">
            This item is currently unavailable.
          </p>
        )}

        {product.options?.map((option) => {
          const picked = selections[option.id] ?? [];
          const error = showErrors ? errors[option.id] : undefined;
          const errId = `opt-${option.id}-error`;
          return (
            <fieldset
              key={option.id}
              className={`optgroup ${error ? "optgroup--error" : ""}`}
              data-option={option.id}
              aria-describedby={error ? errId : undefined}
            >
              <legend className="optgroup__legend">
                <span>{option.name}</span>
                <span className="optgroup__rule">
                  {option.type === "single" && option.required
                    ? "Required"
                    : option.max
                      ? `Optional · up to ${option.max}`
                      : "Optional"}
                </span>
              </legend>
              <div className="optgroup__choices">
                {option.choices.map((choice) => {
                  const unavailable = choice.available === false;
                  const checked = picked.includes(choice.id);
                  const maxed = option.type === "multiple" && option.max !== undefined && picked.length >= option.max && !checked;
                  return (
                    <label key={choice.id} className={`choice ${unavailable ? "choice--disabled" : ""}`}>
                      <input
                        type={option.type === "single" ? "radio" : "checkbox"}
                        name={`${product.id}-${option.id}`}
                        value={choice.id}
                        checked={checked}
                        disabled={unavailable || maxed}
                        onChange={(e) => toggle(option, choice.id, e.target.checked)}
                      />
                      <span className="choice__mark" aria-hidden="true" />
                      <span className="choice__name">
                        {choice.name}
                        {unavailable && <span className="choice__na"> — unavailable</span>}
                      </span>
                      {choice.priceDelta ? <span className="choice__price">{formatDelta(choice.priceDelta)}</span> : null}
                    </label>
                  );
                })}
              </div>
              {error && (
                <p id={errId} className="field__error">
                  {error}
                </p>
              )}
            </fieldset>
          );
        })}

        {allowNotes && (
          <div className="optgroup">
            <label htmlFor="item-notes" className="optgroup__legend">
              <span>Special instructions</span>
              <span className="optgroup__rule">Optional</span>
            </label>
            <textarea
              id="item-notes"
              rows={2}
              maxLength={200}
              placeholder="e.g. Packaging or serving preferences"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        {product.supportsEventOrder && (
          <div className={`event-box ${details.event.enabled ? "event-box--on" : ""}`}>
            <label className="switch">
              <input
                type="checkbox"
                checked={details.event.enabled}
                onChange={(e) => updateEvent({ enabled: e.target.checked })}
              />
              <span className="switch__track" aria-hidden="true" />
              <span className="switch__text">
                <span className="switch__title">
                  <IconParty size={18} /> Ordering for an event?
                </span>
                <span className="switch__sub">Add your event details — they apply to the whole order</span>
              </span>
            </label>
            {details.event.enabled && (
              <div className="event-box__fields">
                <EventFields variant="compact" idPrefix="pevent" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="psheet__bar">
        {product.available ? (
          <>
            <QuantityStepper
              value={quantity}
              min={min}
              label={product.name}
              onChange={(q) => setQuantity(Math.max(min, q))}
            />
            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              <span className="nowrap">
                {editing ? (
                  "Update item"
                ) : (
                  <>
                    Add<span className="hide-xs"> to order</span>
                  </>
                )}
              </span>
              <span className="btn__price">{formatNaira(total)}</span>
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--secondary btn--block" onClick={closeOverlays}>
            Browse other items
          </button>
        )}
      </div>
    </form>
  );
}

