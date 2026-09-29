import { useToast } from "../lib/toast";
import { IconCheck } from "./Icons";

/** Visual toast + polite screen-reader announcement for cart changes. */
export function Toaster() {
  const toast = useToast();
  return (
    <>
      <div className="toast-region" aria-hidden="true">
        {toast && (
          <div key={toast.id} className="toast">
            <IconCheck size={18} />
            {toast.message}
          </div>
        )}
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {toast?.message ?? ""}
      </div>
    </>
  );
}
