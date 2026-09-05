import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductRow from '../components/ProductRow';
import usePageMeta from '../hooks/usePageMeta';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const slidesData = [
  {
    id: 1,
    title: "DROP '26: URBAN STITCH",
    subtitle: "Odkryj minimalistyczny streetwear dopasowany do Ciebie.",
    buttonText: "SPRAWDŹ NOWOŚCI",
    image: "https://i.pinimg.com/control1/1200x/c0/7c/51/c07c51259bd663848ccea82b21e7ac03.jpg"
  },
  {
    id: 2,
    title: "MID-SEASON SALE: DO -50%",
    subtitle: "Najlepsze kultowe fasony w wyjątkowych cenach.",
    buttonText: "ZOBACZ WYPRZEDAŻ",
    scrollTarget: 'wyprzedaz',
    image: "https://i.pinimg.com/control1/1200x/1f/c3/35/1fc335d29e08b5844598a0e78550a2df.jpg"
  },
  {
    id: 3,
    title: "ECO-STITCH ECO-FRIENDLY",
    subtitle: "Kolekcja wykonana w 100% z bawełny organicznej.",
    buttonText: "POZNAJ KOLEKCJĘ",
    image: "https://i.pinimg.com/736x/a3/ea/e6/a3eae6ec5c9b10a38fcefcbeb4d35175.jpg"
  }
];

const womenCategories = [
  { id: 1, name: "BLUZY", path: "/women-bluzy-swetry", img: "https://static.bershka.net/assets/public/c5a8/ee21/15084a08ba80/658cc91d1d1d/02641700812-a4o/02641700812-a4o.jpg?ts=1779809190577&w=850&f=auto" },
  { id: 2, name: "SPODNIE", path: "/women-spodnie", img: "https://static.bershka.net/assets/public/1aca/3675/98a44f399c2c/f57a7df558d3/01167797812-a4o/01167797812-a4o.jpg?ts=1765871782220&w=850&f=auto" },
  { id: 3, name: "SPODENKI", path: "/women-spodenki-spodnice", img: "https://static.bershka.net/assets/public/1fad/0f32/c2904b6cbe9c/c01f931c1a4c/00917211433-a4o/00917211433-a4o.jpg?ts=1765900692993&w=850&f=auto" },
  { id: 4, name: "AKCESORIA", path: "/women-akcesoria", img: "https://static.bershka.net/assets/public/207f/a54f/508a45af85e6/f7bafb0a3f22/00227023303-a4o/00227023303-a4o.jpg?ts=1776758360596&w=850&f=auto" },
  { id: 5, name: "KOSZULKI", path: "/women-koszulki", img: "https://static.bershka.net/assets/public/4ff5/04d7/2b1d47b495fa/487ba52a35ec/03941027462-a4o/03941027462-a4o.jpg?ts=1751961228786&w=850&f=auto" },
  { id: 6, name: "KURTKI", path: "/women-kurtki", img: "https://static.bershka.net/assets/public/803c/5310/2f504ed3944c/cdd40f015e44/00030200711-a4o/00030200711-a4o.jpg?ts=1763050542593&w=850&f=auto" }
];

const menCategories = [
  { id: 1, name: "BLUZY", path: "/men-bluzy-swetry", img: "https://static.bershka.net/assets/public/cb6e/0710/dff04ae4b8da/614fe16706b7/02431732810-a4o/02431732810-a4o.jpg?ts=1781853850261&w=850&f=auto" },
  { id: 2, name: "SPODNIE", path: "/men-spodnie", img: "https://static.bershka.net/assets/public/98a2/7bba/efdf4866a1d5/8c189b201d00/01011053800-a4o/01011053800-a4o.jpg?ts=1771315085210&w=850&f=auto" },
  { id: 3, name: "SPODENKI", path: "/men-spodenki", img: "https://static.bershka.net/assets/public/d2c7/bc26/2ec5439e80e0/cdf2dfcc4698/01299352800-a4o/01299352800-a4o.jpg?ts=1773069373363&w=850&f=auto" },
  { id: 4, name: "AKCESORIA", path: "/men-akcesoria", img: "https://static.bershka.net/assets/public/3b57/1dc7/87fd4fed83f3/5d1333290f63/01077419800-a4o/01077419800-a4o.jpg?ts=1769591929832&w=850&f=auto" },
  { id: 5, name: "KOSZULKI", path: "/men-koszulki", img: "https://static.bershka.net/assets/public/e3a4/726e/30eb4cc5a28c/cf0e5e291ac1/00077116401-a4o/00077116401-a4o.jpg?ts=1777977199322&w=850&f=auto" },
  { id: 6, name: "KURTKI", path: "/men-kurtki", img: "https://static.bershka.net/assets/public/683c/c026/4f654f5ba75e/076f1543e504/06770085700-a4o/06770085700-a4o.jpg?ts=1753791240089&w=850&f=auto" }
];

const bannerButtonStyle = {
  backgroundColor: 'transparent',
  color: '#fff',
  border: '2px solid #fff',
  padding: '12px 30px',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  borderRadius: '2px'
};

// Style strzałek nawigacji z efektem matowego szkła (glassmorphism)
const arrowStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  color: '#fff',
  fontSize: '30px',
  width: '55px',
  height: '55px',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  transition: 'all 0.3s ease',
  userSelect: 'none'
};

function Home() {
  usePageMeta(null, 'Urban Stitch — minimalistyczny streetwear z inteligentnym systemem rekomendacji dopasowanym do Twojego stylu.');
  const [products, setProducts] = useState([]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [womenCatIndex, setWomenCatIndex] = useState(0);
  const [menCatIndex, setMenCatIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const visibleCatCount = isMobile ? 2 : 4;
  const wyprzedazRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Resetujemy indeks przy zmianie liczby widocznych kart (mobile/desktop),
  // inaczej po resize indeks może wskazywać poza dozwolony zakres
  useEffect(() => {
    setWomenCatIndex(0);
    setMenCatIndex(0);
  }, [visibleCatCount]);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Błąd ładowania produktów:", err));
  }, []);

  // Autoprzewijanie górnego banera (co 5 sekund)
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Automatyczny ruch slidera kategorii damskich
  useEffect(() => {
    const timer = setInterval(() => {
      setWomenCatIndex((prev) => (prev >= womenCategories.length - visibleCatCount ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [visibleCatCount]);

  // Automatyczny ruch slidera kategorii męskich
  useEffect(() => {
    const timer = setInterval(() => {
      setMenCatIndex((prev) => (prev >= menCategories.length - visibleCatCount ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, [visibleCatCount]);

  // Funkcje do ręcznego przełączania slajdów karuzeli
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slidesData.length - 1 : prev - 1));
  };

  // Filtrowanie produktów
  const newProducts = products.filter(p => !p.is_sale);
  const saleProducts = products.filter(p => p.is_sale);

  return (
    <div style={{ paddingBottom: '60px', backgroundColor: '#fff' }}>
      
      {/* =========================================================================
          1. GÓRNA KARUZELA BANERÓW (ze szklanymi strzałkami i ręcznym sterowaniem)
          ========================================================================= */}
      <div className="hero-slider" style={{ position: 'relative', overflow: 'hidden', height: '600px' }}>

        {/* Lewa szklana strzałka */}
        <button 
          style={{ ...arrowStyle, left: '30px' }} 
          onClick={prevSlide}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ‹
        </button>

        {/* Prawa szklana strzałka */}
        <button 
          style={{ ...arrowStyle, right: '30px' }} 
          onClick={nextSlide}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ›
        </button>

        {slidesData.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ 
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
              zIndex: index === currentSlide ? 1 : 0
            }}
          >
            {/* Wewnętrzna nakładka z wyśrodkowanym tekstem */}
            <div className="banner-overlay" style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              color: '#fff',
              padding: '0 20px'
            }}>
              <h2 style={{ fontSize: '42px', letterSpacing: '6px', fontWeight: '800', margin: '0 0 15px 0', textShadow: '1px 1px 10px rgba(0,0,0,0.5)' }}>
                {slide.title}
              </h2>
              <p style={{ fontSize: '18px', letterSpacing: '1px', margin: '0 0 35px 0', color: '#f3f4f6', textShadow: '1px 1px 8px rgba(0,0,0,0.5)' }}>
                {slide.subtitle}
              </p>
              <button
                style={bannerButtonStyle}
                onClick={() => {
                  if (slide.scrollTarget === 'wyprzedaz' && wyprzedazRef.current) {
                    wyprzedazRef.current.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 650, behavior: 'smooth' });
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                {slide.buttonText}
              </button>
            </div>
          </div>
        ))}

        <div className="slider-dots">
          {slidesData.map((_, index) => (
            <button 
              key={index} 
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* =========================================================================
          2. SEKCJA NOWOŚCI
          ========================================================================= */}
      <ProductRow
        title="Nowości"
        products={newProducts}
      />

      {/* =========================================================================
          3. SEKCJA ŚRODKOWA: INTERAKTYWNY BANER REKOMENDACJI
          ========================================================================= */}
      <div style={{
        margin: '60px 40px', padding: '60px', borderRadius: '4px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: `radial-gradient(1px 1px at 40px 60px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 120px 20px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 300px 140px, #fff, rgba(0,0,0,0)), linear-gradient(135deg, #0B0F19, #1E1B4B)`
      }}>
        <h2 style={{ color: '#FFF', fontSize: '28px', fontWeight: '800', letterSpacing: '4px', marginBottom: '15px', textTransform: 'uppercase' }}>
          ZNAJDŹ SWÓJ UNIKALNY STYL
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '15px', maxWidth: '600px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
          Uruchom nasz inteligentny konfigurator garderoby. Dopasuj idealny zestaw składający się z góry, dołu oraz akcesoriów w kilka sekund.
        </p>
        <Link to="/match">
          <button style={{ backgroundColor: '#FFF', color: '#0B0F19', border: 'none', padding: '15px 40px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', cursor: 'pointer', borderRadius: '2px' }}>
            STWÓRZ MATCH LOOK
          </button>
        </Link>
      </div>

      {/* =========================================================================
          4. SEKCJA: WYPRZEDAŻ
          ========================================================================= */}
      <div ref={wyprzedazRef} style={{
        background: 'linear-gradient(135deg, #1E1B4B, #311042)',
        padding: '40px 0 20px 0',
        margin: '50px 0',
        boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.3), inset 0 -10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0 40px', marginBottom: '-20px' }}>
          <h2 style={{ color: '#FFF', fontSize: '24px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Wyprzedaż
          </h2>
          <span style={{ backgroundColor: '#F43F5E', color: '#FFF', fontSize: '10px', fontWeight: '900', padding: '4px 10px', borderRadius: '2px', letterSpacing: '1px' }}>
            DO -50% OFF
          </span>
        </div>

        <div className="sale-row-dark-theme">
          <ProductRow
            title=""
            products={saleProducts}
            isDark={true} // ten props ustawia biały kolor tekstu na kartach
            seeMoreTo="/women-wyprzedaz"
          />
        </div>
      </div>
      {/* =========================================================================
          5. SEKCJA ŁĄCZONA: ODKRYJ KATEGORIE (damskie + męskie przez linię)
          ========================================================================= */}
      <div style={{ padding: '40px 40px' }}>
        {/* Główny nagłówek wyświetlany tylko raz */}
        <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '35px' }}>
          Odkryj Kategorie
        </h2>
        
        {/* Pierwszy rząd (kategorie dla niej) */}
        <div style={{ overflow: 'hidden', width: '100%', marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            gap: '20px',
            transform: `translateX(-${womenCatIndex * (100 / visibleCatCount)}%)`,
            transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
          }}>
            {womenCategories.map((cat) => (
              <Link
                to={cat.path}
                key={`women-${cat.id}`}
                style={{
                  minWidth: isMobile ? 'calc(50% - 10px)' : 'calc(25% - 15px)',
                  height: isMobile ? '190px' : '240px',
                  position: 'relative', 
                  overflow: 'hidden', 
                  textDecoration: 'none', 
                  borderRadius: '4px',
                  backgroundImage: `url(${cat.img})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center'
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                  backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
                >
                  <span style={{ color: '#FFF', fontSize: '18px', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase' }}>
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dekoracyjna pozioma linia na środku, 70% szerokości */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }}>
          <div style={{ width: '70%', height: '1px', backgroundColor: '#e5e7eb' }}></div>
        </div>

        {/* Drugi rząd (kategorie dla niego) */}
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div style={{
            display: 'flex',
            gap: '20px',
            transform: `translateX(-${menCatIndex * (100 / visibleCatCount)}%)`,
            transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
          }}>
            {menCategories.map((cat) => (
              <Link
                to={cat.path}
                key={`men-${cat.id}`}
                style={{
                  minWidth: isMobile ? 'calc(50% - 10px)' : 'calc(25% - 15px)',
                  height: isMobile ? '190px' : '240px',
                  position: 'relative', 
                  overflow: 'hidden', 
                  textDecoration: 'none', 
                  borderRadius: '4px',
                  backgroundImage: `url(${cat.img})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center'
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                  backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
                >
                  <span style={{ color: '#FFF', fontSize: '18px', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase' }}>
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;