import React, { useState, useEffect } from 'react';
import usePageMeta from '../../hooks/usePageMeta';

function ShopTerms() {
  usePageMeta('Regulamin sklepu', 'Regulamin sklepu internetowego Urban Stitch.');
  const [activeTab, setActiveTab] = useState('§1');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dane regulaminu podzielone na logiczne sekcje
  const sections = {
    '§1': {
      title: '§1 Postanowienia ogólne',
      content: 'Sklep internetowy działający pod adresem STITCH prowadzony jest przez firmę STITCH S.A. z siedzibą w Warszawie. Korzystanie ze sklepu oraz rejestracja konta wymaga pełnej akceptacji postanowień niniejszego regulaminu. Sprzedaż odbywa się za pośrednictwem sieci Internet pomiędzy składającym zamówienie a sklepem.'
    },
    '§2': {
      title: '§2 Warunki zawierania umowy',
      content: 'Wszystkie ceny podane w sklepie internetowym STITCH są cenami brutto (zawierają podatek VAT) wyrażonymi w złotych polskich (PLN). Zamówienia można składać przez 24 godziny na dobę, 7 dni w tygodniu. Zawarcie umowy kupna-sprzedaży następuje w momencie potwierdzenia przyjęcia zamówienia do realizacji przez Sklep.'
    },
    '§3': {
      title: '§3 Płatności i dostawa',
      content: 'Klient ma do wyboru różnorodne metody płatności: przelew elektroniczny, płatność kartą lub BLIK. Szczegółowe koszty oraz metody dostawy (Kurier, Paczkomaty) określone są w dedykowanej zakładce "Wysyłka i Dostawa". Towar wysyłany jest po zaksięgowaniu środków.'
    },
    '§4': {
      title: '§4 Ochrona prywatności',
      content: 'Administratorem danych osobowych jest STITCH S.A. Dane osobowe są przetwarzane wyłącznie w celu realizacji zamówień oraz usług świadczonych drogą elektroniczną. Klient ma pełne prawo dostępu do swoich danych, ich poprawiania, a także żądania ich całkowitego usunięcia z systemu.'
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: '1100px', padding: '20px', boxSizing: 'border-box' }}>
        
        {/* NAGŁÓWEK */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <h1 style={mainTitleStyle}>Regulamin Sklepu</h1>
          <div style={decorLineStyle}></div>
          <p style={subtitleStyle}>
            Niniejszy regulamin określa zasady korzystania ze sklepu internetowego <span style={{ color: '#00f2fe', fontWeight: '700' }}>STITCH</span>, składania zamówień oraz prawa i obowiązki stron.
          </p>
        </div>

        {/* UKŁAD Z DOKUMENTACJĄ BOCZNĄ */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '30px',
          alignItems: 'stretch'
        }}>
          
          {/* MENU NAWIGACYJNE PO LEWEJ STRONIE */}
          <div style={{
            flex: isMobile ? 'none' : '1',
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            gap: '10px',
            overflowX: isMobile ? 'auto' : 'visible',
            paddingBottom: isMobile ? '15px' : '0',
            whiteSpace: isMobile ? 'nowrap' : 'normal',
            borderRight: isMobile ? 'none' : '1px solid #233554',
            paddingRight: isMobile ? '0' : '20px'
          }}>
            {Object.keys(sections).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  ...tabButtonStyle,
                  backgroundColor: activeTab === key ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                  color: activeTab === key ? '#00f2fe' : '#8892b0',
                  borderColor: activeTab === key ? '#00f2fe' : 'transparent',
                  borderLeftWidth: isMobile ? '0' : '3px',
                  borderBottomWidth: isMobile ? '3px' : '0',
                  borderStyle: 'solid'
                }}
              >
                {sections[key].title.split(' ')[0] + ' ' + sections[key].title.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* TREŚĆ PARAGRAFU PO PRAWEJ STRONIE */}
          <div style={{
            flex: '2.5',
            backgroundColor: '#112240',
            border: '1px solid #233554',
            borderRadius: '16px',
            padding: isMobile ? '25px 20px' : '40px',
            boxSizing: 'border-box',
            minHeight: '250px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease'
          }}>
            <h3 style={sectionTitleStyle}>{sections[activeTab].title}</h3>
            <p style={sectionContentStyle}>{sections[activeTab].content}</p>
            
            {/* Dodatkowy techniczny akcent */}
            <div style={footerNoteStyle}>
              Ostatnia aktualizacja: 2026 r. • System STITCH Security Protected
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// STYLIZACJA (Documentation / Tech Layout)
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

const tabButtonStyle = {
  padding: '14px 20px',
  fontSize: '14px',
  fontWeight: '600',
  textAlign: 'left',
  cursor: 'pointer',
  borderRadius: '6px',
  outline: 'none',
  transition: 'all 0.2s ease',
  display: 'block',
  width: '100%',
  boxSizing: 'border-box'
};

const sectionTitleStyle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 20px 0',
  letterSpacing: '0.5px'
};

const sectionContentStyle = {
  fontSize: '15px',
  color: '#a8b2d1',
  lineHeight: '1.7',
  margin: 0
};

const footerNoteStyle = {
  marginTop: '30px',
  paddingTop: '15px',
  borderTop: '1px solid #233554',
  fontSize: '12px',
  color: '#64748b',
  fontWeight: '500'
};

export default ShopTerms;