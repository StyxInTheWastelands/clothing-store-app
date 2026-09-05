import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Przy każdej zmianie pathname (czyli adresu URL) przewijamy okno na samą górę
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Komponent nic nie renderuje wizualnie
}

export default ScrollToTop;