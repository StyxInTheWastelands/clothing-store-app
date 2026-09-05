import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { isSessionValid } from '../utils/auth';

function Header() {
  const { favoritesCount } = useFavorites();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeGender, setActiveGender] = useState('Kobieta');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const navigate = useNavigate();

  const categories = {
    Kobieta: [
      'Nowości',
      'Koszulki',
      'Spodnie',
      'Spodenki i spódnice',
      'Bluzy i swetry',
      'Kurtki',
      'Akcesoria',
      'Wyprzedaż'
    ],
    Mężczyzna: [
      'Nowości',
      'Koszulki',
      'Spodnie',
      'Spodenki',
      'Bluzy i swetry',
      'Kurtki',
      'Akcesoria',
      'Wyprzedaż'
    ]
  };

  // Śledzimy zmianę rozmiaru ekranu dla dynamicznej responsywności
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openMenu = (gender) => {
    setActiveGender(gender);
    setIsMenuOpen(true);
  };

  const handleAccountClick = () => {
    setIsMenuOpen(false); // na wypadek menu mobilnego
    if (isSessionValid()) {
      navigate('/moje-konto'); // zalogowany z ważną sesją — od razu do konta
    } else {
      navigate('/auth'); // niezalogowany lub sesja wygasła — do formularza logowania
    }
  };

  const handleCategoryClick = (category) => {
    setIsMenuOpen(false); // zamykamy menu po kliknięciu
    
    if (category === 'Nowości') {
      if (activeGender === 'Kobieta') {
        navigate('/women-nowosci');
      } else if (activeGender === 'Mężczyzna') {
        navigate('/men-nowosci'); 
      }
    } 
    else if (category === 'Koszulki') {
      if (activeGender === 'Kobieta') {
        navigate('/women-koszulki');
      } else if (activeGender === 'Mężczyzna') {
        navigate('/men-koszulki');
      }
    }
    else if (category === 'Spodnie') {
      if (activeGender === 'Kobieta') {
        navigate('/women-spodnie');
      } else if (activeGender === 'Mężczyzna') {
        navigate('/men-spodnie');
      }
    }
    else if (category === 'Spodenki i spódnice') {
      if (activeGender === 'Kobieta') {
        navigate('/women-spodenki-spodnice');
      }
    }
    else if (category === 'Spodenki') {
      if (activeGender === 'Mężczyzna') {
        navigate('/men-spodenki');
      }
    }
    else if (category === 'Bluzy i swetry') {
      if (activeGender === 'Kobieta') {
        navigate('/women-bluzy-swetry');
      } else if (activeGender === 'Mężczyzna') {
        navigate('/men-bluzy-swetry');
      }
    }
    else if (category === 'Kurtki') {
      if (activeGender === 'Kobieta') {
        navigate('/women-kurtki');
      } else if (activeGender === 'Mężczyzna') {
        navigate('/men-kurtki');
      } 
    }
    else if (category === 'Akcesoria') {
      if (activeGender === 'Kobieta') {
        navigate('/women-akcesoria');
      } else if (activeGender === 'Mężczyzna') {
        navigate('/men-akcesoria');
      }
    }
    else if (category === 'Wyprzedaż') {
      if (activeGender === 'Kobieta') {
        navigate('/women-wyprzedaz');
      } else if (activeGender === 'Mężczyzna') {
        navigate('/men-wyprzedaz');
      }
    }
  };

  return (
    <>
      {/* Główny pasek nawigacji */}
      <header style={{
        padding: isMobile ? '15px 20px' : '25px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        zIndex: 900
      }}>
        
        {/* Mobilny przycisk hamburger (po lewej, tylko na mobile) */}
        {isMobile && (
          <button 
            onClick={() => setIsMenuOpen(true)} 
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: 0 }}
          >
            ☰
          </button>
        )}

        {/* Logo marki */}
        <h1 
          onClick={() => navigate('/')} 
          style={{ 
            fontSize: isMobile ? '22px' : '28px', 
            letterSpacing: isMobile ? '3px' : '5px', 
            margin: 0, 
            fontWeight: '800', 
            cursor: 'pointer' 
          }}
        >
          STITCH
        </h1>
        
        {/* Kontener nawigacji */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '20px' : '45px' }}>
          
          {/* Desktopowe przyciski wyboru płci (ukryte na mobile) */}
          {!isMobile && (
            <>
              <span className="nav-link" style={desktopNavLinkStyle} onClick={() => openMenu('Kobieta')}>KOBIETA</span>
              <span className="nav-link" style={desktopNavLinkStyle} onClick={() => openMenu('Mężczyzna')}>MĘŻCZYZNA</span>
            </>
          )}
          
          {/* Ulubione */}
          <div 
            className="nav-link" 
            onClick={() => navigate('/favorites')} 
            style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            {!isMobile && <span style={{ fontSize: '13px', fontWeight: '600' }}>ULUBIONE</span>}
            <span style={{ fontSize: isMobile ? '22px' : '18px' }}>♡</span>
            {favoritesCount > 0 && <span style={badgeStyle}>{favoritesCount}</span>}
          </div>

          {/* Koszyk */}
          <div
            className="nav-link"
            onClick={() => { setIsMenuOpen(false); navigate('/cart'); }}
            style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            {!isMobile && <span style={{ fontSize: '13px', fontWeight: '600' }}>KOSZYK</span>}
            <span style={{ fontSize: isMobile ? '20px' : '18px' }}>🛒</span>
            {cartCount > 0 && <span style={badgeStyle}>{cartCount}</span>}
          </div>

          {/* Przycisk profilu klienta */}
          {!isMobile && (
            <button 
              onClick={handleAccountClick} 
              style={desktopAccountButtonStyle}
            >
              MOJE KONTO
            </button>
          )}

        </div>
      </header>

      {/* Boczne responsywne wysuwane menu */}
      <div style={{
        position: 'fixed',
        top: 0,
        width: isMobile ? '85%' : '400px',
        height: '100vh',
        backgroundColor: '#ffffff',
        boxShadow: '-5px 0 25px rgba(0,0,0,0.15)',
        zIndex: 2000,
        transition: 'left 0.3s ease-in-out',
        padding: '30px 25px',
        boxSizing: 'border-box',
        left: isMenuOpen ? '0' : '-100%'
      }}>
        <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '26px', cursor: 'pointer', float: 'right' }}>✕</button>
        
        {/* Zakładki płci na mobile */}
        {isMobile ? (
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            <span 
              onClick={() => setActiveGender('Kobieta')} 
              style={{ ...mobileGenderTabStyle, borderBottom: activeGender === 'Kobieta' ? '2px solid #0a192f' : '2px solid transparent', fontWeight: activeGender === 'Kobieta' ? '800' : '500' }}
            >
              KOBIETA
            </span>
            <span 
              onClick={() => setActiveGender('Mężczyzna')} 
              style={{ ...mobileGenderTabStyle, borderBottom: activeGender === 'Mężczyzna' ? '2px solid #0a192f' : '2px solid transparent', fontWeight: activeGender === 'Mężczyzna' ? '800' : '500' }}
            >
              MĘŻCZYZNA
            </span>
          </div>
        ) : (
          <h2 style={{ marginTop: '5px', fontSize: '22px', letterSpacing: '2px', borderBottom: '2px solid #000', paddingBottom: '15px', fontWeight: '700' }}>
            {activeGender.toUpperCase()}
          </h2>
        )}

        {/* Lista kategorii */}
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', lineHeight: '2.8', fontSize: '16px', letterSpacing: '0.5px' }}>
          {categories[activeGender]?.map((cat, index) => (
            <li
              key={index}
              style={{
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
                fontWeight: cat === 'Wyprzedaż' ? '800' : '500',
                color: cat === 'Wyprzedaż' ? '#dc2626' : '#374151'
              }}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>

        {/* Duży mobilny przycisk profilu */}
        {isMobile && (
          <button 
            onClick={handleAccountClick}
            style={{
              backgroundColor: '#0a192f',
              color: '#ffffff',
              border: 'none',
              width: '100%',
              padding: '14px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '1px',
              cursor: 'pointer',
              marginTop: '40px'
            }}
          >
            MOJE KONTO
          </button>
        )}
      </div>

      {/* Przyciemnione tło pod menu */}
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1900 }} />}
    </>
  );
}

// STYLE POMOCNICZE
const badgeStyle = {
  position: 'absolute',
  top: '-5px',
  right: '-10px',
  backgroundColor: '#000',
  color: '#fff',
  borderRadius: '50%',
  width: '15px',
  height: '15px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '9px',
  fontWeight: 'bold'
};

const desktopNavLinkStyle = {
  fontSize: '13px',
  fontWeight: '700',
  letterSpacing: '1.5px',
  cursor: 'pointer'
};

const desktopAccountButtonStyle = {
  backgroundColor: '#0a192f',
  color: '#ffffff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: '700',
  letterSpacing: '1px',
  cursor: 'pointer'
};

const mobileGenderTabStyle = {
  fontSize: '16px',
  letterSpacing: '1px',
  cursor: 'pointer',
  paddingBottom: '8px'
};

export default Header;