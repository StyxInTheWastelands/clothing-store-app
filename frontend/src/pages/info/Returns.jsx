import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { isSessionValid } from '../../utils/auth';
import { useToast } from '../../context/ToastContext';
import { nightSkyBackground, nightSkyBackgroundSize, nightSkyBackgroundRepeat } from '../../styles/nightSkyBackground';
import usePageMeta from '../../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const RETURN_REASONS = ['Zły rozmiar', 'Produkt uszkodzony', 'Produkt niezgodny z opisem', 'Zmieniłam/em zdanie', 'Inny powód'];

const RETURN_STATUS_STYLES = {
  'Nowe zgłoszenie': { color: '#00f2fe', background: 'rgba(0, 242, 254, 0.1)' },
  'W trakcie rozpatrywania': { color: '#facc15', background: 'rgba(250, 204, 21, 0.1)' },
  'Zaakceptowano': { color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)' },
  'Odrzucono': { color: '#f87171', background: 'rgba(248, 113, 113, 0.1)' }
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Returns() {
  usePageMeta('Zwroty i reklamacje', 'Zgłoś zwrot lub reklamację produktu zakupionego w Urban Stitch.');
  const { showToast } = useToast();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const loggedIn = isSessionValid();

  const [orders, setOrders] = useState([]);
  const [myReturns, setMyReturns] = useState([]);
  const [loading, setLoading] = useState(loggedIn);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadData = useCallback(async () => {
    if (!loggedIn) return;
    const token = localStorage.getItem('token');
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        fetch(`${API_URL}/api/orders`, { headers: { Authorization: 'Bearer ' + token } }),
        fetch(`${API_URL}/api/returns`, { headers: { Authorization: 'Bearer ' + token } })
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (returnsRes.ok) setMyReturns(await returnsRes.json());
    } catch (err) {
      console.error('Błąd ładowania danych zwrotu:', err);
    } finally {
      setLoading(false);
    }
  }, [loggedIn]);

  useEffect(() => { loadData(); }, [loadData]);

  const returnedItemIds = new Set(myReturns.map((r) => r.order_item_id));
  const returnableItems = orders.flatMap((order) =>
    order.items
      .filter((item) => !returnedItemIds.has(item.id))
      .map((item) => ({ ...item, orderId: order.id, orderDate: order.created_at }))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !reason) {
      showToast('Wybierz produkt i powód zwrotu.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ orderItemId: Number(selectedItemId), reason })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Zgłoszenie zwrotu zostało złożone.', 'success');
        setSelectedItemId('');
        setReason('');
        loadData();
      } else {
        showToast(data.message || 'Nie udało się złożyć zgłoszenia.', 'error');
      }
    } catch (err) {
      console.error('Błąd wysyłania zgłoszenia zwrotu:', err);
      showToast('Błąd połączenia z serwerem.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={backgroundContainerStyle}>
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '40px',
        padding: '20px',
        boxSizing: 'border-box'
      }}>

        {/* LEWY PANEL: Główny komunikat (Przyciągający wzrok badge) */}
        <div style={{
          flex: '1',
          backgroundColor: '#112240',
          border: '1px solid #233554',
          borderRadius: '16px',
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(0,242,254,0.15) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>

          <h1 style={mainTitleStyle}>Zwroty i Reklamacje</h1>
          <div style={decorLineStyle}></div>

          <div style={daysCircleStyle}>
            <span style={{ fontSize: '48px', fontWeight: '900', color: '#00f2fe', lineHeight: '1' }}>30</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>Dni</span>
          </div>

          <p style={highlightTextStyle}>
            Dbamy o Twój komfort. Jeśli zakupiony produkt nie spełnia Twoich oczekiwań, masz aż <strong>30 dni</strong> na darmowy zwrot towaru bez podania przyczyny.
          </p>
        </div>

        {/* PRAWY PANEL: Instrukcja krok po kroku */}
        <div style={{
          flex: '1.5',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: isMobile ? '30px 20px' : '40px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h2 style={sectionTitleStyle}>Jak dokonać zwrotu?</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px' }}>

            <div style={stepContainerStyle}>
              <div style={stepNumberStyle}>01</div>
              <div style={stepContentStyle}>
                <h4 style={stepTitleStyle}>Zgłoś zwrot poniżej</h4>
                <p style={stepDescriptionStyle}>Wybierz produkt z Twojego zamówienia i podaj powód zwrotu w formularzu na dole tej strony.</p>
              </div>
            </div>

            <div style={stepContainerStyle}>
              <div style={stepNumberStyle}>02</div>
              <div style={stepContentStyle}>
                <h4 style={stepTitleStyle}>Zapakuj produkt</h4>
                <p style={stepDescriptionStyle}>Zapakuj bezpiecznie produkt przeznaczony do zwrotu. Jeśli to możliwe, użyj oryginalnego opakowania.</p>
              </div>
            </div>

            <div style={stepContainerStyle}>
              <div style={stepNumberStyle}>03</div>
              <div style={stepContentStyle}>
                <h4 style={stepTitleStyle}>Nadaj paczkę</h4>
                <p style={stepDescriptionStyle}>Po zaakceptowaniu zgłoszenia nadaj paczkę w najbliższym Paczkomacie InPost o dowolnej porze (24/7).</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* FORMULARZ ZGŁOSZENIA + LISTA WŁASNYCH ZGŁOSZEŃ */}
      <div style={{ width: '100%', maxWidth: '1100px', padding: '0 20px 20px', boxSizing: 'border-box' }}>
        <div style={formPanelStyle(isMobile)}>
          <h2 style={sectionTitleStyle}>Złóż zgłoszenie zwrotu</h2>

          {!loggedIn ? (
            <p style={{ ...highlightTextStyle, textAlign: 'left' }}>
              <Link to="/auth" style={{ color: '#00f2fe' }}>Zaloguj się</Link>, aby zgłosić zwrot produktu z Twojego zamówienia.
            </p>
          ) : loading ? (
            <p style={{ ...highlightTextStyle, textAlign: 'left' }}>Ładowanie Twoich zamówień…</p>
          ) : returnableItems.length === 0 ? (
            <p style={{ ...highlightTextStyle, textAlign: 'left' }}>Nie masz produktów dostępnych do zwrotu.</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              <div>
                <label style={fieldLabelStyle}>Produkt</label>
                <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} style={selectStyle}>
                  <option value="">— Wybierz produkt —</option>
                  {returnableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      #{item.orderId} · {item.product_name} ({item.size}) · {formatDate(item.orderDate)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={fieldLabelStyle}>Powód zwrotu</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} style={selectStyle}>
                  <option value="">— Wybierz powód —</option>
                  {RETURN_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={submitting} style={submitBtnStyle}>
                {submitting ? 'Wysyłanie…' : 'Zgłoś zwrot'}
              </button>
            </form>
          )}
        </div>

        {loggedIn && myReturns.length > 0 && (
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={sectionTitleStyle}>Twoje zgłoszenia</h2>
            {myReturns.map((r) => {
              const st = RETURN_STATUS_STYLES[r.status] || RETURN_STATUS_STYLES['Nowe zgłoszenie'];
              return (
                <div key={r.id} style={returnCardStyle}>
                  <img src={r.product_image} alt={r.product_name} style={returnImgStyle} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>{r.product_name}</div>
                    <div style={{ color: '#8892b0', fontSize: '12.5px', marginTop: '4px' }}>Rozmiar: {r.size} · Powód: {r.reason}</div>
                    <div style={{ color: '#8892b0', fontSize: '12px', marginTop: '2px' }}>Zgłoszono: {formatDate(r.created_at)}</div>
                  </div>
                  <span style={{ ...returnStatusBadgeStyle, color: st.color, background: st.background }}>{r.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// STYLIZACJA (Split-Layout Glassmorphism Theme)
const backgroundContainerStyle = {
  minHeight: '85vh',
  background: nightSkyBackground,
  backgroundSize: nightSkyBackgroundSize, backgroundRepeat: nightSkyBackgroundRepeat,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px 0',
  boxSizing: 'border-box',
  fontFamily: 'system-ui, -apple-system, sans-serif'
};

const mainTitleStyle = {
  fontSize: '26px',
  fontWeight: '800',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#ffffff',
  margin: '0 0 10px 0'
};

const decorLineStyle = {
  width: '50px',
  height: '4px',
  backgroundColor: '#00f2fe',
  marginBottom: '30px',
  borderRadius: '2px'
};

const daysCircleStyle = {
  width: '110px',
  height: '110px',
  borderRadius: '50%',
  border: '2px dashed rgba(0, 242, 254, 0.4)',
  backgroundColor: 'rgba(0, 242, 254, 0.03)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '30px',
  boxShadow: '0 0 20px rgba(0, 242, 254, 0.05)'
};

const highlightTextStyle = {
  fontSize: '15px',
  color: '#8892b0',
  lineHeight: '1.6',
  margin: 0
};

const sectionTitleStyle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 20px 0',
  letterSpacing: '0.5px'
};

const stepContainerStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '20px'
};

const stepNumberStyle = {
  fontSize: '22px',
  fontWeight: '900',
  color: '#00f2fe',
  backgroundColor: 'rgba(0, 242, 254, 0.08)',
  padding: '8px 12px',
  borderRadius: '8px',
  fontFamily: 'monospace',
  lineHeight: '1'
};

const stepContentStyle = {
  flex: '1'
};

const stepTitleStyle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 6px 0'
};

const stepDescriptionStyle = {
  fontSize: '14px',
  color: '#a8b2d1',
  lineHeight: '1.5',
  margin: 0
};

const formPanelStyle = (isMobile) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  padding: isMobile ? '30px 20px' : '40px',
  boxSizing: 'border-box'
});

const fieldLabelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: '#8892b0',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '8px'
};

const selectStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid #233554',
  backgroundColor: '#112240',
  color: '#fff',
  fontSize: '13.5px',
  boxSizing: 'border-box'
};

const submitBtnStyle = {
  padding: '14px',
  borderRadius: '100px',
  border: 'none',
  background: '#00f2fe',
  color: '#0a192f',
  fontSize: '13px',
  fontWeight: '800',
  cursor: 'pointer'
};

const returnCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '16px'
};

const returnImgStyle = {
  width: '54px',
  height: '68px',
  objectFit: 'cover',
  borderRadius: '6px',
  backgroundColor: '#112240',
  flexShrink: 0
};

const returnStatusBadgeStyle = {
  fontSize: '11px',
  fontWeight: '700',
  padding: '6px 12px',
  borderRadius: '100px',
  whiteSpace: 'nowrap'
};

export default Returns;
