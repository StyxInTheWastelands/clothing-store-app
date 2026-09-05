import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import usePageMeta from '../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PAYMENT_METHODS = [
  {
    id: 'Karta',
    label: 'Karta płatnicza',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" />
      </svg>
    )
  },
  {
    id: 'BLIK',
    label: 'BLIK',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    id: 'Za pobraniem',
    label: 'Za pobraniem',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="6" width="20" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.8" />
      </svg>
    )
  }
];

function Checkout() {
  usePageMeta('Podsumowanie zamówienia', 'Dane dostawy, metoda płatności i podsumowanie zamówienia.');
  const { cartItems, subtotal, clearCartLocal } = useCart();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 680);

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Karta');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 680);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_URL}/api/user/profile`, {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (res.ok) {
          const data = await res.json();
          setAddress(data.address || '');
          setPhone(data.phone || '');
        }
      } catch (err) {
        console.error('Błąd pobierania danych profilu:', err);
      }
    };
    fetchProfile();
  }, []);

  const handlePlaceOrder = async () => {
    if (!address || address.trim() === '') {
      setError('Podaj adres dostawy.');
      return;
    }
    if (!phone || phone.trim() === '') {
      setError('Podaj telefon kontaktowy.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ shippingAddress: address, shippingPhone: phone, paymentMethod })
      });
      const data = await res.json();

      if (res.ok) {
        clearCartLocal();
        setPlacedOrder(data.order);
      } else {
        setError(data.message || 'Nie udało się złożyć zamówienia.');
      }
    } catch (err) {
      console.error(err);
      setError('Błąd połączenia z serwerem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // EKRAN POTWIERDZENIA
  if (placedOrder) {
    return (
      <div style={pageWrapStyle}>
        <div style={confirmWrapStyle}>
          <div style={confirmIconStyle}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <h1 style={confirmTitleStyle}>Dziękujemy za zamówienie!</h1>
          <p style={confirmTextStyle}>
            Zamówienie <b>#{placedOrder.id}</b> na kwotę <b>{parseFloat(placedOrder.total).toFixed(2)} PLN</b> zostało przyjęte do realizacji.
            <br />Płatność: <b>{placedOrder.payment_method}</b>
          </p>
          <div style={confirmActionsStyle}>
            <Link to="/moje-konto" style={confirmSecondaryBtnStyle}>Moje konto</Link>
            <Link to="/" style={confirmPrimaryBtnStyle}>Wróć do sklepu</Link>
          </div>
        </div>
      </div>
    );
  }

  // KOSZYK PUSTY (i jeszcze nic nie zamówiono)
  if (cartItems.length === 0) {
    return (
      <div style={pageWrapStyle}>
        <div style={confirmWrapStyle}>
          <h1 style={confirmTitleStyle}>Twój koszyk jest pusty</h1>
          <p style={confirmTextStyle}>Dodaj produkty do koszyka, aby złożyć zamówienie.</p>
          <Link to="/" style={confirmPrimaryBtnStyle}>Wróć do sklepu</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrapStyle}>
      <div style={pageStyle(isMobile)}>

        <div style={headStyle}>
          <Link to="/cart" style={backLinkStyle}>&larr; Koszyk</Link>
          <h1 style={titleStyle}>Podsumowanie zamówienia</h1>
        </div>

        <div style={layoutStyle(isMobile)}>

          {/* LEWA KOLUMNA: ADRES + PRODUKTY */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '36px' }}>

            <div>
              <span style={sectionEyebrowStyle}>Dane do wysyłki</span>
              <div style={fieldStyle}>
                <label style={fieldLabelStyle}>Adres dostawy</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ulica, numer, kod pocztowy, miasto"
                  rows={2}
                  style={textareaStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={fieldLabelStyle}>Telefon kontaktowy</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+48 ___ ___ ___"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <span style={sectionEyebrowStyle}>Metoda płatności</span>
              <div style={paymentGridStyle(isMobile)}>
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    style={paymentOptionStyle(paymentMethod === method.id)}
                  >
                    {method.icon}
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={sectionEyebrowStyle}>Produkty ({cartItems.length})</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {cartItems.map((item) => (
                  <div key={item.cart_item_id} style={itemRowStyle}>
                    <img src={item.image} alt={item.name} style={itemThumbStyle} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={itemNameStyle}>{item.name}</div>
                      <div style={itemMetaStyle}>
                        {item.size && `Rozmiar ${item.size} · `}Ilość: {item.quantity}
                      </div>
                    </div>
                    <span style={itemPriceStyle}>{(parseFloat(item.price) * item.quantity).toFixed(2)} PLN</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PRAWA KOLUMNA: PODSUMOWANIE */}
          <div style={summaryStyle(isMobile)}>
            <span style={summaryEyebrowStyle}>Do zapłaty</span>
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

            {error && <span style={errorStyle}>{error}</span>}

            <button onClick={handlePlaceOrder} disabled={isSubmitting} style={placeOrderBtnStyle(isSubmitting)}>
              {isSubmitting ? 'Składanie zamówienia…' : 'Złóż zamówienie'}
            </button>
            <span style={disclaimerStyle}>To projekt dyplomowy — płatność jest symulowana.</span>
          </div>

        </div>
      </div>
    </div>
  );
}

// STYLE
const pageWrapStyle = { minHeight: '100vh', width: '100%', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', boxSizing: 'border-box', fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif' };
const pageStyle = (isMobile) => ({ width: '100%', maxWidth: '980px', boxSizing: 'border-box', padding: isMobile ? '28px 18px 70px' : '44px 24px 90px' });

const headStyle = { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '34px' };
const backLinkStyle = { fontSize: '12.5px', fontWeight: '700', color: '#8592a6', textDecoration: 'none' };
const titleStyle = { fontSize: '26px', fontWeight: '800', letterSpacing: '0.01em', color: '#0a192f', margin: 0 };

const layoutStyle = (isMobile) => ({ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '30px' : '48px', alignItems: 'flex-start' });

const sectionEyebrowStyle = { display: 'block', fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8592a6', marginBottom: '16px' };

const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '18px' };
const fieldLabelStyle = { fontSize: '11.5px', fontWeight: '700', color: '#8592a6' };
const inputStyle = { font: 'inherit', fontSize: '14.5px', color: '#0a192f', background: 'transparent', border: 'none', borderBottom: '1.5px solid #e9edf3', padding: '6px 2px 9px', outline: 'none' };
const textareaStyle = { ...inputStyle, resize: 'vertical', fontFamily: 'inherit' };

const paymentGridStyle = (isMobile) => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px' });
const paymentOptionStyle = (selected) => ({
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '13px 16px', borderRadius: '10px',
  border: selected ? '1.5px solid #0a192f' : '1.5px solid #e9edf3',
  backgroundColor: selected ? '#f6f8fb' : '#fff',
  color: selected ? '#0a192f' : '#3c4a63',
  fontSize: '13px', fontWeight: '700', cursor: 'pointer',
  transition: 'border-color 0.15s ease, background-color 0.15s ease'
});

const itemRowStyle = { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid #e9edf3' };
const itemThumbStyle = { width: '52px', height: '66px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#f6f8fb', flexShrink: 0 };
const itemNameStyle = { fontSize: '13.5px', fontWeight: '700', color: '#0a192f' };
const itemMetaStyle = { fontSize: '12px', color: '#8592a6', fontWeight: '600', marginTop: '3px' };
const itemPriceStyle = { fontSize: '13.5px', fontWeight: '800', color: '#0a192f', whiteSpace: 'nowrap' };

const summaryStyle = (isMobile) => ({
  width: isMobile ? '100%' : '300px', flexShrink: 0, position: isMobile ? 'static' : 'sticky', top: '24px',
  display: 'flex', flexDirection: 'column', gap: '14px', padding: '24px', borderRadius: '14px', backgroundColor: '#f6f8fb'
});
const summaryEyebrowStyle = { fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8592a6' };
const summaryLineStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#3c4a63', fontWeight: '600' };
const summaryDividerStyle = { height: '1px', background: '#e2e8f0', margin: '2px 0' };
const summaryTotalStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '16.5px', fontWeight: '800', color: '#0a192f' };
const placeOrderBtnStyle = (disabled) => ({ marginTop: '6px', background: disabled ? '#64748b' : '#0a192f', color: '#fff', border: 'none', padding: '14px', borderRadius: '100px', fontSize: '13.5px', fontWeight: '800', letterSpacing: '0.02em', cursor: disabled ? 'default' : 'pointer' });
const disclaimerStyle = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' };
const errorStyle = { fontSize: '12.5px', color: '#dc2626', fontWeight: '700' };

const confirmWrapStyle = { width: '100%', maxWidth: '460px', margin: '90px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif' };
const confirmIconStyle = { width: '58px', height: '58px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' };
const confirmTitleStyle = { fontSize: '22px', fontWeight: '800', color: '#0a192f', margin: 0 };
const confirmTextStyle = { fontSize: '14px', color: '#3c4a63', lineHeight: '1.6', margin: 0 };
const confirmActionsStyle = { display: 'flex', gap: '12px', marginTop: '10px' };
const confirmPrimaryBtnStyle = { background: '#0a192f', color: '#fff', border: 'none', padding: '13px 26px', borderRadius: '100px', fontSize: '13px', fontWeight: '800', textDecoration: 'none' };
const confirmSecondaryBtnStyle = { background: 'none', color: '#0a192f', border: '1px solid #e2e8f0', padding: '13px 26px', borderRadius: '100px', fontSize: '13px', fontWeight: '800', textDecoration: 'none' };

export default Checkout;
