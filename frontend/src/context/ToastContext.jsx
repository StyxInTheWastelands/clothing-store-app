import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

const TYPE_STYLE = {
  info: { background: '#0a192f', color: '#fff' },
  error: { background: '#e11d48', color: '#fff' },
  success: { background: '#16a34a', color: '#fff' }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'info') => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={stackStyle}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...toastStyle, ...(TYPE_STYLE[t.type] || TYPE_STYLE.info) }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast musi być używane wewnątrz ToastProvider');
  }
  return ctx;
}

const stackStyle = {
  position: 'fixed',
  bottom: '100px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  zIndex: 3000,
  pointerEvents: 'none',
  width: '100%',
  padding: '0 20px',
  boxSizing: 'border-box'
};

const toastStyle = {
  padding: '13px 22px',
  borderRadius: '100px',
  fontSize: '13px',
  fontWeight: '700',
  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
  maxWidth: '420px',
  textAlign: 'center'
};
