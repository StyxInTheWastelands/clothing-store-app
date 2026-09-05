import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'cookieConsent';

function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={wrapStyle}>
      <p style={textStyle}>
        Ta strona używa plików cookie niezbędnych do jej działania (logowanie, koszyk). Więcej informacji w{' '}
        <Link to="/polityka-prywatnosci" style={linkStyle}>polityce prywatności</Link>.
      </p>
      <button onClick={accept} style={btnStyle}>Rozumiem</button>
    </div>
  );
}

const wrapStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 2000,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  padding: '16px 24px',
  background: '#0a192f',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif'
};
const textStyle = { margin: 0, fontSize: '13px', color: '#cbd5e1', maxWidth: '640px', lineHeight: '1.5' };
const linkStyle = { color: '#fff', textDecoration: 'underline' };
const btnStyle = { flex: 'none', background: '#fff', color: '#0a192f', border: 'none', padding: '10px 22px', borderRadius: '100px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer' };

export default CookieBanner;
