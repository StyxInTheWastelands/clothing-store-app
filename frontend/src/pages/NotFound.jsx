import React from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';

function NotFound() {
  usePageMeta('Nie znaleziono strony', 'Strona, której szukasz, nie istnieje lub została przeniesiona.');

  return (
    <div style={wrapStyle}>
      <span style={codeStyle}>404</span>
      <h1 style={titleStyle}>Nie znaleziono strony</h1>
      <p style={textStyle}>Strona, której szukasz, nie istnieje albo została przeniesiona.</p>
      <Link to="/" style={btnStyle}>Wróć do sklepu</Link>
    </div>
  );
}

const wrapStyle = {
  minHeight: '70vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '40px 20px',
  fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif'
};
const codeStyle = { fontSize: '80px', fontWeight: '900', letterSpacing: '0.02em', color: '#e2e8f0' };
const titleStyle = { fontSize: '22px', fontWeight: '800', color: '#0a192f', margin: '4px 0 8px' };
const textStyle = { fontSize: '14px', color: '#64748b', margin: '0 0 24px' };
const btnStyle = { background: '#0a192f', color: '#fff', textDecoration: 'none', padding: '13px 28px', borderRadius: '100px', fontSize: '13px', fontWeight: '800' };

export default NotFound;
