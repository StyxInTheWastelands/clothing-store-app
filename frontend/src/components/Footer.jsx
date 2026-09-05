import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Footer() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/admin/check`, { headers: { Authorization: 'Bearer ' + token } })
      .then((res) => setIsAdmin(res.ok))
      .catch(() => setIsAdmin(false));
  }, []);

  return (
    <footer style={{
      // Głębokie indygo (kolor nocnego nieba) + efekt odległych gwiazd przez gradienty radialne
      background: `
        radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
        radial-gradient(1px 1px at 75px 120px, #fff, rgba(0,0,0,0)),
        radial-gradient(1.5px 1.5px at 150px 60px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
        radial-gradient(1px 1px at 250px 180px, #fff, rgba(0,0,0,0)),
        radial-gradient(1.5px 1.5px at 400px 90px, rgba(255,255,255,0.9), rgba(0,0,0,0)),
        radial-gradient(1px 1px at 580px 150px, #fff, rgba(0,0,0,0)),
        radial-gradient(2px 2px at 700px 50px, #fff, rgba(0,0,0,0)),
        radial-gradient(1px 1px at 850px 130px, #fff, rgba(0,0,0,0)),
        radial-gradient(1.5px 1.5px at 980px 70px, rgba(255,255,255,0.7), rgba(0,0,0,0)),
        linear-gradient(to bottom, #0B0F19, #05070B)
      `,
      backgroundSize: '1000px 250px, 1000px 250px, 1000px 250px, 100% 100%',
      color: '#E2E8F0',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      padding: '60px 40px 100px 40px', // Zwiększony odstęp od dołu, żeby NavigationIsland go nie zasłaniał
      borderTop: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        maxWidth: '1200px',
        margin: '0 auto',
        gap: '40px'
      }}>
        
        {/* Blok 1: O nas / Koncept */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <h3 style={{ color: '#FFF', fontSize: '18px', fontWeight: '800', letterSpacing: '3px', margin: '0 0 20px 0' }}>
            URBAN STITCH
          </h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.6', maxWidth: '300px' }}>
            Projekt dyplomowy nowoczesnego sklepu odzieżowego z inteligentnym systemem rekomendacji i analizą stylu.
          </p>
        </div>

        {/* Blok 2: Obsługa klienta */}
        <div style={{ flex: '1', minWidth: '160px' }}>
          <h4 style={{ color: '#FFF', fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 20px 0' }}>
            Pomoc & Kontakt
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/status-zamowienia" style={linkStyle}>Status zamówienia</Link></li>
            <li><Link to="/wysylka-i-dostawa" style={linkStyle}>Wysyłka i dostawa</Link></li>
            <li><Link to="/zwroty-i-reklamacje" style={linkStyle}>Zwroty i reklamacje</Link></li>
            <li><Link to="/kontakt" style={linkStyle}>Kontakt z Biurem Obsługi</Link></li>
          </ul>
        </div>

        {/* Blok 3: Regulacje i informacje prawne */}
        <div style={{ flex: '1', minWidth: '160px' }}>
          <h4 style={{ color: '#FFF', fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 20px 0' }}>
            Informacje prawne
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/regulamin" style={linkStyle}>Regulamin sklepu</Link></li>
            <li><Link to="/polityka-prywatnosci" style={linkStyle}>Polityka prywatności</Link></li>
            <li><Link to="/cookies" style={linkStyle}>Ustawienia cookies</Link></li>
            {isAdmin && <li><Link to="/admin" style={linkStyle}>Panel administratora</Link></li>}
          </ul>
        </div>

      </div>

      {/* Dolna linia */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto 0 auto',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: '20px',
        textAlign: 'center',
        fontSize: '11px',
        color: '#64748B',
        letterSpacing: '1px'
      }}>
        &copy; {new Date().getFullYear()} URBAN STITCH. Wszystkie prawa zastrzeżone. Projekt i implementacja w ramach pracy dyplomowej.
      </div>
    </footer>
  );
}

// Wspólny obiekt stylów dla wszystkich linków w stopce
const linkStyle = {
  color: '#94A3B8',
  textDecoration: 'none',
  transition: 'color 0.2s',
  cursor: 'pointer'
};

export default Footer;