import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { nightSkyBackground, nightSkyBackgroundSize, nightSkyBackgroundRepeat } from '../styles/nightSkyBackground';
import { useToast } from '../context/ToastContext';
import usePageMeta from '../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const COLOR_MAP = {
  '800': { name: 'Czarny', hex: '#000000' },
  '251': { name: 'Biały', hex: '#FFFFFF', border: '#e5e7eb' },
  '401': { name: 'Ciemnoniebieski', hex: '#1d3557' },
  '300': { name: 'Szary', hex: '#808080' },
  '122': { name: 'Jasnoszary Melanż', hex: '#d1d5db' },
  '200': { name: 'Ekri / Off-White', hex: '#f4f4f0', border: '#e5e7eb' },
  '250': { name: 'Czysty Biały', hex: '#FFFFFF', border: '#e5e7eb' },
  '273': { name: 'Kremowy', hex: '#fdf6e2', border: '#e5e7eb' },
  '400': { name: 'Niebieski', hex: '#3b82f6' },
  '423': { name: 'Jasnoniebieski', hex: '#93c5fd' },
  '426': { name: 'Pastelowy Niebieski', hex: '#a5f3fc' },
  '428': { name: 'Stalowy Niebieski', hex: '#475569' },
  '433': { name: 'Granatowy', hex: '#1e3a8a' },
  '505': { name: 'Jasnoróżowy', hex: '#fbcfe8' },
  '507': { name: 'Fuksja / Różowy', hex: '#db2777' },
  '594': { name: 'Fioletowy / Lila', hex: '#c084fc' },
  '600': { name: 'Czerwony', hex: '#dc2626' },
  '606': { name: 'Bordowy', hex: '#991b1b' },
  '685': { name: 'Koralowy', hex: '#f97316' },
  '700': { name: 'Khaki / Oliwkowy', hex: '#3f6212' },
  '710': { name: 'Jasnozielony', hex: '#86efac' },
  '711': { name: 'Zielony Jabłkowy', hex: '#4ade80' },
  '717': { name: 'Miętowy', hex: '#ccfbf1' },
  '730': { name: 'Szmaragdowy', hex: '#047857' },
  '805': { name: 'Antracytowy', hex: '#374151' },
  '806': { name: 'Grafitowy', hex: '#1f2937' },
  '810': { name: 'Ciemnoszary', hex: '#4b5563' },
  '818': { name: 'Jasny Szary', hex: '#9ca3af' },
  '830': { name: 'Asfaltowy', hex: '#111827' },
  '902': { name: 'Żółty Pastelowy', hex: '#fef08a' }
};

const ProductPage = () => {
  const navigate = useNavigate();
  const { prodId, quality, colorId } = useParams(); 

  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  usePageMeta(
    product ? product.name : 'Produkt',
    product ? `${product.name} — ${parseFloat(product.price).toFixed(2)} PLN. Zobacz szczegóły i dobierz rozmiar w Urban Stitch.` : 'Szczegóły produktu w sklepie Urban Stitch.'
  );

  useEffect(() => {
    const fetchProductFromDB = async () => {
      setLoading(true);
      try {
        const apiPath = (quality && colorId) 
          ? `${API_URL}/api/products/${prodId}/${quality}/${colorId}`
          : `${API_URL}/api/products/${prodId}`;

        const response = await fetch(apiPath);
        
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          const favoriteSize = localStorage.getItem('favoriteSize');
          setSelectedSize(favoriteSize && data.sizes && data.sizes.includes(favoriteSize) ? favoriteSize : null);
        } else {
          const fallbackResponse = await fetch(`${API_URL}/api/products/${prodId}`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setProduct(fallbackData);
          } else {
            setProduct(null);
          }
        }
      } catch (error) {
        console.error("Błąd pobierania danych z bazy:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductFromDB();
  }, [prodId, quality, colorId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: nightSkyBackground, backgroundSize: nightSkyBackgroundSize, backgroundRepeat: nightSkyBackgroundRepeat, color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Montserrat, sans-serif' }}>
        <h2>Ładowanie produktu z bazy danych...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: nightSkyBackground, backgroundSize: nightSkyBackgroundSize, backgroundRepeat: nightSkyBackgroundRepeat, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'Montserrat, sans-serif' }}>
        <h2>Produkt nie został znaleziony w bazie danych...</h2>
        <p style={{ color: '#9ca3af', marginTop: '10px' }}>ID: {prodId}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', background: '#fff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
          Wróć do sklepu
        </button>
      </div>
    );
  }

  const handleMatchClick = () => {
    navigate(`/match?seedProductId=${encodeURIComponent(product.id)}`);
  };

  const currentPrice = parseFloat(product.price) || 0;
  const oldPriceField = product.old_price || product.oldPrice;
  const oldPrice = oldPriceField ? parseFloat(oldPriceField) : null;
  const isSale = oldPrice !== null && oldPrice > currentPrice;

  const isLiked = isFavorite(product.id);

  const handleFavoriteClick = () => {
    toggleFavorite(product);
  };

  const handleAddToCart = async () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showToast('Wybierz rozmiar przed dodaniem do koszyka.', 'error');
      return;
    }

    setIsAddingToCart(true);
    const ok = await addToCart(product, { size: selectedSize || '', quantity: 1 });
    setIsAddingToCart(false);

    if (ok) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: nightSkyBackground,
      backgroundSize: nightSkyBackgroundSize, backgroundRepeat: nightSkyBackgroundRepeat,
      padding: '40px 20px',
      fontFamily: 'Montserrat, sans-serif',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      
      <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          &larr; <span style={{ fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Powrót</span>
        </button>
      </div>

      <div style={{
        width: '100%', maxWidth: '1100px', backgroundColor: '#FFFFFF', borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexWrap: 'wrap', overflow: 'hidden', color: '#1a1a1a', 
        marginBottom: '40px', position: 'relative' 
      }}>
        
        {isSale && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: '#dc2626',
            color: '#fff',
            padding: '8px 15px',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderRadius: '4px',
            zIndex: 10,
            boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)'
          }}>
            Wyprzedaż
          </div>
        )}
        
        <div style={{ flex: '1 1 500px', height: '600px', position: 'relative', backgroundColor: '#f3f4f6' }}>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <div style={{ flex: '1 1 500px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              {product.reference || `REF. ${product.id || prodId}`}
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '8px 0 15px 0', letterSpacing: '0.5px' }}>
              {product.name}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              {isSale ? (
                <>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: '#F43F5E', margin: 0 }}>
                    {currentPrice.toFixed(2)} PLN
                  </p>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#71717a', textDecoration: 'line-through', margin: 0 }}>
                    {oldPrice.toFixed(2)} PLN
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '22px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                  {currentPrice.toFixed(2)} PLN
                </p>
              )}
            </div>

            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', marginBottom: '30px' }}>
              {product.description || "Brak opisu dla tego produktu."}
            </p>

            {product.availableColors && product.availableColors.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Kolor: <span style={{ fontWeight: '400', color: '#6b7280', textTransform: 'capitalize' }}>
                    {product.color || `Kod: ${colorId || ''}`}
                  </span>
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {product.availableColors.map((colId) => {
                    const cleanColId = String(colId).replace(/\s+/g, '');
                    const currentUrlColorId = String(colorId || '').replace(/\s+/g, '');
                    const isSelected = cleanColId === currentUrlColorId;

                    let finalHex = '#bebebe'; 
                    let colorName = `Kod ${cleanColId}`;

                    if (COLOR_MAP[cleanColId]) {
                      finalHex = COLOR_MAP[cleanColId].hex;
                      colorName = COLOR_MAP[cleanColId].name;
                    } else if (product.color) {
                      const dbColorLower = product.color.toLowerCase();
                      if (dbColorLower.includes('wielbłąd') || dbColorLower.includes('beż')) finalHex = '#c19a6b';
                      if (dbColorLower.includes('żółt')) finalHex = '#facc15';
                      if (dbColorLower.includes('niebiesk') || dbColorLower.includes('blue')) finalHex = '#3b82f6';
                      if (dbColorLower.includes('czarn') || dbColorLower.includes('black')) finalHex = '#000000';
                      colorName = product.color;
                    }

                    return (
                      <button
                        key={cleanColId}
                        title={colorName}
                        onClick={() => {
                          if (quality && colorId) {
                            navigate(`/product/${prodId}/${quality}/${cleanColId}`);
                          }
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: finalHex,
                          border: isSelected ? '2px solid #000' : '2px solid #e5e7eb',
                          outline: isSelected ? '2px solid #fff' : 'none',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '35px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>Wybierz Rozmiar:</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '10px 18px', border: selectedSize === size ? '1px solid #000' : '1px solid #e5e7eb',
                        backgroundColor: selectedSize === size ? '#000' : '#fff', color: selectedSize === size ? '#fff' : '#000',
                        fontSize: '13px', fontWeight: '600', cursor: 'pointer', borderRadius: '4px'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              style={{
                flex: 1,
                backgroundColor: addedToCart ? '#16a34a' : '#0f172a',
                color: '#fff', border: 'none', padding: '16px', fontSize: '14px', fontWeight: '700',
                textTransform: 'uppercase', borderRadius: '4px',
                cursor: isAddingToCart ? 'default' : 'pointer',
                opacity: isAddingToCart ? 0.7 : 1,
                transition: 'background-color 0.2s ease'
              }}
            >
              {addedToCart ? 'Dodano ✓' : 'Dodaj do koszyka'}
            </button>
            <button 
              onClick={handleFavoriteClick} 
              style={{ width: '54px', height: '54px', border: '1px solid #e5e7eb', backgroundColor: isLiked ? '#fee2e2' : '#fff', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLiked ? "#ef4444" : "none"} stroke={isLiked ? "#ef4444" : "#1a1a1a"} strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', justifyContent: 'center' }}>
        <button onClick={handleMatchClick} style={{ background: 'linear-gradient(90deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', border: 'none', padding: '18px 40px', fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)' }}>
          ✨ Spróbuj zrobić swój match
        </button>
      </div>
    </div>
  );
};

export default ProductPage;