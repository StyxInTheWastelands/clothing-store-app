import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { nightSkyBackground, nightSkyBackgroundSize, nightSkyBackgroundRepeat } from '../styles/nightSkyBackground';
import { useToast } from '../context/ToastContext';
import usePageMeta from '../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Auth() {
  usePageMeta('Logowanie i rejestracja', 'Zaloguj się lub załóż konto Urban Stitch, aby robić zakupy i korzystać z rekomendacji stylu.');
  // Tryby formularza: 'login', 'register', 'forgot'
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();
  const { refreshFavorites } = useFavorites();
  const { showToast } = useToast();

  // Stan pól formularza
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (mode === 'login') {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          showToast(data.message || 'Błąd logowania', 'error');
          return;
        }

        // Zapisujemy token i imię użytkownika w przeglądarce
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        await refreshFavorites();

        navigate('/moje-konto');

      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          showToast('Hasła nie są identyczne!', 'error');
          return;
        }
        
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          showToast(data.message || 'Błąd rejestracji', 'error');
          return;
        }

        showToast('Rejestracja udana! Teraz możesz się zalogować.', 'success');
        setMode('login'); // Przełączamy ekran na logowanie
      }
    } catch (error) {
      console.error(error);
      showToast('Błąd połączenia z serwerem', 'error');
    }
  };
  

  return (
    <div style={containerStyle}>
      {/* Marketingowy baner zapraszający nad formularzem */}
      <div style={promoBannerStyle}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', letterSpacing: '1px' }}>
          ✨ Dołącz do klubu STITCH ✨
        </h2>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.9 }}>
          Zarejestruj się, aby odblokować pełen potencjał aplikacji! Skorzystaj z naszego 
          <strong> inteligentnego systemu rekomendacji</strong> oraz unikalnej funkcji 
          <strong> MATCH</strong>, która pomoże Ci idealnie dopasować górę, dół i dodatki.
        </p>
      </div>

      {/* Biała karta formularza */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>
          {mode === 'login' && 'ZALOGUJ SIĘ'}
          {mode === 'register' && 'ZAREJESTRUJ SIĘ'}
          {mode === 'forgot' && 'PRZYPOMNIJ HASŁO'}
        </h3>

        <form onSubmit={handleSubmit} style={formStyle}>
          {mode === 'register' && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Imię</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle} 
                placeholder="Twoje imię"
              />
            </div>
          )}

          <div style={inputGroupStyle}>
            <label style={labelStyle}>E-mail</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle} 
              placeholder="example@mail.com"
            />
          </div>

          {mode !== 'forgot' && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Hasło</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle} 
                placeholder="••••••••"
              />
            </div>
          )}

          {mode === 'register' && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Powtórz hasło</label>
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle} 
                placeholder="••••••••"
              />
            </div>
          )}

          {mode === 'login' && (
            <span 
              onClick={() => setMode('forgot')} 
              style={linkForgotPasswordStyle}
            >
              Nie pamiętasz hasła?
            </span>
          )}

          <button type="submit" style={buttonStyle}>
            {mode === 'login' && 'Zaloguj się'}
            {mode === 'register' && 'Zarejestruj się'}
            {mode === 'forgot' && 'Wyślij link'}
          </button>
        </form>

        {/* Przełączniki trybów na dole formularza */}
        <div style={footerLinksStyle}>
          {mode === 'login' && (
            <>
              <span>Nie masz konta? </span>
              <strong style={switchModeLinkStyle} onClick={() => setMode('register')}>
                Zarejestruj się
              </strong>
            </>
          )}
          {mode === 'register' && (
            <>
              <span>Masz już konto? </span>
              <strong style={switchModeLinkStyle} onClick={() => setMode('login')}>
                Zaloguj się
              </strong>
            </>
          )}
          {mode === 'forgot' && (
            <strong style={switchModeLinkStyle} onClick={() => setMode('login')}>
              Powrót do logowania
            </strong>
          )}
        </div>
      </div>
    </div>
  );
}

// STYLE (inline)
const containerStyle = {
  minHeight: 'calc(100vh - 90px)', // automatycznie zajmuje cały ekran, uwzględniając wysokość nagłówka (~90px)
  width: '100%',
  background: nightSkyBackground,
  backgroundSize: nightSkyBackgroundSize, backgroundRepeat: nightSkyBackgroundRepeat,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '40px 20px',
  boxSizing: 'border-box'
};

const promoBannerStyle = {
  maxWidth: '420px',
  color: '#ffffff',
  textAlign: 'center',
  marginBottom: '30px',
};

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '40px',
  borderRadius: '8px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  width: '100%',
  maxWidth: '420px',
  boxSizing: 'border-box'
};

const titleStyle = {
  margin: '0 0 25px 0',
  fontSize: '22px',
  fontWeight: '800',
  letterSpacing: '2px',
  textAlign: 'center',
  color: '#0a192f'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#4b5563',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const inputStyle = {
  padding: '12px 14px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  outline: 'none',
  boxSizing: 'border-box'
};

const linkForgotPasswordStyle = {
  alignSelf: 'flex-end',
  fontSize: '13px',
  color: '#4b5563',
  textDecoration: 'underline',
  cursor: 'pointer'
};

const buttonStyle = {
  backgroundColor: '#0a192f',
  color: '#ffffff',
  border: 'none',
  padding: '14px',
  fontSize: '14px',
  fontWeight: '700',
  borderRadius: '4px',
  cursor: 'pointer',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  marginTop: '10px'
};

const footerLinksStyle = {
  marginTop: '25px',
  textAlign: 'center',
  fontSize: '14px',
  color: '#4b5563'
};

const switchModeLinkStyle = {
  color: '#0a192f',
  textDecoration: 'underline',
  cursor: 'pointer',
  marginLeft: '4px'
};

export default Auth;