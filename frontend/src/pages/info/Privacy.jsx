import React, { useState, useEffect } from 'react';
import usePageMeta from '../../hooks/usePageMeta';

function Privacy() {
  usePageMeta('Polityka prywatności', 'Polityka prywatności i wykorzystania plików cookie Urban Stitch.');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // Stany dla interaktywnych przełączników cookies (świetny element UX)
  const [cookiesAllowed, setCookiesAllowed] = useState({
    essential: true, // Zawsze wymagane
    recommendations: true,
    analytics: false
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCookie = (key) => {
    if (key === 'essential') return; // Niezbędnych nie można wyłączyć
    setCookiesAllowed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: '1000px', padding: '20px', boxSizing: 'border-box' }}>
        
        {/* NAGŁÓWEK */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={mainTitleStyle}>Polityka Prywatności & Cookies</h1>
          <div style={decorLineStyle}></div>
          <p style={subtitleStyle}>
            Bezpieczeństwo Twoich danych to nasz absolutny priorytet. Sklep <span style={{ color: '#00f2fe', fontWeight: '700' }}>STITCH</span> przetwarza dane w pełnej zgodności z przepisami RODO (GDPR).
          </p>
        </div>

        {/* GŁÓWNA KARTA INFORMACYJNA */}
        <div style={mainCardStyle}>
          <div style={shieldIconWrapperStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h3 style={cardTitleStyle}>Ochrona Danych Osobowych (RODO)</h3>
          <p style={cardTextStyle}>
            Ochrona danych osobowych naszych Klientów jest fundamentem działania naszej platformy. Wszystkie połączenia są szyfrowane protokołem SSL, a dane zbierane podczas rejestracji oraz zakupów służą wyłącznie poprawnej realizacji zamówień i nie są przekazywane podmiotom nieuprawnionym.
          </p>
        </div>

        {/* SEKSEJA INTERAKTOWNA: CENTRUM ZARZĄDZANIA COOKIES */}
        <h3 style={{ ...sectionTitleStyle, marginTop: '40px', textAlign: isMobile ? 'center' : 'left' }}>
          Pliki Cookies (Ciasteczka) & System MATCH
        </h3>
        <p style={{ ...subtitleStyle, margin: '0 0 25px 0', textAlign: isMobile ? 'center' : 'left' }}>
          Nasza aplikacja wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania oraz obsługi inteligentnych systemów rekomendacji.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '30px'
        }}>
          
          {/* COOKIE 1: NIEZBĘDNE */}
          <div style={cookieCardStyle}>
            <div style={cookieHeaderStyle}>
              <span style={cookieBadgeStyle}>Wymagane</span>
              <div style={toggleActiveStyle}></div>
            </div>
            <h4 style={cookieTitleStyle}>Niezbędne Ciasteczka</h4>
            <p style={cookieDescriptionStyle}>
              Umożliwiają prawidłowe działanie systemu koszyka, logowania oraz utrzymanie bezpiecznej sesji użytkownika.
            </p>
          </div>

          {/* COOKIE 2: SYSTEM MATCH (REKOMENDACJE) */}
          <div style={{ 
            ...cookieCardStyle, 
            borderColor: cookiesAllowed.recommendations ? 'rgba(0, 242, 254, 0.4)' : '#233554',
            boxShadow: cookiesAllowed.recommendations ? '0 0 15px rgba(0, 242, 254, 0.05)' : 'none'
          }}>
            <div style={cookieHeaderStyle}>
              <span style={{ ...cookieBadgeStyle, backgroundColor: 'rgba(79, 172, 254, 0.1)', color: '#4facfe' }}>AI MATCH System</span>
              <div 
                onClick={() => toggleCookie('recommendations')} 
                style={{ ...toggleBaseStyle, backgroundColor: cookiesAllowed.recommendations ? '#00f2fe' : '#233554' }}
              >
                <div style={{ ...toggleHandleStyle, left: cookiesAllowed.recommendations ? '18px' : '2px' }}></div>
              </div>
            </div>
            <h4 style={cookieTitleStyle}>Personalizacja i Rekomendacje</h4>
            <p style={cookieDescriptionStyle}>
              Obsługuje nasz autorski <strong>inteligentny algorytm rekomendacji towarów (system MATCH)</strong> oraz zapamiętuje produkty w zakładce "Ulubione".
            </p>
          </div>

          {/* COOKIE 3: ANALITYKA */}
          <div style={{ 
            ...cookieCardStyle, 
            borderColor: cookiesAllowed.analytics ? 'rgba(0, 242, 254, 0.4)' : '#233554',
            boxShadow: cookiesAllowed.analytics ? '0 0 15px rgba(0, 242, 254, 0.05)' : 'none'
          }}>
            <div style={cookieHeaderStyle}>
              <span style={{ ...cookieBadgeStyle, backgroundColor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>Analityka</span>
              <div 
                onClick={() => toggleCookie('analytics')} 
                style={{ ...toggleBaseStyle, backgroundColor: cookiesAllowed.analytics ? '#00f2fe' : '#233554' }}
              >
                <div style={{ ...toggleHandleStyle, left: cookiesAllowed.analytics ? '18px' : '2px' }}></div>
              </div>
            </div>
            <h4 style={cookieTitleStyle}>Statystyki Ruchu</h4>
            <p style={cookieDescriptionStyle}>
              Pomaga nam analizować zachowania użytkowników na stronie w celu optymalizacji wydajności interfejsu sklepu STITCH.
            </p>
          </div>

        </div>

        {/* PRZYPOMNIENIE O ZMIANIE W PRZEGLĄDARCE */}
        <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', lineHeight: '1.5', margin: 0 }}>
          Powyższe ustawienia mają charakter symulacyjny w celach optymalizacji interfejsu aplikacji. Możesz w każdej chwili całkowicie zablokować lub usunąć pliki cookies bezpośrednio w ustawieniach swojej przeglądarki internetowej.
        </p>

      </div>
    </div>
  );
}

// STYLIZACJA (Security / Privacy Tech Dark Theme)
const containerStyle = {
  minHeight: '85vh',
  backgroundColor: '#0a192f',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  padding: '40px 0'
};

const mainTitleStyle = {
  fontSize: '32px',
  fontWeight: '800',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  color: '#ffffff',
  margin: '0 0 10px 0'
};

const decorLineStyle = {
  width: '60px',
  height: '4px',
  background: 'linear-gradient(90deg, #00f2fe, #4facfe)',
  margin: '0 auto 20px auto',
  borderRadius: '2px'
};

const subtitleStyle = {
  fontSize: '15px',
  color: '#94a3b8',
  maxWidth: '650px',
  margin: '0 auto',
  lineHeight: '1.6'
};

const mainCardStyle = {
  backgroundColor: '#112240',
  border: '1px solid #233554',
  borderRadius: '16px',
  padding: '35px 25px',
  textAlign: 'center',
  boxSizing: 'border-box',
  marginBottom: '40px'
};

const shieldIconWrapperStyle = {
  width: '60px',
  height: '60px',
  backgroundColor: 'rgba(0, 242, 254, 0.08)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px auto'
};

const cardTitleStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 12px 0'
};

const cardTextStyle = {
  fontSize: '14px',
  color: '#a8b2d1',
  lineHeight: '1.7',
  margin: 0
};

const sectionTitleStyle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 8px 0',
  letterSpacing: '0.5px'
};

const cookieCardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid #233554',
  borderRadius: '14px',
  padding: '24px 20px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease'
};

const cookieHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const cookieBadgeStyle = {
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase',
  padding: '4px 10px',
  borderRadius: '20px',
  backgroundColor: 'rgba(0, 242, 254, 0.1)',
  color: '#00f2fe',
  letterSpacing: '0.5px'
};

const toggleActiveStyle = {
  width: '10px',
  height: '10px',
  backgroundColor: '#00f2fe',
  borderRadius: '50%',
  boxShadow: '0 0 8px #00f2fe'
};

const toggleBaseStyle = {
  width: '36px',
  height: '20px',
  borderRadius: '20px',
  position: 'relative',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

const toggleHandleStyle = {
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  backgroundColor: '#0a192f',
  position: 'absolute',
  top: '2px',
  transition: 'left 0.2s'
};

const cookieTitleStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 8px 0'
};

const cookieDescriptionStyle = {
  fontSize: '13px',
  color: '#8892b0',
  lineHeight: '1.5',
  margin: 0
};

export default Privacy;