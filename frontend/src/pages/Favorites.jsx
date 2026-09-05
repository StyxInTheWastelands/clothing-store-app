import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import usePageMeta from '../hooks/usePageMeta';

function Favorites() {
  usePageMeta('Ulubione', 'Produkty, które dodałaś do ulubionych w Urban Stitch.');
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { favorites: items, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const removeItem = (item) => {
    toggleFavorite(item);
  };

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: '900px', padding: '0 20px', boxSizing: 'border-box' }}>
        
        {/* NAGŁÓWEK STRONY */}
        <div style={{ marginBottom: '40px', textAlign: isMobile ? 'center' : 'left' }}>
          <h1 style={pageTitleStyle}>Twoje Ulubione Produkty</h1>
          <p style={subtitleStyle}>
            Zapisane rzeczy, które są gotowe, aby stać się częścią Twojej kolejnej stylizacji lub kombinacji MATCH.
          </p>
        </div>

        {/* LISTA KART */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '45px' }}>
          {items.length > 0 ? (
            items.map((item) => (
              <div 
                key={item.id} 
                style={{
                  ...cardStyle,
                  flexDirection: isMobile ? 'column' : 'row',
                  textAlign: isMobile ? 'center' : 'left'
                }}
              >
                {/* SERCE */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
                  <button
                    onClick={() => removeItem(item)}
                    style={heartButtonStyle}
                    title="Usuń z ulubionych"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ff4d4d" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>

                {/* Zdjęcie produktu */}
                <div
                  style={{
                    ...imageWrapperStyle,
                    width: isMobile ? '100%' : '140px',
                    height: isMobile ? '200px' : '140px',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img src={item.image} alt={item.name} style={imageStyle} />
                </div>

                {/* Informacje o produkcie */}
                <div style={{ flex: '2', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => navigate(`/product/${item.id}`)}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
                    {item.sub_category && <span style={categoryStyle}>{item.sub_category}</span>}
                    {item.style && <span style={tagStyle}>{item.style}</span>}
                    {item.color && <span style={tagStyle}>{item.color}</span>}
                  </div>
                  <h3 style={itemTitleStyle}>{item.name}</h3>
                  <span style={priceStyle}>{parseFloat(item.price).toFixed(2)} PLN</span>
                </div>

                {/* Blok akcji */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'row' : 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '12px',
                  width: isMobile ? '100%' : 'auto',
                  marginTop: isMobile ? '15px' : '0'
                }}>
                  <button
                    onClick={() => navigate(`/match?seedProductId=${encodeURIComponent(item.id)}`)}
                    style={matchButtonStyle}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
                      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                    </svg>
                    Stwórz MATCH
                  </button>

                  <button
                    onClick={() => addToCart(item, { size: (item.sizes && item.sizes[0]) || '' })}
                    style={cartButtonStyle}
                  >
                    Do koszyka
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div style={emptyStateStyle}>
              <p>Twoja lista ulubionych produktów jest pusta.</p>
            </div>
          )}
        </div>

        {/* PRZYCISK PRZEJŚCIA DO REKOMENDACJI */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={() => navigate('/match')} style={recommendationsRedirectButtonStyle}>
            Przejdź do inteligentnych rekomendacji
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '10px', verticalAlign: 'middle' }}>
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}

// STYLE 
const containerStyle = { minHeight: '80vh', backgroundColor: '#ffffff', color: '#1a1a1a', display: 'flex', justifyContent: 'center', padding: '60px 0', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' };
const pageTitleStyle = { fontSize: '28px', fontWeight: '800', letterSpacing: '0.5px', color: '#1a1a1a', margin: '0 0 10px 0' };
const subtitleStyle = { fontSize: '14px', color: '#666666', margin: 0, lineHeight: '1.5' };
const cardStyle = { backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '16px', padding: '20px', display: 'flex', gap: '25px', alignItems: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', boxSizing: 'border-box' };
const imageWrapperStyle = { borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f5f5f5', flexShrink: 0 };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const itemTitleStyle = { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: '4px 0' };
const categoryStyle = { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#00b4d8', fontWeight: '600' };
const tagStyle = { fontSize: '10px', backgroundColor: '#f0f2f5', color: '#495057', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' };
const priceStyle = { fontSize: '16px', fontWeight: '700', color: '#0077b6', marginTop: '4px' };
const matchButtonStyle = { backgroundColor: 'transparent', border: '2px solid #00b4d8', color: '#00b4d8', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '140px' };
const cartButtonStyle = { backgroundColor: '#00b4d8', border: 'none', color: '#ffffff', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'background-color 0.2s ease', width: '140px' };
const heartButtonStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s ease' };
const emptyStateStyle = { textAlign: 'center', padding: '40px', border: '1px dashed #cccccc', borderRadius: '16px', color: '#777777' };
const recommendationsRedirectButtonStyle = { background: 'linear-gradient(90deg, #00b4d8, #0077b6)', border: 'none', color: '#ffffff', padding: '16px 32px', borderRadius: '30px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 180, 216, 0.3)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' };

export default Favorites;