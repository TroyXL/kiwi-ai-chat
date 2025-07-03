import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmButtonText?: string;
  // MODIFIED: Added prop for cancel button text
  cancelButtonText?: string;
  confirmButtonClass?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel', // MODIFIED: Default value
  confirmButtonClass = ''
}: ModalProps) => {
  if (!isOpen) return null;

  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>
            {cancelButtonText}
          </button>
          <button className={`modal-btn confirm ${confirmButtonClass}`} onClick={onConfirm}>
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};