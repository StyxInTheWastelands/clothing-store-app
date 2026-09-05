import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SizePickerSheet({ product, onClose, onSelectSize }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // Uruchamiamy animację "wjazdu od dołu" zaraz po zamontowaniu
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 220); // czekamy na zakończenie animacji zamykania
  };

  const handleSelectSize = (size) => {
    onSelectSize(size);
    handleClose();
  };

  const currentPrice = parseFloat(product.price) || 0;
  const favoriteSize = localStorage.getItem('favoriteSize');

  return (
    <>
      <div style={backdropStyle(isVisible)} onClick={handleClose} />
      <div style={sheetStyle(isVisible)}>
        <div style={dragHandleStyle} onClick={handleClose} />

        <button
          onClick={() => navigate(`/product/${product.id}`)}
          style={detailsBtnStyle}
        >
          Szczegóły produktu
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6" /></svg>
        </button>

        <div style={previewRowStyle}>
          <img src={product.image} alt={product.name} style={previewImgStyle} />
          <div style={{ minWidth: 0 }}>
            <div style={previewNameStyle}>{product.name}</div>
            <div style={previewPriceStyle}>{currentPrice.toFixed(2)} PLN</div>
          </div>
        </div>

        <span style={labelStyle}>Wybierz rozmiar</span>

        <div style={sizesGridStyle}>
          {(product.sizes || []).map((size) => (
            <button key={size} onClick={() => handleSelectSize(size)} style={sizeBtnStyle(size === favoriteSize)}>
              {size}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

const backdropStyle = (visible) => ({
  position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.45)',
  opacity: visible ? 1 : 0, transition: 'opacity 0.22s ease', zIndex: 3000
});

const sheetStyle = (visible) => ({
  position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 3001,
  backgroundColor: '#ffffff', borderRadius: '20px 20px 0 0',
  boxShadow: '0 -10px 40px rgba(10, 25, 47, 0.2)',
  height: 'clamp(260px, 30vh, 420px)',
  padding: '14px 24px 28px',
  boxSizing: 'border-box',
  display: 'flex', flexDirection: 'column', gap: '18px',
  transform: visible ? 'translateY(0)' : 'translateY(100%)',
  transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
  fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif'
});

const dragHandleStyle = { width: '36px', height: '4px', borderRadius: '100px', backgroundColor: '#e2e8f0', alignSelf: 'center', cursor: 'pointer' };

const detailsBtnStyle = {
  position: 'absolute', top: '16px', right: '20px',
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  background: '#f6f8fb', border: 'none', borderRadius: '100px',
  padding: '7px 12px', fontSize: '11.5px', fontWeight: '700', color: '#64748b',
  cursor: 'pointer'
};

const previewRowStyle = { display: 'flex', alignItems: 'center', gap: '14px' };
const previewImgStyle = { width: '48px', height: '60px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#f6f8fb', flexShrink: 0 };
const previewNameStyle = { fontSize: '13.5px', fontWeight: '700', color: '#0a192f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const previewPriceStyle = { fontSize: '13px', fontWeight: '600', color: '#8592a6', marginTop: '3px' };

const labelStyle = { fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8592a6' };

const sizesGridStyle = { display: 'flex', gap: '10px', flexWrap: 'wrap', overflowY: 'auto' };
// Ulubiony rozmiar z profilu (jeśli dostępny dla tego produktu) jest wyróżniony,
// żeby dało się go od razu rozpoznać — ale wybór wciąż wymaga kliknięcia.
const sizeBtnStyle = (isFavorite) => ({
  minWidth: '48px', padding: '12px 14px', borderRadius: '8px',
  border: isFavorite ? '1.5px solid #0a192f' : '1px solid #e2e8f0',
  backgroundColor: isFavorite ? '#0a192f' : '#fff',
  color: isFavorite ? '#fff' : '#0a192f',
  fontSize: '13.5px', fontWeight: '700', cursor: 'pointer'
});

export default SizePickerSheet;
