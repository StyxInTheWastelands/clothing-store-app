import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { nightSkyBackground, nightSkyBackgroundSize, nightSkyBackgroundRepeat } from '../styles/nightSkyBackground';
import usePageMeta from '../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function WomenNew() {
  usePageMeta('Nowości damskie', 'Najnowsze produkty z kolekcji damskiej Urban Stitch.');
  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/products?gender=women&sort=newest`)
      .then((res) => res.json())
      .then((data) => {
        const womenProducts = data.filter(product => {
          const genderValue = product.gender ? product.gender.toLowerCase() : '';
          return genderValue === 'women' || genderValue === 'damski';
        });
        setProducts(womenProducts);
      })
      .catch((err) => console.error("Błąd ładowania nowości:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ ...backgroundContainerStyle, justifyContent: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '20px' }}>Ładowanie nowości...</h2>
      </div>
    );
  }

  return (
    <div style={backgroundContainerStyle}>
      <div style={{
        width: '100%',
        maxWidth: '1200px', 
        backgroundColor: '#FFFFFF',
        borderRadius: isMobile ? '0' : '12px',
        boxShadow: isMobile ? 'none' : '0 10px 30px rgba(0,0,0,0.3)',
        padding: isMobile ? '30px 20px' : '50px 40px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '70vh',
        height: 'auto'
      }}>
        
        <h1 style={{ 
          fontSize: isMobile ? '24px' : '28px', 
          fontWeight: '900', 
          letterSpacing: '2px', 
          textTransform: 'uppercase', 
          margin: '0 0 40px 0',
          textAlign: 'center'
        }}>
          Damskie Nowości
        </h1>

        {/* SIATKA PRODUKTÓW */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', 
          gap: '30px 20px', 
          width: '100%',
          justifyItems: 'center', // centruje małe karty w kolumnach
          boxSizing: 'border-box'
        }}>
          {products.length > 0 ? (
            products.map((product) => {
              const isFav = isFavorite(product.id);
              const currentPrice = parseFloat(product.price) || 0;
              const oldPriceField = product.old_price || product.oldPrice;
              const oldPrice = oldPriceField ? parseFloat(oldPriceField) : null;
              const isSale = oldPrice !== null && oldPrice > currentPrice;

              return (
                <Link 
                  to={`/product/${product.id}`} 
                  key={product.id} 
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%', maxWidth: '230px' }}
                >
                  <div className="product-card" style={productCardStyle}>
                    
                    {/* Kontener na zdjęcie 3:4 */}
                    <div style={{ 
                      width: '100%',
                      aspectRatio: '3/4', 
                      backgroundColor: '#f3f4f6', 
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          display: 'block'
                        }} 
                      />
                    </div>

                    {/* Informacje pod zdjęciem */}
                    <div style={{ padding: '12px 10px', boxSizing: 'border-box' }}>
                      <h3 style={productNameStyle}>
                        {product.name}
                      </h3>
                      
                      {/* Ceny */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        {isSale && (
                          <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '12px' }}>
                            {oldPrice.toFixed(2)} PLN
                          </span>
                        )}
                        <span style={{ fontWeight: '700', fontSize: '14px', color: isSale ? '#dc2626' : '#111827' }}>
                          {currentPrice.toFixed(2)} PLN
                        </span>
                      </div>
                    </div>

                    {/* Przycisk serca */}
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleFavorite(product); }}
                      style={favoriteButtonStyle}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFav ? "#dc2626" : "none"} stroke={isFav ? "#dc2626" : "#111827"} strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    
                  </div>
                </Link>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#6b7280' }}>Obecnie nie ma nowych produktów dla kobiet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const backgroundContainerStyle = {
  minHeight: '80vh',
  background: nightSkyBackground,
  backgroundSize: nightSkyBackgroundSize, backgroundRepeat: nightSkyBackgroundRepeat, 
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px 0',
  boxSizing: 'border-box'
};

const productCardStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxSizing: 'border-box'
};

const productNameStyle = {
  fontSize: '13px', 
  fontWeight: '600', 
  color: '#374151', 
  margin: '0', 
  whiteSpace: 'nowrap', 
  overflow: 'hidden', 
  textOverflow: 'ellipsis'
};

const favoriteButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(4px)',
  border: 'none',
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 5,
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
};

export default WomenNew;