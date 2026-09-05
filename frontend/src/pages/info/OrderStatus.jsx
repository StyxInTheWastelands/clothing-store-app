import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSessionValid } from '../../utils/auth';
import { nightSkyBackground, nightSkyBackgroundSize, nightSkyBackgroundRepeat } from '../../styles/nightSkyBackground';
import usePageMeta from '../../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STAGE_LABELS = ['Złożone', 'Przyjęte', 'Wysłane', 'Dostarczone'];

function OrderStatus() {
  usePageMeta('Status zamówienia', 'Sprawdź status swojego zamówienia w Urban Stitch.');
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCheck = async (e) => {
    e.preventDefault();

    if (!isSessionValid()) {
      setError('Zaloguj się, aby sprawdzić status swojego zamówienia.');
      return;
    }

    const cleanId = orderId.trim().replace(/^#?(ST-)?/i, '');
    if (!/^\d+$/.test(cleanId)) {
      setError('Podaj sam numer zamówienia (np. 12).');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders/${cleanId}`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();

      if (res.ok) {
        setOrder(data);
      } else {
        setError(data.message || 'Nie znaleziono zamówienia.');
      }
    } catch (err) {
      console.error(err);
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  };

  // Krok (1-4), na którym aktualnie znajduje się zamówienie, dla paska postępu
  const currentStep = order ? order.timeline.filter((s) => s.done).length : 0;

  return (
    <div style={{ ...backgroundContainerStyle, padding: isMobile ? '0' : '40px 0' }}>
      <div style={{
        width: '100%',
        maxWidth: '700px',
        backgroundColor: '#FFFFFF',
        borderRadius: isMobile ? '0' : '12px',
        boxShadow: isMobile ? 'none' : '0 10px 30px rgba(0,0,0,0.3)',
        padding: isMobile ? '40px 20px' : '50px 40px',
        boxSizing: 'border-box',
        minHeight: '55vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>

        <h1 style={{
          fontSize: isMobile ? '24px' : '28px',
          fontWeight: '900',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          margin: '0 0 15px 0',
          textAlign: 'center',
          color: '#0a192f'
        }}>
          Status Zamówienia
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#4b5563',
          lineHeight: '1.6',
          textAlign: 'center',
          margin: '0 0 30px 0'
        }}>
          Wprowadź numer swojego zamówienia, aby sprawdzić jego aktualny status w systemie <strong>STITCH</strong>.
        </p>

        <form onSubmit={handleCheck} style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '15px',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <input
            type="text"
            placeholder="np. #12 lub ST-12"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            style={{
              padding: '14px 18px',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '15px',
              outline: 'none',
              width: '100%',
              maxWidth: isMobile ? '100%' : '320px',
              boxSizing: 'border-box',
              backgroundColor: '#f9fafb'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#0a192f',
              color: '#fff',
              border: 'none',
              padding: '14px 30px',
              borderRadius: '6px',
              cursor: loading ? 'default' : 'pointer',
              fontWeight: '700',
              fontSize: '15px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              width: isMobile ? '100%' : 'auto',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Szukanie...' : 'Sprawdź'}
          </button>
        </form>

        {error && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#dc2626', fontSize: '13.5px', fontWeight: '600', margin: 0 }}>{error}</p>
            {error.includes('Zaloguj') && (
              <button
                onClick={() => navigate('/auth')}
                style={{ marginTop: '10px', background: 'none', border: 'none', color: '#0a192f', textDecoration: 'underline', cursor: 'pointer', fontSize: '13.5px', fontWeight: '700' }}
              >
                Przejdź do logowania
              </button>
            )}
          </div>
        )}

        {order && (
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px',
            backgroundColor: '#f8fafc',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1e293b' }}>
              Wyniki dla zamówienia: <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0a192f' }}>#{order.id}</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
              <div>
                <span style={labelStyle}>Aktualny status:</span>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: order.status === 'Dostarczone' ? '#dcfce7' : '#fef3c7',
                  color: order.status === 'Dostarczone' ? '#15803d' : '#b45309',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  marginTop: '4px'
                }}>
                  {order.status}
                </span>
              </div>
              <div>
                <span style={labelStyle}>Data złożenia:</span>
                <span style={valueStyle}>{new Date(order.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div>
                <span style={labelStyle}>Metoda płatności:</span>
                <span style={valueStyle}>{order.payment_method}</span>
              </div>
              <div>
                <span style={labelStyle}>Adres dostawy:</span>
                <span style={valueStyle}>{order.shipping_address}</span>
              </div>
            </div>

            {/* WIZUALNY PASEK POSTĘPU */}
            <div>
              <span style={labelStyle}>Postęp zamówienia:</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '15px', position: 'relative' }}>

                <div style={{ position: 'absolute', top: '10px', left: '0', right: '0', height: '4px', backgroundColor: '#e2e8f0', zIndex: 1 }}></div>
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '0',
                  width: `${((currentStep - 1) / (STAGE_LABELS.length - 1)) * 100}%`,
                  height: '4px',
                  backgroundColor: '#0a192f',
                  zIndex: 2,
                  transition: 'width 0.5s ease'
                }}></div>

                {STAGE_LABELS.map((label, index) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '25%' }}>
                    <div style={{ ...dotStyle, backgroundColor: currentStep >= index + 1 ? '#0a192f' : '#e2e8f0', color: currentStep >= index + 1 ? '#fff' : '#64748b' }}>
                      {index + 1}
                    </div>
                    <span style={stepLabelStyle}>{label}</span>
                  </div>
                ))}

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// STYLE
const backgroundContainerStyle = {
  minHeight: '80vh',
  background: nightSkyBackground,
  backgroundSize: nightSkyBackgroundSize, backgroundRepeat: nightSkyBackgroundRepeat,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 0',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: '#64748b',
  textTransform: 'uppercase',
  fontWeight: '600',
  letterSpacing: '0.5px'
};

const valueStyle = {
  display: 'block',
  fontSize: '15px',
  color: '#0f172a',
  fontWeight: '600',
  marginTop: '2px'
};

const dotStyle = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: '700',
  marginBottom: '6px',
  boxShadow: '0 0 0 4px #fff'
};

const stepLabelStyle = {
  fontSize: '10px',
  fontWeight: '600',
  color: '#475569',
  textAlign: 'center'
};

export default OrderStatus;
