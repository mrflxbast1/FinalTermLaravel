import { useEffect, useId, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Delete',
    processing,
    onConfirm,
    onClose,
}) {
    const ref = useRef(null);
    const id = useId();

    useEffect(() => {
        const dialog = ref.current;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            className="confirm-dialog"
            aria-labelledby={id}
            aria-describedby={`${id}-description`}
            onClose={onClose}
            onCancel={(event) => {
                if (processing) event.preventDefault();
            }}
            onClick={(event) => {
                if (event.target === ref.current && !processing) onClose();
            }}
        >
            <div className="dialog-top">
                <span className="danger-icon">
                    <AlertTriangle size={23} />
                </span>
                <button
                    className="icon-button"
                    onClick={onClose}
                    disabled={processing}
                    aria-label="Close dialog"
                >
                    <X size={19} />
                </button>
            </div>
            <h2 id={id}>{title}</h2>
            <p id={`${id}-description`}>{description}</p>
            <div className="dialog-actions">
                <Button variant="secondary" onClick={onClose} disabled={processing} autoFocus>
                    Keep it
                </Button>
                <Button variant="danger" onClick={onConfirm} processing={processing}>
                    {confirmLabel}
                </Button>
            </div>
        </dialog>
    );
}
