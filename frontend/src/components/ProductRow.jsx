import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { isSessionValid } from '../utils/auth';
import SizePickerSheet from './SizePickerSheet';
import { useToast } from '../context/ToastContext';

function ProductRow({ title, products, isDark = false, seeMoreTo }) {
  const rowRef = useRef(null);
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [sizePickerProduct, setSizePickerProduct] = useState(null);

  const handleQuickAdd = (product) => {
    if (!isSessionValid()) {
      showToast('Musisz się zalogować, aby dodać produkt do koszyka!', 'error');
      navigate('/auth');
      return;
    }

    // Jeśli produkt ma więcej niż jeden rozmiar do wyboru — pytamy w dolnym okienku
    if (product.sizes && product.sizes.length > 1) {
      setSizePickerProduct(product);
    } else {
      addToCart(product, { size: (product.sizes && product.sizes[0]) || '' });
    }
  };

  const scroll = (direction) => {
    const container = rowRef.current; 
    if (!container) return;

    const isMobile = window.innerWidth <= 768;
    let scrollAmount = 0;

    if (isMobile) {
      const firstCard = container.querySelector('div'); 
      if (firstCard) {
        scrollAmount = firstCard.clientWidth + 20; 
      } else {
        scrollAmount = 250;
      }
    } else {
      scrollAmount = 500; 
    }

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const displayProducts = products ? products.slice(0, 10) : [];
  const textColor = isDark ? '#FFF' : '#111827';

  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', marginTop: '50px', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: textColor }}>
          {title}
        </h2>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => scroll('left')}
            style={{
              background: isDark ? '#FFF' : '#1a2a4a', 
              color: isDark ? '#000' : '#fff', 
              border: 'none', width: '40px', height: '40px',
              borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            ←
          </button>
          <button 
            onClick={() => scroll('right')}
            style={{
              background: isDark ? '#FFF' : '#1a2a4a', 
              color: isDark ? '#000' : '#fff', 
              border: 'none', width: '40px', height: '40px',
              borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            →
          </button>
        </div>
      </div>

      <div 
        ref={rowRef}
        className="product-row-container" 
        style={{ 
          display: 'flex', 
          gap: '20px', 
          overflowX: 'auto', 
          padding: '10px 40px 30px 40px',
          scrollBehavior: 'smooth'
        }}
      >
        {displayProducts.map((product) => {
          const isFav = isFavorite(product.id);
          const currentPrice = parseFloat(product.price) || 0;
          const oldPrice = product.old_price ? parseFloat(product.old_price) : null;

          return (
            <div key={product.id} style={{ minWidth: '230px', maxWidth: '230px', position: 'relative', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* Serce */}
              <button 
                onClick={() => toggleFavorite(product)} 
                style={{
                  position: 'absolute', top: '10px', right: '10px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(4px)', border: 'none',
                  borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFav ? '#e74c3c' : '#000',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)', zIndex: 5
                }}
              >
                {isFav ? '♥' : '♡'}
              </button>

              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  style={{ width: '100%', height: '307px', objectFit: 'cover', backgroundColor: '#f3f4f6' }} 
                />
                
                <div style={{ padding: '12px 10px 4px 10px' }}>
                  <h3 style={{ fontSize: '13px', margin: '0 0 4px 0', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0' }}>
                    {oldPrice && (
                      <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '12px', fontWeight: '500' }}>
                        {oldPrice.toFixed(2)} PLN
                      </span>
                    )}
                    <span style={{ fontWeight: '700', fontSize: '14px', color: oldPrice ? '#F43F5E' : '#111827' }}>
                      {currentPrice.toFixed(2)} PLN
                    </span>
                  </div>
                </div>
              </Link>
              
              <button 
                onClick={() => handleQuickAdd(product)} 
                style={{ backgroundColor: isDark ? '#1a2a4a' : '#000', color: 'white', border: 'none', width: '100%', padding: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', marginTop: 'auto' }}
              >
                DODAJ DO KOSZYKA
              </button>
            </div>
          );
        })}

        {/* Karta "Zobacz więcej" — tylko jeśli podano realny cel nawigacji */}
        {seeMoreTo && (
        <div
          className="see-more-card"
          onClick={() => navigate(seeMoreTo)}
          style={{
            minWidth: '230px',
            maxWidth: '230px',
            height: '385px',
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
            border: isDark ? '1px dashed rgba(255,255,255,0.3)' : '1px dashed #d1d5db',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            gap: '10px',
            transition: 'background-color 0.2s'
          }}
        >
          <span style={{ fontSize: '28px', color: textColor }}>→</span>
          <span className="see-more-text" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', color: textColor }}>
            ZOBACZ WIĘCEJ
          </span>
        </div>
        )}

      </div>

      {sizePickerProduct && (
        <SizePickerSheet
          product={sizePickerProduct}
          onClose={() => setSizePickerProduct(null)}
          onSelectSize={(size) => addToCart(sizePickerProduct, { size })}
        />
      )}
    </div>
  );
}

export default ProductRow;