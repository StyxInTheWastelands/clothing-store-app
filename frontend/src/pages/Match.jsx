import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import usePageMeta from '../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SLOT_LABEL = { top: 'górę', bottom: 'dół', accessory: 'akcesoria', jacket: 'kurtkę' };
const SLOT_CATEGORY_IDS = { top: [1, 5], bottom: [2, 3, 7], accessory: [6], jacket: [4] };
const STYLE_OPTIONS = ['Casual', 'Streetwear', 'Elegancki', 'Y2K'];

function getSlotForCategory(categoryId) {
  const cid = Number(categoryId);
  return Object.keys(SLOT_CATEGORY_IDS).find((slot) => SLOT_CATEGORY_IDS[slot].includes(cid)) || null;
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8592a6" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
  );
}
function DiceIcon({ color = '#fff' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8" cy="8" r="1.3" fill={color} /><circle cx="16" cy="8" r="1.3" fill={color} /><circle cx="8" cy="16" r="1.3" fill={color} /><circle cx="16" cy="16" r="1.3" fill={color} /><circle cx="12" cy="12" r="1.3" fill={color} />
    </svg>
  );
}
function XIcon() {
  return (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12" /></svg>);
}
function BackIcon() {
  return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a192f" strokeWidth="2.6"><path d="M15 18l-6-6 6-6" /></svg>);
}

// Pionowa karta (dla akcesoriów i kurtki) — duże zdjęcie na górze, nazwa/cena pod spodem.
function SlotBox({ slot, stack, label, isMobile, onPick, onDice, onClear, onBack, onOpen }) {
  const item = stack[0];
  if (!item) {
    return (
      <div style={emptyBoxStyle}>
        <div onClick={() => onPick(slot)} style={emptyClickAreaStyle} role="button" tabIndex={0}>
          <PlusIcon />
          <span style={emptyBoxLabelStyle}>Wybierz {label}</span>
        </div>
        <button onClick={() => onDice(slot)} style={diceBtnStyle} aria-label="Losuj ponownie"><DiceIcon /></button>
      </div>
    );
  }
  const price = parseFloat(item.price) || 0;
  const hasHistory = stack.length > 1;
  return (
    <div style={filledBoxStyle}>
      <span style={{ ...sourceBadgeStyle, ...(item.source === 'fav' ? badgeFavStyle : badgeSuggestionStyle) }}>
        {item.source === 'fav' ? 'Twoje' : 'Sugestia'}
      </span>
      <button onClick={() => onClear(slot)} style={clearBtnStyle} aria-label="Usuń"><XIcon /></button>
      <div onClick={() => onOpen(item)} style={boxClickAreaStyle} role="button" tabIndex={0}>
        <img src={item.image} alt={item.name} style={{ ...boxImgStyle, height: isMobile ? '150px' : '68%' }} />
        <span style={boxNameStyle}>{item.name}</span>
        <span style={boxPriceStyle}>{price.toFixed(2)} PLN</span>
      </div>
      <div style={boxBtnRowStyle}>
        {hasHistory && (
          <button onClick={() => onBack(slot)} style={backBtnStyle} aria-label="Cofnij poprzedni wybór"><BackIcon /></button>
        )}
        <button onClick={() => onDice(slot)} style={diceBtnStyle} aria-label="Losuj ponownie"><DiceIcon /></button>
      </div>
    </div>
  );
}

// Pozioma karta (dla góry i dołu) — zdjęcie po lewej, opis po prawej, niżej i szersza niż wyższa.
function SlotRow({ slot, stack, label, onPick, onDice, onClear, onBack, onOpen }) {
  const item = stack[0];
  if (!item) {
    return (
      <div style={emptyRowStyle}>
        <div onClick={() => onPick(slot)} style={emptyClickAreaStyle} role="button" tabIndex={0}>
          <PlusIcon />
          <span style={emptyBoxLabelStyle}>Wybierz {label}</span>
        </div>
        <button onClick={() => onDice(slot)} style={diceBtnStyle} aria-label="Losuj ponownie"><DiceIcon /></button>
      </div>
    );
  }
  const price = parseFloat(item.price) || 0;
  const hasHistory = stack.length > 1;
  return (
    <div style={filledRowStyle}>
      <span style={{ ...sourceBadgeStyle, ...(item.source === 'fav' ? badgeFavStyle : badgeSuggestionStyle) }}>
        {item.source === 'fav' ? 'Twoje' : 'Sugestia'}
      </span>
      <button onClick={() => onClear(slot)} style={clearBtnStyle} aria-label="Usuń"><XIcon /></button>
      <div onClick={() => onOpen(item)} style={rowClickAreaStyle} role="button" tabIndex={0}>
        <img src={item.image} alt={item.name} style={rowImgStyle} />
        <div style={rowTextWrapStyle}>
          <span style={rowNameStyle}>{item.name}</span>
          <span style={rowPriceStyle}>{price.toFixed(2)} PLN</span>
        </div>
      </div>
      <div style={boxBtnRowStyle}>
        {hasHistory && (
          <button onClick={() => onBack(slot)} style={backBtnStyle} aria-label="Cofnij poprzedni wybór"><BackIcon /></button>
        )}
        <button onClick={() => onDice(slot)} style={diceBtnStyle} aria-label="Losuj ponownie"><DiceIcon /></button>
      </div>
    </div>
  );
}

function FavoritesPickerModal({ slot, items, onSelect, onClose }) {
  return (
    <div style={modalBackdropStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeadStyle}>
          <span style={modalTitleStyle}>Wybierz {SLOT_LABEL[slot]} z ulubionych</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XIcon /></button>
        </div>
        {items.length === 0 ? (
          <p style={modalEmptyStyle}>Brak pasujących produktów w ulubionych. <Link to="/" style={{ color: '#00b4d8' }}>Przejdź do sklepu</Link>.</p>
        ) : (
          <div style={modalListStyle}>
            {items.map((product) => (
              <button key={product.id} onClick={() => onSelect(product)} style={modalItemStyle}>
                <img src={product.image} alt={product.name} style={modalItemImgStyle} />
                <span style={{ flex: 1, textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#0a192f' }}>{product.name}</span>
                <span style={{ fontSize: '12.5px', color: '#8592a6', fontWeight: '600' }}>{parseFloat(product.price).toFixed(2)} PLN</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Semicircle "koło preferencji": pozycje przycisków są stałe (kolumna), a stan
// "wybrany" zmienia tylko własny transform/rozmiar danego elementu — nie
// obracamy tekstu (byłby nieczytelny), tylko przesuwamy elementy wzdłuż łuku.
const WHEEL_ARC_OFFSET = [18, 0, 0, 18];
function StyleWheel({ preferredStyle, onSelect }) {
  return (
    <div style={wheelWrapStyle}>
      <span style={wheelCaptionStyle}>{preferredStyle ? `Styl: ${preferredStyle}` : 'System dobiera styl'}</span>
      <div style={wheelArcStyle}>
        {STYLE_OPTIONS.map((s, i) => {
          const active = preferredStyle === s;
          return (
            <button
              key={s}
              onClick={() => onSelect(active ? null : s)}
              aria-pressed={active}
              style={{
                padding: active ? '14px 22px' : '9px 14px',
                borderRadius: '100px 0 0 100px',
                border: 'none',
                cursor: 'pointer',
                fontSize: active ? '13px' : '11px',
                fontWeight: '800',
                letterSpacing: '0.02em',
                color: active ? '#fff' : '#0a192f',
                background: active ? 'linear-gradient(115deg, #1e1b4b, #7c3aed)' : '#f1f5f9',
                boxShadow: active ? '0 6px 18px rgba(124,58,237,0.35)' : 'none',
                transform: `translateX(${active ? -14 : WHEEL_ARC_OFFSET[i]}px)`,
                transition: 'all .22s cubic-bezier(.2,.8,.2,1)',
                whiteSpace: 'nowrap'
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StylePillRow({ preferredStyle, onSelect }) {
  return (
    <div style={pillRowStyle}>
      <button onClick={() => onSelect(null)} style={pillBtnStyle(!preferredStyle)}>Auto</button>
      {STYLE_OPTIONS.map((s) => (
        <button key={s} onClick={() => onSelect(preferredStyle === s ? null : s)} style={pillBtnStyle(preferredStyle === s)}>{s}</button>
      ))}
    </div>
  );
}

function Match() {
  usePageMeta('MATCH — dobierz zestaw', 'Skonfiguruj kompletny zestaw ubioru dzięki inteligentnemu doborowi produktów Urban Stitch.');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const seedProductId = searchParams.get('seedProductId');
  const { favorites } = useFavorites();
  const { addToCart } = useCart();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 860);
  const [loading, setLoading] = useState(true);
  const [seed, setSeed] = useState(null);
  const [slots, setSlots] = useState({ top: [], bottom: [], accessory: [], jacket: [] });
  const [pickerSlot, setPickerSlot] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedHint, setAddedHint] = useState('');
  const [genderOverride, setGenderOverride] = useState(null);
  const [preferredStyle, setPreferredStyle] = useState(() => {
    const saved = localStorage.getItem('match_preferred_style');
    return STYLE_OPTIONS.includes(saved) ? saved : null;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 860);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (preferredStyle) localStorage.setItem('match_preferred_style', preferredStyle);
    else localStorage.removeItem('match_preferred_style');
  }, [preferredStyle]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const url = new URL(API_URL + '/api/match');
        if (genderOverride) url.searchParams.set('gender', genderOverride);
        else if (seedProductId) url.searchParams.set('seedProductId', seedProductId);
        if (preferredStyle) url.searchParams.set('preferredStyle', preferredStyle);
        const res = await fetch(url, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
        if (res.ok && !cancelled) {
          const data = await res.json();
          setSeed(data.seed);

          // Produkt, od którego zaczęliśmy przez "Stwórz MATCH" (nie losowy ani
          // dobrany przez zmianę płci) od razu zajmuje swój slot jako "Twoje" —
          // a nie tylko wpływa na dobór innych slotów "za kulisami".
          const seedSlot = (!genderOverride && seedProductId) ? getSlotForCategory(data.seed.category_id) : null;
          const seedItem = { ...data.seed, source: 'fav' };

          setSlots({
            top: seedSlot === 'top' ? [seedItem] : (data.top[0] ? [{ ...data.top[0], source: 'suggestion' }] : []),
            bottom: seedSlot === 'bottom' ? [seedItem] : (data.bottom[0] ? [{ ...data.bottom[0], source: 'suggestion' }] : []),
            accessory: seedSlot === 'accessory' ? [seedItem] : (data.accessory[0] ? [{ ...data.accessory[0], source: 'suggestion' }] : []),
            jacket: seedSlot === 'jacket' ? [seedItem] : []
          });
        }
      } catch (err) {
        console.error('Błąd ładowania MATCH:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [seedProductId, genderOverride, preferredStyle]);

  const effectiveGender = genderOverride || (seed && seed.gender) || 'women';

  const pushToSlot = (slot, item) => setSlots((prev) => ({ ...prev, [slot]: [item, ...prev[slot]].slice(0, 3) }));
  const goBackSlot = (slot) => setSlots((prev) => (prev[slot].length <= 1 ? prev : { ...prev, [slot]: prev[slot].slice(1) }));
  const clearSlot = useCallback((slot) => setSlots((prev) => ({ ...prev, [slot]: [] })), []);

  const randomizeSlot = useCallback(async (slot) => {
    try {
      const url = new URL(API_URL + '/api/match/random');
      url.searchParams.set('slot', slot);
      url.searchParams.set('gender', effectiveGender);
      if (preferredStyle) url.searchParams.set('preferredStyle', preferredStyle);
      if (seed) url.searchParams.set('seedProductId', seed.id);
      const current = slots[slot][0];
      if (current) url.searchParams.set('excludeId', current.id);
      const res = await fetch(url);
      if (res.ok) {
        const item = await res.json();
        pushToSlot(slot, { ...item, source: 'suggestion' });
      }
    } catch (err) {
      console.error(err);
    }
  }, [effectiveGender, preferredStyle, seed, slots]);

  const pickFromFavorites = (product) => {
    pushToSlot(pickerSlot, { ...product, source: 'fav' });
    setPickerSlot(null);
  };

  const favoritesForSlot = (slot) => {
    const categoryIds = SLOT_CATEGORY_IDS[slot];
    return favorites.filter((p) => categoryIds.includes(Number(p.category_id)) && p.gender === effectiveGender);
  };

  const randomizeWholeLook = () => {
    const slotsToRoll = ['top', 'bottom', 'accessory'];
    if (slots.jacket[0]) slotsToRoll.push('jacket');
    slotsToRoll.forEach((slot) => randomizeSlot(slot));
  };

  const handleAddSetToCart = async () => {
    const items = ['top', 'bottom', 'accessory', 'jacket'].map((s) => slots[s][0]).filter(Boolean);
    if (items.length === 0) return;
    setAddingToCart(true);
    for (const item of items) {
      await addToCart(item, { size: (item.sizes && item.sizes[0]) || '' });
    }
    setAddingToCart(false);
    setAddedHint('Dodano zestaw do koszyka ✓');
    setTimeout(() => setAddedHint(''), 2500);
  };

  // Karta prowadzi na realną stronę produktu — id ma format "itemcode/quality/color",
  // dlatego wstawiamy je wprost w ścieżkę (bez encodeURIComponent — trasa to 3 segmenty).
  const goToProduct = (item) => navigate(`/product/${item.id}`);

  const slotActions = { onPick: (slot) => setPickerSlot(slot), onDice: randomizeSlot, onClear: clearSlot, onBack: goBackSlot, onOpen: goToProduct };

  if (loading) {
    return <div style={pageWrapStyle}><p style={{ textAlign: 'center', padding: '90px 0', color: '#8592a6' }}>Dobieramy propozycje…</p></div>;
  }

  return (
    <div style={pageWrapStyle}>
      {!isMobile && <StyleWheel preferredStyle={preferredStyle} onSelect={setPreferredStyle} />}

      <div style={pageStyle(isMobile)}>

        <div style={headerBarStyle(isMobile)}>
          <div>
            <h1 style={titleStyle(isMobile)}>MATCH</h1>
            <p style={subtitleStyle}>Dobieramy strój na podstawie Twojego stylu i ulubionych produktów.</p>
          </div>
          <div style={genderToggleWrapStyle}>
            <button onClick={() => setGenderOverride('women')} style={genderPillStyle(effectiveGender === 'women')}>Damski look</button>
            <button onClick={() => setGenderOverride('men')} style={genderPillStyle(effectiveGender === 'men')}>Męski look</button>
          </div>
        </div>

        {isMobile && <StylePillRow preferredStyle={preferredStyle} onSelect={setPreferredStyle} />}

        <div style={layoutStyle(isMobile)}>
          <div style={leftColStyle}>
            <SlotRow slot="top" stack={slots.top} label={SLOT_LABEL.top} {...slotActions} />
            <SlotRow slot="bottom" stack={slots.bottom} label={SLOT_LABEL.bottom} {...slotActions} />
          </div>

          <div style={rightColStyle(isMobile)}>
            <div style={rightBoxWrapStyle(isMobile)}>
              <SlotBox slot="accessory" stack={slots.accessory} label={SLOT_LABEL.accessory} isMobile={isMobile} {...slotActions} />
            </div>
            <div style={rightBoxWrapStyle(isMobile)}>
              <SlotBox slot="jacket" stack={slots.jacket} label={SLOT_LABEL.jacket} isMobile={isMobile} {...slotActions} />
            </div>
          </div>
        </div>

        <button onClick={randomizeWholeLook} style={wholeLookBtnStyle}>
          <DiceIcon /> Zaskocz mnie — cały look
        </button>

        <div style={cartRowStyle}>
          <button onClick={handleAddSetToCart} disabled={addingToCart} style={addSetBtnStyle}>
            {addingToCart ? 'Dodawanie…' : 'Dodaj cały zestaw do koszyka'}
          </button>
          {addedHint && <span style={addedHintStyle}>{addedHint}</span>}
        </div>

      </div>

      {pickerSlot && (
        <FavoritesPickerModal
          slot={pickerSlot}
          items={favoritesForSlot(pickerSlot)}
          onSelect={pickFromFavorites}
          onClose={() => setPickerSlot(null)}
        />
      )}
    </div>
  );
}

// STYLE
const pageWrapStyle = { minHeight: '100vh', width: '100%', backgroundColor: '#ffffff', boxSizing: 'border-box', fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif', position: 'relative' };
const pageStyle = (isMobile) => ({ width: '100%', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box', padding: isMobile ? '24px 18px 80px' : '36px 64px 100px' });

const headerBarStyle = (isMobile) => ({ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' });
const titleStyle = (isMobile) => ({
  fontSize: isMobile ? '38px' : '58px',
  fontWeight: '900',
  letterSpacing: '0.01em',
  margin: '0 0 6px 0',
  lineHeight: 1,
  backgroundImage: 'linear-gradient(115deg, #1e1b4b, #7c3aed, #311042)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent'
});
const subtitleStyle = { fontSize: '13.5px', color: '#8592a6', fontWeight: '600', margin: 0 };

const genderToggleWrapStyle = { display: 'flex', background: '#f1f5f9', borderRadius: '100px', padding: '4px', gap: '4px' };
const genderPillStyle = (active) => ({ padding: '10px 20px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: '800', letterSpacing: '0.01em', background: active ? '#0a192f' : 'transparent', color: active ? '#fff' : '#64748b', transition: 'all .18s' });

const layoutStyle = (isMobile) => ({ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px', alignItems: 'stretch' });
const leftColStyle = { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' };
const rightColStyle = (isMobile) => ({ display: 'flex', flexDirection: 'row', gap: isMobile ? '26px' : '16px', width: isMobile ? '100%' : '440px', flexShrink: 0 });
const rightBoxWrapStyle = () => ({ flex: 1 });

const emptyBoxStyle = { position: 'relative', width: '100%', height: '100%', borderRadius: '12px', border: '1.5px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', background: '#f9fafb', padding: '10px', boxSizing: 'border-box' };
const emptyClickAreaStyle = { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' };
const emptyBoxLabelStyle = { fontSize: '12px', fontWeight: '600', color: '#8592a6', textAlign: 'center' };
const emptyRowStyle = { position: 'relative', width: '100%', minHeight: '170px', borderRadius: '16px', border: '1.5px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', background: '#f9fafb' };

const filledBoxStyle = { position: 'relative', width: '100%', height: '100%', borderRadius: '12px', border: '1.5px solid #0a192f', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', boxSizing: 'border-box' };
const boxClickAreaStyle = { cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minHeight: 0 };
const sourceBadgeStyle = { position: 'absolute', top: '6px', left: '6px', fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px' };
const badgeFavStyle = { background: '#e0f4fa', color: '#0077b6' };
const badgeSuggestionStyle = { background: '#ede9fe', color: '#5b21b6' };
const clearBtnStyle = { position: 'absolute', top: '-9px', right: '-9px', width: '22px', height: '22px', borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 };
const boxBtnRowStyle = { position: 'absolute', bottom: '-10px', right: '-10px', display: 'flex', alignItems: 'center', gap: '6px' };
const backBtnStyle = { width: '26px', height: '26px', borderRadius: '50%', background: '#fff', border: '1.5px solid #0a192f', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const diceBtnStyle = { width: '32px', height: '32px', borderRadius: '50%', background: '#0a192f', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
// Stały wysokość zdjęcia w px (nie %) — karta rośnie razem z treścią zamiast
// przycinać dłuższe nazwy produktów, gdy kontener nie ma sztywnej wysokości (mobile).
const boxImgStyle = { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginTop: '14px', backgroundColor: '#f6f8fb', flexShrink: 0 };
const boxNameStyle = { fontSize: '11px', fontWeight: '600', color: '#0a192f', marginTop: '8px', textAlign: 'center' };
const boxPriceStyle = { fontSize: '10px', color: '#8592a6', fontWeight: '600', marginTop: '4px' };

const filledRowStyle = { position: 'relative', width: '100%', minHeight: '170px', borderRadius: '16px', border: '1.5px solid #0a192f', background: '#fff', display: 'flex', alignItems: 'center', padding: '14px', boxSizing: 'border-box' };
const rowClickAreaStyle = { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '18px', flex: 1, minWidth: 0 };
const rowImgStyle = { width: '150px', height: '150px', objectFit: 'cover', borderRadius: '10px', backgroundColor: '#f6f8fb', flexShrink: 0 };
const rowTextWrapStyle = { display: 'flex', flexDirection: 'column', minWidth: 0 };
const rowNameStyle = { fontSize: '14px', fontWeight: '700', color: '#0a192f' };
const rowPriceStyle = { fontSize: '12.5px', color: '#8592a6', marginTop: '6px', fontWeight: '600' };

const wholeLookBtnStyle = { marginTop: '24px', width: '100%', padding: '15px', borderRadius: '100px', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '13.5px', fontWeight: '800', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #1e1b4b, #311042)' };
const cartRowStyle = { marginTop: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' };
const addSetBtnStyle = { width: '100%', padding: '14px', borderRadius: '100px', border: 'none', cursor: 'pointer', background: '#0a192f', color: '#fff', fontSize: '13px', fontWeight: '800' };
const addedHintStyle = { fontSize: '12.5px', color: '#16a34a', fontWeight: '700' };

const wheelWrapStyle = { position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', zIndex: 500 };
const wheelCaptionStyle = { fontSize: '10.5px', fontWeight: '700', color: '#8592a6', marginRight: '18px', whiteSpace: 'nowrap' };
const wheelArcStyle = { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' };

const pillRowStyle = { display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 2px 14px', WebkitOverflowScrolling: 'touch' };
const pillBtnStyle = (active) => ({ flexShrink: 0, padding: '9px 16px', borderRadius: '100px', border: active ? 'none' : '1px solid #e2e8f0', cursor: 'pointer', fontSize: '12px', fontWeight: '800', color: active ? '#fff' : '#64748b', background: active ? 'linear-gradient(115deg, #1e1b4b, #7c3aed)' : '#fff' });

const modalBackdropStyle = { position: 'fixed', inset: 0, background: 'rgba(10,25,47,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' };
const modalCardStyle = { width: '100%', maxWidth: '420px', maxHeight: '70vh', background: '#fff', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const modalHeadStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #e9edf3' };
const modalTitleStyle = { fontSize: '14px', fontWeight: '700', color: '#0a192f' };
const modalEmptyStyle = { padding: '24px 20px', fontSize: '13px', color: '#8592a6' };
const modalListStyle = { overflowY: 'auto', padding: '8px' };
const modalItemStyle = { width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '10px' };
const modalItemImgStyle = { width: '42px', height: '54px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#f6f8fb', flexShrink: 0 };

export default Match;
