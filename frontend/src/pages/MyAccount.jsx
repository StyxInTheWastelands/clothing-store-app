import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { clearSession } from '../utils/auth';
import usePageMeta from '../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MyAccount() {
  usePageMeta('Moje konto', 'Zarządzaj danymi konta, zamówieniami i zwrotami w Urban Stitch.');
  const navigate = useNavigate();
  const { favorites, refreshFavorites } = useFavorites();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 620);

  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Użytkownik');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userName);

  // Dane profilu (email tylko do wyświetlenia, reszta — edytowalna i zapisywana w bazie)
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [favoriteSize, setFavoriteSize] = useState('');
  const [address, setAddress] = useState('');

  const [isDataOpen, setIsDataOpen] = useState(false);
  const [saveHint, setSaveHint] = useState('');
  const accordionContentRef = useRef(null);
  const [accordionHeight, setAccordionHeight] = useState(0);

  useEffect(() => {
    if (!accordionContentRef.current) return;
    setAccordionHeight(isDataOpen ? accordionContentRef.current.scrollHeight : 0);
  }, [isDataOpen, isMobile, phone, favoriteSize, address, email]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 620);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userResponse = await fetch(`${API_URL}/api/user/profile`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserName(userData.name);
          setNewName(userData.name);
          localStorage.setItem('userName', userData.name);
          setEmail(userData.email || '');
          setPhone(userData.phone || '');
          setFavoriteSize(userData.favorite_size || '');
          localStorage.setItem('favoriteSize', userData.favorite_size || '');
          setAddress(userData.address || '');
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveName = async () => {
    setUserName(newName);
    setIsEditingName(false);
    await saveProfile({ name: newName });
  };

  const handleSaveData = async () => {
    await saveProfile({ name: userName, phone, favorite_size: favoriteSize, address });
  };

  const saveProfile = async ({ name, phone: phoneVal, favorite_size, address: addressVal }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          name,
          phone: phoneVal ?? phone,
          favorite_size: favorite_size ?? favoriteSize,
          address: addressVal ?? address
        })
      });

      if (response.ok) {
        localStorage.setItem('userName', name);
        localStorage.setItem('favoriteSize', favorite_size ?? favoriteSize);
        setSaveHint('Zapisano ✓');
        setTimeout(() => setSaveHint(''), 2000);
      } else {
        console.error("Nie udało się zapisać danych na serwerze");
      }
    } catch (error) {
      console.error("Błąd sieci podczas zapisywania danych:", error);
    }
  };

  const handleLogout = () => {
    clearSession();
    refreshFavorites(); // bez tokena kontekst zwróci pustą listę
    navigate('/auth');
  };

  return (
    <div style={pageWrapStyle}>
      <div style={pageStyle(isMobile)}>

        {/* GÓRNY PASEK: WYLOGOWANIE */}
        <div style={topbarStyle}>
          <button onClick={handleLogout} style={logoutLinkStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Wyloguj się
          </button>
        </div>

        {/* HERO + TOŻSAMOŚĆ */}
        <div>
          <div style={heroStyle(isMobile)}>
            {/* Tu docelowo wstawisz zdjęcie fashion (np. z Pinteresta) przez backgroundImage */}
            <div style={avatarStyle(isMobile)}>{userName.charAt(0).toUpperCase()}</div>
          </div>

          <div style={identityStyle}>
            {isEditingName ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={nameInputStyle}
                  autoFocus
                />
                <button onClick={handleSaveName} style={btnSaveNameStyle}>Zapisz</button>
              </div>
            ) : (
              <div style={identityNameStyle}>
                {userName}
                <button onClick={() => setIsEditingName(true)} style={pencilBtnStyle} title="Edytuj imię">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                  </svg>
                </button>
              </div>
            )}
            <span style={statusStyle}>Aktywny członek STITCH</span>
          </div>
        </div>

        {/* SZYBKIE AKCJE */}
        <div>
          <div style={actionsGridStyle(isMobile)}>
            <button onClick={() => navigate('/cart')} style={actionBtnStyle}>
              <span style={actionIconStyle(false)}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 8H6" /></svg>
              </span>
              <span style={actionLabelStyle}>Koszyk</span>
            </button>
            <button onClick={() => navigate('/zakupy')} style={actionBtnStyle}>
              <span style={actionIconStyle(false)}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 4l-4 4-4-4" /><path d="M4 8l3-4h10l3 4" /><path d="M4 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8" /></svg>
              </span>
              <span style={actionLabelStyle}>Historia zakupów</span>
            </button>
            <button onClick={() => navigate('/zwroty-i-reklamacje')} style={actionBtnStyle}>
              <span style={actionIconStyle(false)}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
              </span>
              <span style={actionLabelStyle}>Zwroty</span>
            </button>
            <button onClick={() => setIsDataOpen((v) => !v)} style={actionBtnStyle}>
              <span style={actionIconStyle(isDataOpen)}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
              </span>
              <span style={{ ...actionLabelStyle, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                Twoje dane
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ transform: isDataOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
          </div>

          {/* AKORDEON: DANE OSOBOWE */}
          <div style={accordionOuterStyle(accordionHeight)}>
            <div ref={accordionContentRef} style={accordionContentStyle}>
                <span style={eyebrowStyle}>Twoje dane osobowe</span>
                <div style={fieldRowStyle(isMobile)}>
                  <div style={fieldStyle}>
                    <label style={fieldLabelStyle}>E-mail</label>
                    <input value={email} disabled style={{ ...fieldInputStyle, color: '#94a3b8', cursor: 'default' }} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={fieldLabelStyle}>Telefon</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+48 ___ ___ ___"
                      style={fieldInputStyle}
                    />
                  </div>
                  <div style={fieldStyle}>
                    <label style={fieldLabelStyle}>Rozmiar ulubiony</label>
                    <input
                      value={favoriteSize}
                      onChange={(e) => setFavoriteSize(e.target.value)}
                      placeholder="np. M"
                      style={fieldInputStyle}
                    />
                  </div>
                  <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                    <label style={fieldLabelStyle}>Adres dostawy</label>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ulica, numer, kod pocztowy, miasto"
                      style={fieldInputStyle}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <button onClick={handleSaveData} style={btnSaveDataStyle}>Zapisz dane</button>
                  <span style={{ fontSize: '12px', color: '#8592a6' }}>{saveHint}</span>
                </div>
            </div>
          </div>
        </div>

        {/* PROMOCJA MATCH */}
        <button onClick={() => navigate('/match')} style={promoStyle(isMobile)}>
          <div style={{ textAlign: 'left' }}>
            <b style={promoTitleStyle}>Masz 5 minut?</b>
            <span style={promoSubtitleStyle}>Skomponuj kompletną stylizację w konfiguratorze MATCH.</span>
          </div>
          <span style={promoBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9.9 15.5A2 2 0 0 0 8.5 14.1l-6.1-1.6a.5.5 0 0 1 0-1l6.1-1.6a2 2 0 0 0 1.4-1.4l1.6-6.1a.5.5 0 0 1 1 0l1.6 6.1a2 2 0 0 0 1.4 1.4l6.1 1.6a.5.5 0 0 1 0 1l-6.1 1.6a2 2 0 0 0-1.4 1.4l-1.6 6.1a.5.5 0 0 1-1 0Z" /></svg>
            Stwórz MATCH
          </span>
        </button>

        {/* SEKCJA ULUBIONYCH — bez zmian względem poprzedniego wyglądu */}
        <div style={favoritesSectionStyle}>
          <h4 style={sectionTitleStyle}>Ulubione produkty</h4>

          {favorites.length === 0 ? (
            <p style={emptyFavoritesTextStyle}>Twoja lista ulubionych produktów jest pusta.</p>
          ) : (
            <div style={gridStyle}>
              {favorites.slice(0, 4).map((product) => (
                <div key={product.id} style={favSquareStyle} onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.image} alt="Ulubiony" style={favImageStyle} />
                </div>
              ))}

              {favorites.length > 4 && (
                <div
                  style={seeMoreSquareStyle}
                  onClick={() => navigate('/favorites')}
                  title="Zobacz wszystkie ulubione"
                >
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4b5563' }}>→</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// STYLE
const pageWrapStyle = { minHeight: '100vh', width: '100%', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', boxSizing: 'border-box', fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif' };
const pageStyle = (isMobile) => ({ width: '100%', maxWidth: '760px', boxSizing: 'border-box', padding: isMobile ? '28px 18px 70px' : '44px 24px 90px', display: 'flex', flexDirection: 'column', gap: isMobile ? '36px' : '46px' });

const topbarStyle = { display: 'flex', justifyContent: 'flex-end' };
const logoutLinkStyle = { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: '700', color: '#8592a6', padding: '4px 2px' };

const heroStyle = (isMobile) => ({
  position: 'relative', height: isMobile ? '190px' : '240px', borderRadius: isMobile ? '14px' : '18px', overflow: 'hidden',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: `
    radial-gradient(circle at 20% 15%, rgba(255,255,255,.16), transparent 45%),
    radial-gradient(circle at 82% 70%, rgba(0,180,216,.35), transparent 50%),
    radial-gradient(circle at 60% 10%, rgba(255,180,120,.28), transparent 40%),
    linear-gradient(150deg, #0a192f 0%, #1b2f4d 45%, #33475e 100%)
  `
});
const avatarStyle = (isMobile) => ({
  position: 'relative', zIndex: 2, width: isMobile ? '74px' : '88px', height: isMobile ? '74px' : '88px', borderRadius: '50%',
  background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(6px)', border: '2.5px solid rgba(255,255,255,.85)',
  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: isMobile ? '26px' : '32px', fontWeight: '800', boxShadow: '0 10px 30px rgba(0,0,0,.25)'
});

const identityStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center', marginTop: '28px' };
const identityNameStyle = { fontSize: '21px', fontWeight: '800', letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '8px', color: '#0a192f' };
const pencilBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#8592a6', padding: '2px', display: 'flex' };
const statusStyle = { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#16a34a', fontWeight: '700' };
const nameInputStyle = { padding: '8px 12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' };
const btnSaveNameStyle = { backgroundColor: '#0a192f', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' };

const actionsGridStyle = (isMobile) => ({ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '6px' : '10px' });
const actionBtnStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px', background: 'none', border: 'none', cursor: 'pointer', padding: '16px 6px 14px', borderRadius: '14px', color: '#3c4a63' };
const actionIconStyle = (active) => ({ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? '#0a192f' : 'linear-gradient(155deg, #eef3f9, #e3ebf4)', color: active ? '#fff' : '#0a192f', transition: 'background 0.15s ease, color 0.15s ease' });
const actionLabelStyle = { fontSize: '12px', fontWeight: '700', letterSpacing: '0.01em', textAlign: 'center' };

const accordionOuterStyle = (height) => ({ maxHeight: `${height}px`, overflow: 'hidden', transition: 'max-height 0.28s ease' });
const accordionContentStyle = { paddingTop: '30px', borderTop: '1px solid #e9edf3', display: 'flex', flexDirection: 'column', gap: '22px' };
const eyebrowStyle = { fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8592a6' };
const fieldRowStyle = (isMobile) => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '18px' : '22px 26px' });
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '7px' };
const fieldLabelStyle = { fontSize: '11.5px', fontWeight: '700', color: '#8592a6' };
const fieldInputStyle = { font: 'inherit', fontSize: '14.5px', color: '#0a192f', background: 'transparent', border: 'none', borderBottom: '1.5px solid #e9edf3', padding: '6px 2px 9px', outline: 'none' };
const btnSaveDataStyle = { font: 'inherit', fontSize: '13px', fontWeight: '800', letterSpacing: '0.02em', background: '#0a192f', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: '100px', cursor: 'pointer' };

const promoStyle = (isMobile) => ({
  position: 'relative', borderRadius: isMobile ? '14px' : '18px', overflow: 'hidden', padding: isMobile ? '24px 22px' : '30px', color: '#fff',
  background: `
    radial-gradient(1px 1px at 12% 25%, #fff, transparent 60%),
    radial-gradient(1.5px 1.5px at 40% 65%, #fff, transparent 60%),
    radial-gradient(1px 1px at 68% 20%, #fff, transparent 60%),
    radial-gradient(1.5px 1.5px at 85% 55%, #fff, transparent 60%),
    radial-gradient(1px 1px at 90% 85%, #fff, transparent 60%),
    radial-gradient(1px 1px at 25% 85%, #fff, transparent 60%),
    linear-gradient(135deg, #1e1b4b, #311042)
  `,
  display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '20px',
  flexDirection: isMobile ? 'column' : 'row', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', boxSizing: 'border-box'
});
const promoTitleStyle = { display: 'block', fontSize: '17px', marginBottom: '4px' };
const promoSubtitleStyle = { fontSize: '13.5px', color: 'rgba(255,255,255,.75)' };
const promoBtnStyle = { background: '#fff', color: '#1e1b4b', border: 'none', padding: '12px 22px', borderRadius: '100px', fontWeight: '800', fontSize: '12.5px', letterSpacing: '0.03em', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '8px' };

const favoritesSectionStyle = { textAlign: 'left' };
const sectionTitleStyle = { margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };
const gridStyle = { display: 'flex', gap: '16px', flexWrap: 'wrap' };
const favSquareStyle = { width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: '#f8fafc' };
const favImageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const seeMoreSquareStyle = { width: '100px', height: '100px', borderRadius: '8px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #d1d5db' };
const emptyFavoritesTextStyle = { margin: 0, fontSize: '14px', color: '#64748b', fontStyle: 'italic' };

export default MyAccount;
