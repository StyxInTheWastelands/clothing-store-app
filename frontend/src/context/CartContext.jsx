import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSessionValid, clearSession } from '../utils/auth';
import { useToast } from './ToastContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchCart = useCallback(async () => {
    if (!isSessionValid()) {
      clearSession();
      setCartItems([]);
      return;
    }
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setCartItems(await response.json());
      } else if (response.status === 401 || response.status === 403) {
        clearSession();
        setCartItems([]);
      }
    } catch (err) {
      console.error('Błąd ładowania koszyka:', err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    window.addEventListener('storage', fetchCart);
    return () => window.removeEventListener('storage', fetchCart);
  }, [fetchCart]);

  const addToCart = useCallback(async (product, { size = '', quantity = 1 } = {}) => {
    if (!isSessionValid()) {
      clearSession();
      showToast('Musisz się zalogować, aby dodać produkt do koszyka!', 'error');
      navigate('/auth');
      return false;
    }
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id, size, quantity })
      });
      if (response.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Błąd dodawania do koszyka:', err);
      return false;
    }
  }, [fetchCart, navigate, showToast]);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    if (quantity < 1) return;
    const token = localStorage.getItem('token');

    setCartItems((prev) => prev.map((item) =>
      item.cart_item_id === cartItemId ? { ...item, quantity } : item
    ));

    try {
      const response = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      if (!response.ok) throw new Error('Nie udało się zaktualizować ilości');
    } catch (err) {
      console.error(err);
      fetchCart(); // synchronizujemy się z serwerem w razie błędu
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (cartItemId) => {
    const token = localStorage.getItem('token');
    const previousItems = cartItems;

    setCartItems((prev) => prev.filter((item) => item.cart_item_id !== cartItemId));

    try {
      const response = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Nie udało się usunąć z koszyka');
    } catch (err) {
      console.error(err);
      setCartItems(previousItems); // cofnięcie zmiany w razie błędu
    }
  }, [cartItems]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  const value = {
    cartItems,
    cartCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart: fetchCart,
    clearCartLocal: () => setCartItems([])
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart musi być używane wewnątrz CartProvider');
  }
  return ctx;
}
