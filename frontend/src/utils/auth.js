// Декодує payload JWT (частина між крапками) без зовнішніх бібліотек
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Перевіряє, чи є в localStorage дійсний (не прострочений) токен
export function isSessionValid() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return false;

  return payload.exp * 1000 > Date.now();
}

// Очищує сесію користувача (при виході або коли токен прострочився)
export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('favoriteSize');
}
