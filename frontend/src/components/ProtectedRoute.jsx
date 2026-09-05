import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isSessionValid, clearSession } from '../utils/auth';
import { useToast } from '../context/ToastContext';

function ProtectedRoute({ children }) {
  const { showToast } = useToast();
  const valid = isSessionValid();

  useEffect(() => {
    if (!valid) {
      clearSession(); // na wypadek, gdyby token istniał, ale był przeterminowany
      showToast('Sesja wygasła lub nie jesteś zalogowany. Zaloguj się ponownie.', 'error');
    }
  }, [valid, showToast]);

  if (!valid) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default ProtectedRoute;
