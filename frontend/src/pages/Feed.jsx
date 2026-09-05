import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import usePageMeta from '../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const BATCH_SIZE = 10;
const PREFETCH_THRESHOLD = 3;
const SWIPE_THRESHOLD = 90;
const TAP_THRESHOLD = 6;
const MILESTONE_STEP = 10;

function XCircleIcon() {
  return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>);
}
function HeartIcon() {
  return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7.5-4.6-10-9.3C.5 8 2 4.5 5.5 4c2-.3 3.7.7 4.5 2.2C10.8 4.7 12.5 3.7 14.5 4 18 4.5 19.5 8 20 11.7 17.5 16.4 12 21 12 21z" /></svg>);
}
function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.8h7.6a2 2 0 0 0 2-1.6L21 8H6" />
      <circle cx="10" cy="21" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="21" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

const FeedCard = forwardRef(function FeedCard({ product, isTop, offset, onResolve, onTap }, ref) {
  const cardRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, curX: 0, curY: 0 });

  const flyOff = useCallback((direction) => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform .3s ease-out, opacity .3s ease-out';
    if (direction === 'cart') {
      card.style.transform = 'scale(0.85)';
      card.style.opacity = '0';
    } else {
      const curY = dragState.current.curY || 0;
      const flyX = direction === 'like' ? 900 : -900;
      card.style.transform = `translate(${flyX}px, ${curY}px) rotate(${direction === 'like' ? 28 : -28}deg)`;
    }
    setTimeout(() => onResolve(direction), 260);
  }, [onResolve]);

  useImperativeHandle(ref, () => ({ resolve: flyOff }), [flyOff]);

  useEffect(() => {
    if (!isTop) return;
    const card = cardRef.current;
    if (!card) return;
    const state = dragState.current;

    function onPointerDown(e) {
      state.dragging = true;
      state.startX = e.clientX;
      state.startY = e.clientY;
      state.curX = 0;
      state.curY = 0;
      try { card.setPointerCapture(e.pointerId); } catch (err) { /* brak aktywnego wskaźnika — bez wpływu na przeciąganie */ }
      card.style.transition = 'none';
    }
    function onPointerMove(e) {
      if (!state.dragging) return;
      state.curX = e.clientX - state.startX;
      state.curY = e.clientY - state.startY;
      card.style.transform = `translate(${state.curX}px, ${state.curY}px) rotate(${state.curX / 14}deg)`;
      const noBadge = card.querySelector('[data-badge="no"]');
      const yesBadge = card.querySelector('[data-badge="yes"]');
      if (noBadge) noBadge.style.opacity = state.curX < -20 ? Math.min(Math.abs(state.curX) / SWIPE_THRESHOLD, 1) : 0;
      if (yesBadge) yesBadge.style.opacity = state.curX > 20 ? Math.min(state.curX / SWIPE_THRESHOLD, 1) : 0;
    }
    function onPointerUp() {
      if (!state.dragging) return;
      state.dragging = false;
      card.style.transition = 'transform .3s';
      const dist = Math.hypot(state.curX, state.curY);
      if (dist < TAP_THRESHOLD) {
        card.style.transform = 'translate(0,0) rotate(0)';
        onTap();
        return;
      }
      if (Math.abs(state.curX) > SWIPE_THRESHOLD) {
        flyOff(state.curX > 0 ? 'like' : 'dislike');
      } else {
        card.style.transform = 'translate(0,0) rotate(0)';
      }
    }
    card.addEventListener('pointerdown', onPointerDown);
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerup', onPointerUp);
    card.addEventListener('pointercancel', onPointerUp);
    return () => {
      card.removeEventListener('pointerdown', onPointerDown);
      card.removeEventListener('pointermove', onPointerMove);
      card.removeEventListener('pointerup', onPointerUp);
      card.removeEventListener('pointercancel', onPointerUp);
    };
  }, [isTop, flyOff, onTap]);

  const price = parseFloat(product.price) || 0;

  return (
    <div ref={cardRef} style={cardStyle(offset, isTop)}>
      {isTop && (
        <>
          <span data-badge="no" style={{ ...feedBadgeStyle, ...feedBadgeNoStyle }}>Nie</span>
          <span data-badge="yes" style={{ ...feedBadgeStyle, ...feedBadgeYesStyle }}>Lubię</span>
        </>
      )}
      <img src={product.image} alt={product.name} style={cardImgStyle} draggable={false} />
      <div style={cardInfoStyle}>
        {product.style && <span style={cardStyleBadgeStyle}>{product.style}</span>}
        <span style={cardNameStyle}>{product.name}</span>
        <span style={cardPriceStyle}>{price.toFixed(2)} PLN</span>
      </div>
    </div>
  );
});

function MilestoneModal({ count, items, onContinue, onGoToFavorites }) {
  return (
    <div style={modalBackdropStyle} onClick={onContinue}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        <p style={modalTitleStyle}>Uzbierało się już {count} polubionych rzeczy!</p>
        <p style={modalSubtitleStyle}>Może czas je przejrzeć i dodać coś do koszyka?</p>
        <div style={modalGridStyle}>
          {items.slice(-8).reverse().map((p) => (
            <img key={p.id} src={p.image} alt={p.name} style={modalThumbStyle} />
          ))}
        </div>
        <div style={modalBtnRowStyle}>
          <button onClick={onContinue} style={modalSecondaryBtnStyle}>Kontynuuj przeglądanie</button>
          <button onClick={onGoToFavorites} style={modalPrimaryBtnStyle}>Przejdź do ulubionych</button>
        </div>
      </div>
    </div>
  );
}

function Feed() {
  usePageMeta('Feed stylu', 'Przesuwaj produkty i buduj swój profil stylu — im więcej polubień, tym trafniejsze rekomendacje.');
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState('');
  const [likedInSession, setLikedInSession] = useState([]);
  const [showMilestone, setShowMilestone] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 860);

  const seenIdsRef = useRef(new Set());
  const fetchingRef = useRef(false);
  const exhaustedRef = useRef(false);
  const topCardRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 860);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchBatch = useCallback(async () => {
    if (fetchingRef.current || exhaustedRef.current) return;
    fetchingRef.current = true;
    try {
      const token = localStorage.getItem('token');
      const url = new URL(API_URL + '/api/feed');
      url.searchParams.set('limit', BATCH_SIZE);
      if (seenIdsRef.current.size > 0) url.searchParams.set('excludeIds', Array.from(seenIdsRef.current).join(','));
      const res = await fetch(url, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
      if (res.ok) {
        const data = await res.json();
        if (data.items.length === 0) exhaustedRef.current = true;
        data.items.forEach((item) => seenIdsRef.current.add(item.id));
        setQueue((prev) => [...prev, ...data.items]);
      }
    } catch (err) {
      console.error('Błąd ładowania Feed:', err);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchBatch().then(() => setLoading(false));
  }, [fetchBatch]);

  useEffect(() => {
    if (queue.length <= PREFETCH_THRESHOLD) fetchBatch();
  }, [queue.length, fetchBatch]);

  useEffect(() => {
    const n = likedInSession.length;
    if (n > 0 && n % MILESTONE_STEP === 0) setShowMilestone(true);
  }, [likedInSession]);

  const current = queue[0] || null;

  const handleResolve = useCallback((direction) => {
    if (!current) return;
    if (direction === 'like') {
      if (!isFavorite(current.id)) toggleFavorite(current);
      setLikedInSession((prev) => [...prev, current]);
      setHint('Dodano do ulubionych');
    } else if (direction === 'cart') {
      addToCart(current, { size: (current.sizes && current.sizes[0]) || '' });
      setHint('Dodano do koszyka');
    } else {
      setHint('Pominięto');
    }
    setQueue((prev) => prev.slice(1));
    setTimeout(() => setHint(''), 1200);
  }, [current, isFavorite, toggleFavorite, addToCart]);

  const handleButton = (direction) => {
    if (!current) return;
    topCardRef.current?.resolve(direction);
  };

  if (loading) {
    return (
      <div style={pageWrapStyle}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Dobieramy propozycje…</p>
      </div>
    );
  }

  return (
    <div style={pageWrapStyle}>
      <span style={feedLabelStyle}>Twoja strefa stylu</span>

      <div style={stageWrapStyle}>
        {queue.length === 0 ? (
          <div style={emptyStateStyle}>
            <p style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600' }}>To już wszystkie propozycje na teraz.</p>
            <Link to="/" style={emptyStateBtnStyle}>Przejdź do sklepu</Link>
          </div>
        ) : (
          queue.slice(0, 3).map((p, i) => (
            <FeedCard
              key={p.id}
              ref={i === 0 ? topCardRef : null}
              product={p}
              isTop={i === 0}
              offset={i}
              onResolve={handleResolve}
              onTap={() => navigate(`/product/${p.id}`)}
            />
          ))
        )}

        {queue.length > 0 && (
          <>
            <button onClick={() => handleButton('dislike')} aria-label="Nie podoba się" style={sideBtnStyle('left', '#e11d48', isMobile)}><XCircleIcon /></button>
            <button onClick={() => handleButton('like')} aria-label="Dodaj do ulubionych" style={sideBtnStyle('right', '#16a34a', isMobile)}><HeartIcon /></button>
            <button onClick={() => handleButton('cart')} aria-label="Dodaj do koszyka" style={cartBtnStyle}><CartIcon /></button>
          </>
        )}
      </div>

      <p style={hintStyle}>{hint || 'Przeciągnij kartę w bok albo użyj przycisków'}</p>

      {showMilestone && (
        <MilestoneModal
          count={likedInSession.length}
          items={likedInSession}
          onContinue={() => setShowMilestone(false)}
          onGoToFavorites={() => navigate('/favorites')}
        />
      )}
    </div>
  );
}

// STYLE
const pageWrapStyle = {
  minHeight: '100vh',
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 18px 190px',
  fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  background: `
    radial-gradient(1px 1px at 10% 12%, #fff, rgba(0,0,0,0)),
    radial-gradient(1.5px 1.5px at 22% 30%, rgba(255,255,255,0.85), rgba(0,0,0,0)),
    radial-gradient(1px 1px at 35% 8%, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 48% 22%, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 62% 40%, rgba(255,255,255,0.8), rgba(0,0,0,0)),
    radial-gradient(1.5px 1.5px at 76% 15%, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 88% 34%, rgba(255,255,255,0.9), rgba(0,0,0,0)),
    radial-gradient(1.5px 1.5px at 6% 60%, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 30% 78%, rgba(255,255,255,0.8), rgba(0,0,0,0)),
    radial-gradient(2px 2px at 55% 68%, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 80% 82%, rgba(255,255,255,0.85), rgba(0,0,0,0)),
    radial-gradient(1.5px 1.5px at 95% 60%, #fff, rgba(0,0,0,0)),
    linear-gradient(to bottom, #0B0F19, #05070B)
  `
};

const feedLabelStyle = { color: 'rgba(255,255,255,0.65)', fontSize: '11px', fontWeight: '800', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '22px' };

const stageWrapStyle = { position: 'relative', width: 'min(360px, 92vw)', height: 'min(480px, 58vh)', marginBottom: '20px' };

const emptyStateStyle = { position: 'absolute', inset: 0, borderRadius: '20px', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center', color: '#0a192f' };
const emptyStateBtnStyle = { textDecoration: 'none', background: '#0a192f', color: '#fff', padding: '12px 24px', borderRadius: '100px', fontSize: '12.5px', fontWeight: '800' };

const cardStyle = (offset, isTop) => ({
  position: 'absolute',
  inset: 0,
  borderRadius: '20px',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.04})`,
  zIndex: 10 - offset,
  transition: 'transform .25s',
  touchAction: 'none',
  userSelect: 'none',
  cursor: isTop ? 'grab' : 'default',
  pointerEvents: isTop ? 'auto' : 'none',
  boxShadow: '0 20px 45px rgba(0,0,0,0.35)'
});

const feedBadgeStyle = { position: 'absolute', top: '18px', fontSize: '13px', fontWeight: '800', padding: '7px 16px', borderRadius: '100px', border: '2.5px solid', opacity: 0, pointerEvents: 'none', zIndex: 5, letterSpacing: '0.04em' };
const feedBadgeNoStyle = { left: '18px', color: '#e11d48', borderColor: '#e11d48', transform: 'rotate(-12deg)' };
const feedBadgeYesStyle = { right: '18px', color: '#16a34a', borderColor: '#16a34a', transform: 'rotate(12deg)' };

const cardImgStyle = { width: '100%', flex: 1, objectFit: 'cover', backgroundColor: '#f6f8fb', minHeight: 0 };
const cardInfoStyle = { padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: '4px' };
const cardStyleBadgeStyle = { fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em', color: '#5b21b6', background: '#ede9fe', padding: '3px 9px', borderRadius: '100px', width: 'fit-content', marginBottom: '2px' };
const cardNameStyle = { fontSize: '15px', fontWeight: '700', color: '#0a192f' };
const cardPriceStyle = { fontSize: '13px', fontWeight: '600', color: '#8592a6' };

// X/serce siedzą po bokach samej karty (nie pod stosem) — panel STORE/FEED/MATCH
// jest przyklejony na stałe do dołu ekranu (zIndex 1000) i przy przyciskach pod
// kartą wizualnie się z nim zlewały; po bokach karty są zawsze wyraźnie ponad nim.
const sideBtnStyle = (side, color, isMobile) => ({
  position: 'absolute',
  top: '50%',
  [side]: isMobile ? '-18px' : '-110px',
  transform: 'translateY(-50%)',
  width: '54px',
  height: '54px',
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  color,
  zIndex: 20,
  boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
});
// Na górze karty (nad zdjęciem), nie na dole — dół karty to opis produktu o
// zmiennej wysokości (dłuższe nazwy zajmują 2 linie), więc kotwiczenie od dołu
// czasem nachodziłoby na tekst.
const cartBtnStyle = {
  position: 'absolute',
  left: '50%',
  top: '14px',
  transform: 'translateX(-50%)',
  width: '46px',
  height: '46px',
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  color: '#0077b6',
  zIndex: 20,
  boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
};

const hintStyle = { fontSize: '12.5px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', minHeight: '16px' };

const modalBackdropStyle = { position: 'fixed', inset: 0, background: 'rgba(10,25,47,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' };
const modalCardStyle = { width: '100%', maxWidth: '380px', background: '#fff', borderRadius: '20px', padding: '28px 24px', boxSizing: 'border-box', textAlign: 'center' };
const modalTitleStyle = { margin: '0 0 6px', fontSize: '17px', fontWeight: '800', color: '#0a192f' };
const modalSubtitleStyle = { margin: '0 0 20px', fontSize: '13px', fontWeight: '600', color: '#8592a6' };
const modalGridStyle = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '22px' };
const modalThumbStyle = { width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0', backgroundColor: '#f6f8fb' };
const modalBtnRowStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const modalSecondaryBtnStyle = { padding: '13px', borderRadius: '100px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#0a192f', fontSize: '13px', fontWeight: '800', cursor: 'pointer' };
const modalPrimaryBtnStyle = { padding: '13px', borderRadius: '100px', border: 'none', background: 'linear-gradient(135deg, #1e1b4b, #311042)', color: '#fff', fontSize: '13px', fontWeight: '800', cursor: 'pointer' };

export default Feed;
