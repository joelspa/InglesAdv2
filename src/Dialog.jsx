import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Dialog({ children, onClose, label, className = '' }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.showModal();
    return () => {
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  function keepFocus(event) {
    if (event.key !== 'Tab') return;
    const controls = [...ref.current.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select,textarea,summary,[tabindex="0"]')].filter(element => element.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first) { event.preventDefault(); ref.current.focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return (
    <dialog className={`dialog ${className}`} ref={ref} tabIndex="-1" aria-label={label} onKeyDown={keepFocus}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === ref.current) onClose(); }}>
      <div className="dialog-body">
        <button type="button" className="icon-button dialog-close" onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
        {children}
      </div>
    </dialog>
  );
}
