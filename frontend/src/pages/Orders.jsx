import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STATUS_STYLES = {
  'W realizacji': { color: '#b45309', background: '#fdf1e2' },
  'Wysłane': { color: '#0077b6', background: '#e0f4fa' },
  'Dostarczone': { color: '#15803d', background: '#e8f6ec' },
  'Anulowane': { color: '#64748b', background: '#eef1f5' }
};

function statusStyle(status) {
  return STATUS_STYLES[status] || { color: '#64748b', background: '#eef1f5' };
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Orders() {
  usePageMeta('Moje zamówienia', 'Historia Twoich zamówień w Urban Stitch.');
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 680);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 680);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/orders`, {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (res.ok) {
          setOrders(await res.json());
        }
      } catch (err) {
        console.error('Błąd pobierania historii zamówień:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div style={pageWrapStyle}>
      <div style={pageStyle(isMobile)}>

        <div style={headStyle}>
          <Link to="/moje-konto" style={backLinkStyle}>&larr; Moje konto</Link>
          <h1 style={titleStyle}>Moje zakupy</h1>
          <span style={subtitleStyle}>
            {loading ? 'Ładowanie…' : `${orders.length} ${orders.length === 1 ? 'zamówienie' : 'zamówień'}`}
          </span>
        </div>

        {!loading && orders.length === 0 && (
          <div style={emptyStateStyle}>
            <p style={emptyTextStyle}>Nie masz jeszcze żadnych zamówień.</p>
            <Link to="/" style={emptyLinkStyle}>Wróć do sklepu →</Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {orders.map((order) => {
            const st = statusStyle(order.status);
            return (
              <div key={order.id} style={orderCardStyle}>
                <div style={orderHeadRowStyle(isMobile)}>
                  <div>
                    <span style={orderNumberStyle}>Zamówienie #{order.id}</span>
                    <span style={orderDateStyle}> · {formatDate(order.created_at)}</span>
                  </div>
                  <span style={{ ...chipStyle, color: st.color, backgroundColor: st.background }}>{order.status}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={itemRowStyle}>
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        style={itemThumbStyle}
                        onClick={() => navigate(`/product/${item.product_id}`)}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={itemNameStyle}>{item.product_name}</div>
                        <div style={itemMetaStyle}>
                          {item.size && `Rozmiar ${item.size} · `}Ilość: {item.quantity}
                        </div>
                      </div>
                      <span style={itemPriceStyle}>{(parseFloat(item.price) * item.quantity).toFixed(2)} PLN</span>
                    </div>
                  ))}
                </div>

                <div style={orderFootRowStyle(isMobile)}>
                  <span style={paymentInfoStyle}>Płatność: {order.payment_method} · Dostawa: {order.shipping_address}</span>
                  <span style={orderTotalStyle}>Razem: {parseFloat(order.total).toFixed(2)} PLN</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

// STYLE
const pageWrapStyle = { minHeight: '100vh', width: '100%', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', boxSizing: 'border-box', fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif' };
const pageStyle = (isMobile) => ({ width: '100%', maxWidth: '860px', boxSizing: 'border-box', padding: isMobile ? '28px 18px 70px' : '44px 24px 90px' });

const headStyle = { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '34px' };
const backLinkStyle = { fontSize: '12.5px', fontWeight: '700', color: '#8592a6', textDecoration: 'none' };
const titleStyle = { fontSize: '26px', fontWeight: '800', letterSpacing: '0.01em', color: '#0a192f', margin: 0 };
const subtitleStyle = { fontSize: '13.5px', color: '#8592a6', fontWeight: '600' };

const emptyStateStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '80px 20px', textAlign: 'center' };
const emptyTextStyle = { fontSize: '15px', color: '#3c4a63', margin: 0, fontWeight: '600' };
const emptyLinkStyle = { fontSize: '13.5px', color: '#00b4d8', fontWeight: '700', textDecoration: 'none' };

const orderCardStyle = { border: '1px solid #e9edf3', borderRadius: '14px', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '4px' };
const orderHeadRowStyle = (isMobile) => ({ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' });
const orderNumberStyle = { fontSize: '14.5px', fontWeight: '800', color: '#0a192f' };
const orderDateStyle = { fontSize: '12.5px', color: '#8592a6', fontWeight: '600' };
const chipStyle = { fontSize: '11px', fontWeight: '800', letterSpacing: '0.03em', padding: '5px 11px', borderRadius: '100px', whiteSpace: 'nowrap' };

const itemRowStyle = { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: '1px solid #f1f4f8' };
const itemThumbStyle = { width: '46px', height: '58px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#f6f8fb', flexShrink: 0, cursor: 'pointer' };
const itemNameStyle = { fontSize: '13px', fontWeight: '700', color: '#0a192f' };
const itemMetaStyle = { fontSize: '11.5px', color: '#8592a6', fontWeight: '600', marginTop: '2px' };
const itemPriceStyle = { fontSize: '13px', fontWeight: '800', color: '#0a192f', whiteSpace: 'nowrap' };

const orderFootRowStyle = (isMobile) => ({ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '8px', paddingTop: '14px' });
const paymentInfoStyle = { fontSize: '11.5px', color: '#8592a6', fontWeight: '600' };
const orderTotalStyle = { fontSize: '14.5px', fontWeight: '800', color: '#0a192f' };

export default Orders;
