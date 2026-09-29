import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  /** "bottom": bottom sheet on phones, centred dialog on larger screens. "side": full-height sheet / right drawer. */
  variant?: "bottom" | "side";
  labelledBy: string;
  children: ReactNode;
  className?: string;
};

const CLOSE_MS = 280;
let openCount = 0;

function lockScroll(lock: boolean) {
  openCount = Math.max(0, openCount + (lock ? 1 : -1));
  document.documentElement.classList.toggle("scroll-locked", openCount > 0);
}

/**
 * Accessible modal built on native <dialog>: focus is trapped, Esc closes,
 * background is inert. Content is kept during the closing animation.
 */
export function Sheet({ open, onClose, variant = "bottom", labelledBy, children, className = "" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const lastChildren = useRef(children);
  if (open) lastChildren.current = children;

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
        lockScroll(true);
      }
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const t = window.setTimeout(() => {
      if (dialog.open) {
        dialog.close();
        lockScroll(false);
      }
      setMounted(false);
    }, CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [open, mounted]);

  // Safety: release scroll lock if unmounted while open.
  useEffect(
    () => () => {
      if (ref.current?.open) lockScroll(false);
    },
    [],
  );

  if (!mounted) return null;

  return (
    <dialog
      ref={ref}
      className={`sheet sheet--${variant} ${className}`}
      data-state={visible ? "open" : "closed"}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet__panel">{open ? children : lastChildren.current}</div>
    </dialog>
  );
}
