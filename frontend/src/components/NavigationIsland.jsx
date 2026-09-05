import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function NavigationIsland() {
  const navigate = useNavigate();
  const location = useLocation();

  // Funkcja pomocnicza sprawdzająca, która zakładka jest aktualnie aktywna
  const isActive = (path) => location.pathname === path;

  // Style dla przycisków w menu nawigacyjnym
  const buttonStyle = (path) => ({
    background: isActive(path) ? '#0f172a' : 'transparent',
    color: isActive(path) ? '#ffffff' : '#555555',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  });

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(10px)',
      padding: '8px 16px',
      borderRadius: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '10px',
      zIndex: 1000
    }}>
      <button style={buttonStyle('/')} onClick={() => navigate('/')}>STORE</button>
      <button style={buttonStyle('/feed')} onClick={() => navigate('/feed')}>FEED</button>
      <button style={buttonStyle('/match')} onClick={() => navigate('/match')}>MATCH</button>
    </div>
  );
}

export default NavigationIsland;