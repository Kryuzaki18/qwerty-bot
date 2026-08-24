import { useEffect } from 'react';
import { Power } from 'lucide-react';
import { APP_NAME } from '../constants/app.constant';

interface ForceCloseDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ForceCloseDialog({ open, onCancel, onConfirm }: ForceCloseDialogProps): React.JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-500">
            <Power className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Force close {APP_NAME}?
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              This fully quits the app instead of minimizing it to the tray. Any automation currently in progress
              will be stopped.
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Force Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForceCloseDialog;
