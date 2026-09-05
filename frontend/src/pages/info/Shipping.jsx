import React, { useState, useEffect } from 'react';
import usePageMeta from '../../hooks/usePageMeta';

function Shipping() {
  usePageMeta('Wysyłka i dostawa', 'Informacje o czasie i kosztach dostawy w Urban Stitch.');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: '1000px', padding: isMobile ? '20px' : '40px 20px' }}>
        
        {/* NAGŁÓWEK */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={mainTitleStyle}>Wysyłka i Dostawa</h1>
          <div style={decorLineStyle}></div>
          <p style={subtitleStyle}>
            Wszystkie zamówienia w sklepie <span style={{ color: '#00f2fe', fontWeight: '700' }}>STITCH</span> realizujemy ekspresowo w ciągu 24-48 godzin.
          </p>
        </div>

        {/* SIATKA METOD DOSTAWY */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '25px',
          marginBottom: '50px'
        }}>
          
          {/* KAFELEK 1: INPOST */}
          <div style={cardStyle}>
            <div style={iconContainerStyle}>
              {/* Ikona Paczkomatu / Pudełka */}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 style={cardTitleStyle}>Paczkomaty InPost 24/7</h3>
            <p style={cardTextStyle}>Najwygodniejsza forma odbioru o dowolnej porze dnia i nocy.</p>
            <div style={priceBadgeStyle}>12.00 PLN</div>
            <div style={timeInfoStyle}>Dostawa: 1 dzień roboczy</div>
          </div>

          {/* KAFELEK 2: KURIER */}
          <div style={cardStyle}>
            <div style={iconContainerStyle}>
              {/* Ikona Samochodu / Dostawy */}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <h3 style={cardTitleStyle}>Kurier DPD / DHL</h3>
            <p style={cardTextStyle}>Dostawa bezpośrednio pod Twoje drzwi lub do rąk własnych.</p>
            <div style={priceBadgeStyle}>15.00 PLN</div>
            <div style={timeInfoStyle}>Dostawa: 1-2 dni robocze</div>
          </div>

          {/* KAFELEK 3: DARMOWA DOSTAWA */}
          <div style={{ ...cardStyle, borderColor: '#4facfe', boxShadow: '0 0 15px rgba(79, 172, 254, 0.2)' }}>
            <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(79, 172, 254, 0.1)' }}>
              {/* Ikona Prezentu / Bonus */}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4facfe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12"></polyline>
                <rect x="2" y="7" width="20" height="5"></rect>
                <line x1="12" y1="22" x2="12" y2="7"></line>
                <path d="M12 7a3.5 3.5 0 1 0-3.5-3.5c0 3.5 3.5 3.5 3.5 3.5z"></path>
                <path d="M12 7a3.5 3.5 0 1 1 3.5-3.5c0 3.5-3.5 3.5-3.5 3.5z"></path>
              </svg>
            </div>
            <h3 style={{ ...cardTitleStyle, color: '#4facfe' }}>Darmowa Dostawa</h3>
            <p style={cardTextStyle}>Automatyczny rabat na koszyk po przekroczeniu progu kwotowego.</p>
            <div style={{ ...priceBadgeStyle, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#0a192f' }}>0.00 PLN</div>
            <div style={timeInfoStyle}>Dla zamówień od 200 PLN</div>
          </div>

        </div>

        {/* DODATKOWA INFORMACJA NA DOLE */}
        <div style={infoBlockStyle}>
          <div style={{ marginRight: '15px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>
            <strong>Ważna informacja:</strong> Po nadaniu paczki automatycznie otrzymasz od nas wiadomość e-mail z linkiem do śledzenia przesyłki na stronie przewoźnika. Status możesz również monitorować w zakładce <em>Status Zamówienia</em>.
          </p>
        </div>

      </div>
    </div>
  );
}

// STYLIZACJA (Glow Tech Theme)
const containerStyle = {
  minHeight: '85vh',
  backgroundColor: '#0a192f',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
  fontFamily: 'system-ui, -apple-system, sans-serif'
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
  fontSize: '16px',
  color: '#94a3b8',
  maxWidth: '600px',
  margin: '0 auto',
  lineHeight: '1.6'
};

const cardStyle = {
  backgroundColor: '#112240', // Jaśniejszy granatowy tworzący głębię
  border: '1px solid #233554',
  borderRadius: '16px',
  padding: '30px 20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'transform 0.3s ease, border-color 0.3s ease',
  boxSizing: 'border-box'
};

const iconContainerStyle = {
  width: '60px',
  height: '60px',
  backgroundColor: 'rgba(0, 242, 254, 0.1)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px'
};

const cardTitleStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 12px 0'
};

const cardTextStyle = {
  fontSize: '14px',
  color: '#8892b0',
  lineHeight: '1.5',
  margin: '0 0 20px 0',
  minHeight: '42px' // Zapewnia równy układ przy różnej długości tekstu
};

const priceBadgeStyle = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#00f2fe',
  backgroundColor: 'rgba(0, 242, 254, 0.05)',
  padding: '8px 20px',
  borderRadius: '30px',
  marginBottom: '15px',
  letterSpacing: '0.5px'
};

const timeInfoStyle = {
  fontSize: '13px',
  color: '#64748b',
  fontWeight: '600'
};

const infoBlockStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(17, 34, 64, 0.5)',
  border: '1px dashed #233554',
  borderRadius: '12px',
  padding: '20px',
  boxSizing: 'border-box'
};

export default Shipping;