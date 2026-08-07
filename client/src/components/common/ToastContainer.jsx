import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.type === 'success' ? (
            <CheckCircle2 size={22} color="var(--accent-green)" />
          ) : (
            <AlertCircle size={22} color="var(--accent-red)" />
          )}
          <span style={{ fontSize: '0.95rem', flex: 1, fontWeight: 500 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem'
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
