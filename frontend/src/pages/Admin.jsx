import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import usePageMeta from '../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const GENDERS = ['women', 'men'];
const STYLES = ['Casual', 'Streetwear', 'Elegancki', 'Y2K'];
const CATEGORIES = [
  { id: 1, label: 'Koszulki / topy' },
  { id: 5, label: 'Swetry / bluzy' },
  { id: 2, label: 'Spodnie' },
  { id: 3, label: 'Spodenki' },
  { id: 7, label: 'Spódnice' },
  { id: 6, label: 'Akcesoria' },
  { id: 4, label: 'Kurtki' }
];

const EMPTY_PRODUCT = {
  id: '', name: '', description: '', sub_category: '', gender: 'women',
  price: '', sizes: '', color: '', style: 'Casual', image: '',
  category_id: 1, is_sale: false, old_price: '', collection: 'regular'
};

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };
}

function Admin() {
  usePageMeta('Panel administratora', 'Panel administracyjny Urban Stitch — zarządzanie katalogiem produktów.');
  const { showToast } = useToast();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/check`, { headers: authHeaders() })
      .then((res) => setIsAdmin(res.ok))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return <div style={pageWrapStyle}><p style={{ padding: '80px 0', textAlign: 'center', color: '#8592a6' }}>Sprawdzanie dostępu…</p></div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={pageWrapStyle}>
      <div style={pageStyle}>
        <h1 style={titleStyle}>Panel administratora</h1>
        <AddProductForm showToast={showToast} />
        <EditPriceForm showToast={showToast} />
      </div>
    </div>
  );
}

function AddProductForm({ showToast }) {
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (e) => {
    const value = field === 'is_sale' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sizesArray = form.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    if (!form.id || !form.name || !form.price || sizesArray.length === 0 || !form.color || !form.image) {
      showToast('Uzupełnij wymagane pola: ID, nazwa, cena, rozmiary, kolor, zdjęcie.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...form,
          sizes: sizesArray,
          category_id: Number(form.category_id),
          price: parseFloat(form.price),
          old_price: form.old_price ? parseFloat(form.old_price) : null,
          description: form.description || null,
          sub_category: form.sub_category || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Produkt dodany do bazy.', 'success');
        setForm(EMPTY_PRODUCT);
      } else {
        showToast(data.message || 'Nie udało się dodać produktu.', 'error');
      }
    } catch (err) {
      console.error('Błąd dodawania produktu:', err);
      showToast('Błąd połączenia z serwerem.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Dodaj nowy produkt</h2>
      <form onSubmit={handleSubmit} style={formGridStyle}>
        <Field label="ID (np. 9999/501/800)" value={form.id} onChange={setField('id')} />
        <Field label="Nazwa" value={form.name} onChange={setField('name')} />
        <Field label="Opis" value={form.description} onChange={setField('description')} />
        <Field label="Podkategoria" value={form.sub_category} onChange={setField('sub_category')} />

        <SelectField label="Płeć" value={form.gender} onChange={setField('gender')} options={GENDERS.map((g) => ({ value: g, label: g }))} />
        <SelectField label="Styl" value={form.style} onChange={setField('style')} options={STYLES.map((s) => ({ value: s, label: s }))} />
        <SelectField label="Kategoria" value={form.category_id} onChange={setField('category_id')} options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))} />
        <Field label="Kolor" value={form.color} onChange={setField('color')} />

        <Field label="Cena (PLN)" value={form.price} onChange={setField('price')} type="number" />
        <Field label="Stara cena (opcjonalnie)" value={form.old_price} onChange={setField('old_price')} type="number" />
        <Field label="Rozmiary (przez przecinek: S, M, L)" value={form.sizes} onChange={setField('sizes')} />
        <Field label="Kolekcja" value={form.collection} onChange={setField('collection')} />

        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="URL zdjęcia" value={form.image} onChange={setField('image')} />
        </div>

        <label style={checkboxRowStyle}>
          <input type="checkbox" checked={form.is_sale} onChange={setField('is_sale')} />
          Produkt w wyprzedaży
        </label>

        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" disabled={submitting} style={submitBtnStyle}>
            {submitting ? 'Dodawanie…' : 'Dodaj produkt'}
          </button>
        </div>
      </form>
    </section>
  );
}

function EditPriceForm({ showToast }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [isSale, setIsSale] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then(setProducts)
      .catch((err) => console.error('Błąd ładowania produktów:', err));
  }, []);

  const matches = query.length >= 2
    ? products.filter((p) => p.id.includes(query) || p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
    : [];

  const selectProduct = useCallback((product) => {
    setSelectedId(product.id);
    setQuery(`${product.name} (${product.id})`);
    setPrice(product.price || '');
    setOldPrice(product.old_price || '');
    setIsSale(!!product.is_sale);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedId || !price) {
      showToast('Wybierz produkt i podaj cenę.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${selectedId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ price: parseFloat(price), old_price: oldPrice ? parseFloat(oldPrice) : null, is_sale: isSale })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Cena zaktualizowana.', 'success');
        setProducts((prev) => prev.map((p) => (p.id === selectedId ? data.product : p)));
      } else {
        showToast(data.message || 'Nie udało się zapisać zmian.', 'error');
      }
    } catch (err) {
      console.error('Błąd edycji ceny:', err);
      showToast('Błąd połączenia z serwerem.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Edytuj cenę istniejącego produktu</h2>
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedId(''); }}
          placeholder="Szukaj po nazwie lub ID…"
          style={inputStyle}
        />
        {matches.length > 0 && !selectedId && (
          <div style={dropdownStyle}>
            {matches.map((p) => (
              <button key={p.id} type="button" onClick={() => selectProduct(p)} style={dropdownItemStyle}>
                {p.name} <span style={{ color: '#8592a6' }}>({p.id})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedId && (
        <form onSubmit={handleSave} style={formGridStyle}>
          <Field label="Cena (PLN)" value={price} onChange={(e) => setPrice(e.target.value)} type="number" />
          <Field label="Stara cena (opcjonalnie)" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} type="number" />
          <label style={checkboxRowStyle}>
            <input type="checkbox" checked={isSale} onChange={(e) => setIsSale(e.target.checked)} />
            Produkt w wyprzedaży
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={saving} style={submitBtnStyle}>
              {saving ? 'Zapisywanie…' : 'Zapisz cenę'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <input type={type} value={value} onChange={onChange} style={inputStyle} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <select value={value} onChange={onChange} style={inputStyle}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

const pageWrapStyle = { minHeight: '100vh', width: '100%', backgroundColor: '#f6f8fb', display: 'flex', justifyContent: 'center', boxSizing: 'border-box', fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif' };
const pageStyle = { width: '100%', maxWidth: '820px', padding: '44px 24px 90px', boxSizing: 'border-box' };
const titleStyle = { fontSize: '24px', fontWeight: '800', color: '#0a192f', margin: '0 0 28px' };

const sectionStyle = { background: '#fff', border: '1px solid #e9edf3', borderRadius: '16px', padding: '28px', marginBottom: '24px' };
const sectionTitleStyle = { fontSize: '16px', fontWeight: '800', color: '#0a192f', margin: '0 0 20px' };

const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };
const fieldLabelStyle = { display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#8592a6', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13.5px', boxSizing: 'border-box', color: '#0a192f' };
const checkboxRowStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#0a192f' };
const submitBtnStyle = { padding: '13px 28px', borderRadius: '100px', border: 'none', background: '#0a192f', color: '#fff', fontSize: '13px', fontWeight: '800', cursor: 'pointer' };

const dropdownStyle = { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', marginTop: '4px', maxHeight: '260px', overflowY: 'auto', zIndex: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
const dropdownItemStyle = { display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#0a192f' };

export default Admin;
