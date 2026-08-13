import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '460px',
        width: 'calc(100vw - 3rem)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isInfo = toast.type === 'info';

        const borderColor = isSuccess ? '#10b981' : isInfo ? '#0284c7' : '#ef4444';
        const iconColor = isSuccess ? '#34d399' : isInfo ? '#38bdf8' : '#f87171';
        const badgeBg = isSuccess ? 'rgba(16, 185, 129, 0.25)' : isInfo ? 'rgba(2, 132, 199, 0.25)' : 'rgba(239, 68, 68, 0.25)';

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              border: `2px solid ${borderColor}`,
              borderRadius: '16px',
              padding: '1rem 1.15rem',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.75), 0 4px 15px rgba(15, 23, 42, 0.9)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: badgeBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '0.05rem'
              }}
            >
              {isSuccess ? (
                <CheckCircle2 size={22} color={iconColor} />
              ) : isInfo ? (
                <Info size={22} color={iconColor} />
              ) : (
                <AlertCircle size={22} color={iconColor} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.45 }}>
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
