import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  open,
  title = 'Confirm action',
  message = 'Are you sure?',
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
  busy = false,
}) {
  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <button className="admin-icon-button admin-modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="admin-modal-icon">
          <AlertTriangle size={24} />
        </div>
        <h3 id="confirm-title">{title}</h3>
        <p>{message}</p>
        <div className="admin-modal-actions">
          <button className="admin-button admin-button-secondary" type="button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="admin-button admin-button-danger" type="button" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
