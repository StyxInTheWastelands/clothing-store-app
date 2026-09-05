import React, { useState, useEffect } from 'react';
import usePageMeta from '../../hooks/usePageMeta';

function Contact() {
  usePageMeta('Kontakt', 'Skontaktuj się z Biurem Obsługi Klienta Urban Stitch.');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Symulacja wysyłania zapytania do API BOK (zaporzyczenie czasowe 1.5s)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: '1100px', padding: '20px', boxSizing: 'border-box' }}>
        
        {/* NAGŁÓWEK */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <h1 style={mainTitleStyle}>Kontakt z BOK</h1>
          <div style={decorLineStyle}></div>
          <p style={subtitleStyle}>
            Biuro Obsługi Klienta <span style={{ color: '#00f2fe', fontWeight: '700' }}>STITCH</span> jest do Twojej dyspozycji od poniedziałku do piątku w godzinach <span style={{ color: '#ffffff' }}>8:00 - 18:00</span>.
          </p>
        </div>

        {/* UKŁAD DWUKOLUMNOWY */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '40px',
          alignItems: 'stretch'
        }}>
          
          {/* LEWA KOLUMNA: DANE INFRASTRUKTURY */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* E-mail */}
            <div style={infoBoxStyle}>
              <div style={iconWrapperStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div>
                <span style={labelStyle}>Napisz do nas</span>
                <span style={valueStyle}>bok@stitch-shop.pl</span>
              </div>
            </div>

            {/* Telefon */}
            <div style={infoBoxStyle}>
              <div style={iconWrapperStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div>
                <span style={labelStyle}>Zadzwoń (Infolinia)</span>
                <span style={valueStyle}>+48 123 456 789</span>
              </div>
            </div>

            {/* Adres */}
            <div style={infoBoxStyle}>
              <div style={iconWrapperStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div>
                <span style={labelStyle}>Adres korespondencyjny</span>
                <span style={{...valueStyle, fontSize: '14px', lineHeight: '1.4'}}>STITCH S.A.<br/>ul. Wiejska 45, 00-001 Warszawa</span>
              </div>
            </div>

          </div>

          {/* PRAWA KOLUMNA: FORMULARZ KONTATKOWY */}
          <div style={{
            flex: '1.3',
            backgroundColor: '#112240',
            border: '1px solid #233554',
            borderRadius: '16px',
            padding: isMobile ? '25px 20px' : '35px',
            boxSizing: 'border-box'
          }}>
            
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeIn 0.4s ease' }}>
                <div style={successIconStyle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 style={{ color: '#ffffff', margin: '20px 0 10px 0', fontSize: '20px' }}>Wiadomość wysłana!</h3>
                <p style={{ color: '#8892b0', fontSize: '14px', margin: 0 }}>Odpowiemy na Twoje zapytanie najszybciej jak to możliwe.</p>
                <button onClick={() => setSubmitted(false)} style={returnButtonStyle}>Napisz kolejną wiadomość</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#ffffff', fontSize: '18px' }}>Wyślij formularz zgłoszeniowy</h3>
                
                <div>
                  <label style={formLabelStyle}>Imię i nazwisko</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="np. Jan Kowalski" 
                    required 
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={formLabelStyle}>Adres e-mail</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="np. jan.kowalski@gmail.com" 
                    required 
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={formLabelStyle}>Treść wiadomości</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="W czym możemy Ci pomóc? Opisz swoje zgłoszenie..." 
                    required 
                    rows="5"
                    style={{...inputStyle, resize: 'vertical', fontFamily: 'inherit'}}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    ...submitButtonStyle,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Wysyłanie zgłoszenia...' : 'Wyślij wiadomość'}
                </button>
              </form>
            )}

          </div>

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

const infoBoxStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '12px',
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  boxSizing: 'border-box'
};

const iconWrapperStyle = {
  width: '48px',
  height: '48px',
  backgroundColor: 'rgba(0, 242, 254, 0.08)',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: '#64748b',
  textTransform: 'uppercase',
  fontWeight: '600',
  letterSpacing: '0.5px'
};

const valueStyle = {
  display: 'block',
  fontSize: '16px',
  color: '#ffffff',
  fontWeight: '700',
  marginTop: '3px'
};

const formLabelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#a8b2d1',
  marginBottom: '8px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: '#0a192f',
  border: '1px solid #233554',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const submitButtonStyle = {
  background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
  color: '#0a192f',
  border: 'none',
  padding: '14px 20px',
  borderRadius: '6px',
  fontWeight: '700',
  fontSize: '15px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  transition: 'transform 0.2s ease, opacity 0.2s'
};

const successIconStyle = {
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  border: '2px solid #00f2fe',
  backgroundColor: 'rgba(0, 242, 254, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto'
};

const returnButtonStyle = {
  backgroundColor: 'transparent',
  border: '1px solid #233554',
  color: '#00f2fe',
  padding: '10px 20px',
  borderRadius: '6px',
  marginTop: '25px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600'
};

export default Contact;