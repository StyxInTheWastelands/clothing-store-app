import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSessionValid, clearSession } from '../utils/auth';
import { useToast } from './ToastContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchFavorites = useCallback(async () => {
    if (!isSessionValid()) {
      clearSession(); // token może istnieć, ale być przeterminowany
      setFavorites([]);
      return;
    }
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setFavorites(await response.json());
      } else if (response.status === 401 || response.status === 403) {
        clearSession();
        setFavorites([]);
      }
    } catch (err) {
      console.error('Błąd ładowania ulubionych:', err);
    }
  }, []);

  // Ładujemy ulubione przy starcie i za każdym razem, gdy użytkownik loguje się/wylogowuje na innej karcie
  useEffect(() => {
    fetchFavorites();
    window.addEventListener('storage', fetchFavorites);
    return () => window.removeEventListener('storage', fetchFavorites);
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (productId) => favorites.some((item) => item.id === productId),
    [favorites]
  );

  const toggleFavorite = useCallback(async (product) => {
    if (!isSessionValid()) {
      clearSession();
      showToast('Musisz się zalogować, aby dodać produkt do ulubionych!', 'error');
      navigate('/auth');
      return;
    }
    const token = localStorage.getItem('token');

    const alreadyFavorite = favorites.some((item) => item.id === product.id);

    if (alreadyFavorite) {
      // Optymistyczne usunięcie z interfejsu
      setFavorites((prev) => prev.filter((item) => item.id !== product.id));
      try {
        const response = await fetch(`${API_URL}/api/favorites/${product.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Nie udało się usunąć z ulubionych');
      } catch (err) {
        console.error(err);
        setFavorites((prev) => [...prev, product]); // cofnięcie zmiany w razie błędu
      }
    } else {
      // Optymistyczne dodanie do interfejsu
      setFavorites((prev) => [...prev, product]);
      try {
        const response = await fetch(`${API_URL}/api/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product.id })
        });
        if (!response.ok) throw new Error('Nie udało się dodać do ulubionych');
      } catch (err) {
        console.error(err);
        setFavorites((prev) => prev.filter((item) => item.id !== product.id)); // cofnięcie zmiany w razie błędu
      }
    }
  }, [favorites, navigate, showToast]);

  const value = {
    favorites,
    favoritesCount: favorites.length,
    isFavorite,
    toggleFavorite,
    refreshFavorites: fetchFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites musi być używane wewnątrz FavoritesProvider');
  }
  return ctx;
}
