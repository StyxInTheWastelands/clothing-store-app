import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Match from './pages/Match';
import Header from './components/Header';
import NavigationIsland from './components/NavigationIsland';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import ProductPage from './pages/ProductPage';
import ScrollToTop from './components/ScrollToTop';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

import OrderStatus from './pages/info/OrderStatus';
import Shipping from './pages/info/Shipping';
import Returns from './pages/info/Returns';
import Contact from './pages/info/Contact';
import Terms from './pages/info/Terms';
import Privacy from './pages/info/Privacy';

import WomenNew from './pages/WomenNew';
import MenNew from './pages/MenNew';
import WomenSale from './pages/WomenSale';
import MenSale from './pages/MenSale';
import WomenShirts from './pages/WomenShirts';
import MenShirts from './pages/MenShirts';
import WomenPants from './pages/WomenPants';
import MenPants from './pages/MenPants';
import WomenShortsAndSkirts from './pages/WomenShortsAndSkirts';
import MenShorts from './pages/MenShorts';
import WomenSweaters from './pages/WomenSweaters';
import MenSweaters from './pages/MenSweaters';
import WomenJackets from './pages/WomenJackets';
import MenJackets from './pages/MenJackets';
import WomenAccessories from './pages/WomenAccessories';
import MenAccessories from './pages/MenAccessories';

import Favorites from './pages/Favorites';
import MyAccount from './pages/MyAccount';
import Admin from './pages/Admin';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import ProtectedRoute from './components/ProtectedRoute';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ToastProvider>
      <FavoritesProvider>
      <CartProvider>
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/match" element={<Match />} />
          <Route path="/product/:prodId/:quality/:colorId" element={<ProductPage />} />

          {/* 2. Додаємо новий роут для авторизації */}
          <Route path="/auth" element={<Auth />} />

          <Route path="/status-zamowienia" element={<OrderStatus />} />
          <Route path="/wysylka-i-dostawa" element={<Shipping />} />
          <Route path="/zwroty-i-reklamacje" element={<Returns />} />
          <Route path="/kontakt" element={<Contact />} />
          <Route path="/regulamin" element={<Terms />} />
          <Route path="/polityka-prywatnosci" element={<Privacy />} />
          <Route path="/cookies" element={<Privacy />} />

          <Route path="/women-nowosci" element={<WomenNew />} />
          <Route path="/men-nowosci" element={<MenNew />} />
          <Route path="/women-wyprzedaz" element={<WomenSale />} />
          <Route path="/men-wyprzedaz" element={<MenSale />} />
          <Route path="/women-koszulki" element={<WomenShirts />} />
          <Route path="/men-koszulki" element={<MenShirts />} />
          <Route path="/women-spodnie" element={<WomenPants />} />
          <Route path="/men-spodnie" element={<MenPants />} />
          <Route path="/women-spodenki-spodnice" element={<WomenShortsAndSkirts />} />
          <Route path="/men-spodenki" element={<MenShorts />} />
          <Route path="/women-bluzy-swetry" element={<WomenSweaters />} />
          <Route path="/men-bluzy-swetry" element={<MenSweaters />} />
          <Route path="/women-kurtki" element={<WomenJackets />} />
          <Route path="/men-kurtki" element={<MenJackets />} />
          <Route path="/women-akcesoria" element={<WomenAccessories />} />
          <Route path="/men-akcesoria" element={<MenAccessories />} />
          <Route path="/favorites" element={<Favorites />} />

          <Route
            path="/moje-konto"
            element={
              <ProtectedRoute>
                <MyAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/zakupy"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>

        <Footer />
        <NavigationIsland />
        <CookieBanner />
      </CartProvider>
      </FavoritesProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;