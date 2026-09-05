import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import usePageMeta from '../hooks/usePageMeta';

function Cart() {
  usePageMeta('Koszyk', 'Twój koszyk zakupowy w sklepie Urban Stitch.');
  const navigate = useNavigate();
  const { cartItems, cartCount, subtotal, updateQuantity, removeFromCart } = useCart();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 680);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 680);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={pageWrapStyle}>
      <div style={pageStyle(isMobile)}>

        <div style={headStyle}>
          <h1 style={titleStyle}>Twój koszyk</h1>
          <span style={subtitleStyle}>
            {cartCount === 0 ? 'Koszyk jest pusty' : `${cartCount} ${cartCount === 1 ? 'produkt' : 'produkty'}`}
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div style={emptyStateStyle}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c3ccdd" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
              <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 8H6" />
            </svg>
            <p style={emptyTextStyle}>Twój koszyk jest pusty.</p>
            <Link to="/" style={emptyLinkStyle}>Wróć do sklepu →</Link>
          </div>
        ) : (
          <div style={layoutStyle(isMobile)}>

            {/* LISTA PRODUKTÓW */}
            <div style={listStyle}>
              {cartItems.map((item) => (
                <div key={item.cart_item_id} style={rowStyle(isMobile)}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={thumbStyle(isMobile)}
                    onClick={() => navigate(`/product/${item.id}`)}
                  />

                  <div style={infoStyle}>
                    <span style={nameStyle} onClick={() => navigate(`/product/${item.id}`)}>{item.name}</span>
                    <div style={metaRowStyle}>
                      {item.size && <span style={sizeBadgeStyle}>Rozmiar {item.size}</span>}
                      <span style={unitPriceStyle}>{parseFloat(item.price).toFixed(2)} PLN / szt.</span>
                    </div>

                    {isMobile && (
                      <div style={mobileBottomRowStyle}>
                        <QuantityStepper
                          quantity={item.quantity}
                          onChange={(q) => updateQuantity(item.cart_item_id, q)}
                        />
                        <span style={lineTotalStyle}>{(parseFloat(item.price) * item.quantity).toFixed(2)} PLN</span>
                      </div>
                    )}
                  </div>

                  {!isMobile && (
                    <QuantityStepper
                      quantity={item.quantity}
                      onChange={(q) => updateQuantity(item.cart_item_id, q)}
                    />
                  )}

                  {!isMobile && (
                    <span style={lineTotalStyle}>{(parseFloat(item.price) * item.quantity).toFixed(2)} PLN</span>
                  )}

                  <button
                    onClick={() => removeFromCart(item.cart_item_id)}
                    style={removeBtnStyle}
                    title="Usuń z koszyka"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* PODSUMOWANIE */}
            <div style={summaryStyle(isMobile)}>
              <span style={summaryEyebrowStyle}>Podsumowanie</span>
              <div style={summaryLineStyle}>
                <span>Wartość produktów</span>
                <span>{subtotal.toFixed(2)} PLN</span>
              </div>
              <div style={summaryLineStyle}>
                <span>Dostawa</span>
                <span style={{ color: '#16a34a', fontWeight: '700' }}>Bezpłatna</span>
              </div>
              <div style={summaryDividerStyle} />
              <div style={summaryTotalStyle}>
                <span>Razem</span>
                <span>{subtotal.toFixed(2)} PLN</span>
              </div>
              <button onClick={() => navigate('/checkout')} style={checkoutBtnStyle}>
                Przejdź do zamówienia
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

function QuantityStepper({ quantity, onChange }) {
  return (
    <div style={stepperStyle}>
      <button onClick={() => onChange(quantity - 1)} disabled={quantity <= 1} style={stepperBtnStyle(quantity <= 1)}>−</button>
      <span style={stepperValueStyle}>{quantity}</span>
      <button onClick={() => onChange(quantity + 1)} style={stepperBtnStyle(false)}>+</button>
    </div>
  );
}

// STYLE
const pageWrapStyle = { minHeight: '100vh', width: '100%', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', boxSizing: 'border-box', fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif' };
const pageStyle = (isMobile) => ({ width: '100%', maxWidth: '980px', boxSizing: 'border-box', padding: isMobile ? '28px 18px 70px' : '44px 24px 90px' });

const headStyle = { marginBottom: '34px' };
const titleStyle = { fontSize: '26px', fontWeight: '800', letterSpacing: '0.01em', color: '#0a192f', margin: '0 0 6px 0' };
const subtitleStyle = { fontSize: '13.5px', color: '#8592a6', fontWeight: '600' };

const emptyStateStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '80px 20px', textAlign: 'center' };
const emptyTextStyle = { fontSize: '15px', color: '#3c4a63', margin: 0, fontWeight: '600' };
const emptyLinkStyle = { fontSize: '13.5px', color: '#00b4d8', fontWeight: '700', textDecoration: 'none' };

const layoutStyle = (isMobile) => ({ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '30px' : '48px', alignItems: 'flex-start' });

const listStyle = { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' };
const rowStyle = (isMobile) => ({
  display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '14px' : '20px',
  padding: '22px 0', borderBottom: '1px solid #e9edf3'
});
const thumbStyle = (isMobile) => ({ width: isMobile ? '68px' : '84px', height: isMobile ? '90px' : '104px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#f6f8fb', cursor: 'pointer', flexShrink: 0 });
const infoStyle = { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' };
const nameStyle = { fontSize: '14.5px', fontWeight: '700', color: '#0a192f', cursor: 'pointer', lineHeight: '1.3' };
const metaRowStyle = { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' };
const sizeBadgeStyle = { fontSize: '11px', fontWeight: '700', color: '#3c4a63', background: '#f6f8fb', padding: '3px 9px', borderRadius: '100px' };
const unitPriceStyle = { fontSize: '12.5px', color: '#8592a6', fontWeight: '600' };
const mobileBottomRowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' };
const lineTotalStyle = { fontSize: '14.5px', fontWeight: '800', color: '#0a192f', minWidth: '90px', textAlign: 'right' };

const stepperStyle = { display: 'flex', alignItems: 'center', gap: '2px', border: '1px solid #e9edf3', borderRadius: '100px', padding: '3px' };
const stepperBtnStyle = (disabled) => ({ width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: 'none', fontSize: '15px', fontWeight: '700', color: disabled ? '#cbd5e1' : '#0a192f', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const stepperValueStyle = { minWidth: '22px', textAlign: 'center', fontSize: '13.5px', fontWeight: '700', color: '#0a192f' };

const removeBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#b3bccb', padding: '4px', display: 'flex', alignSelf: 'center', transition: 'color 0.15s ease' };

const summaryStyle = (isMobile) => ({
  width: isMobile ? '100%' : '300px', flexShrink: 0, position: isMobile ? 'static' : 'sticky', top: '24px',
  display: 'flex', flexDirection: 'column', gap: '14px', padding: '24px', borderRadius: '14px', backgroundColor: '#f6f8fb'
});
const summaryEyebrowStyle = { fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8592a6' };
const summaryLineStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#3c4a63', fontWeight: '600' };
const summaryDividerStyle = { height: '1px', background: '#e2e8f0', margin: '2px 0' };
const summaryTotalStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '16.5px', fontWeight: '800', color: '#0a192f' };
const checkoutBtnStyle = { marginTop: '6px', background: '#0a192f', color: '#fff', border: 'none', padding: '14px', borderRadius: '100px', fontSize: '13.5px', fontWeight: '800', letterSpacing: '0.02em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };

export default Cart;
