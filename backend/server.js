const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const matchEngine = require('./matchEngine');

const JWT_SECRET = "super_secret_key_for_stitch_shop"; // sekret JWT (na potrzeby pracy dyplomowej)

app.use(cors());
app.use(express.json());

// ==========================================
// MIDDLEWARE DO WERYFIKACJI TOKENA JWT
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Brak autoryzacji. Zaloguj się ponownie.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Nieprawidłowy lub przeterminowany token.' });
    }
    req.user = decoded; // zapisujemy dane z tokena (userId, email) do req.user
    next();
  });
};

// ==========================================
// MIDDLEWARE: TO SAMO, ALE TOKEN JEST OPCJONALNY (dla MATCH — można próbować bez logowania)
// ==========================================
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    req.user = err ? null : decoded;
    next();
  });
};

// ==========================================
// MIDDLEWARE: DOSTĘP TYLKO DLA ADMINA (e-mail z listy w .env, ADMIN_EMAILS)
// ==========================================
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

const requireAdmin = (req, res, next) => {
  const email = req.user ? String(req.user.email).toLowerCase() : '';
  // Dostęp mają e-maile z listy ADMIN_EMAILS lub dowolny adres na domenie @admin.com
  const isAdmin = ADMIN_EMAILS.includes(email) || email.endsWith('@admin.com');
  if (!isAdmin) {
    return res.status(403).json({ message: 'Brak uprawnień administratora.' });
  }
  next();
};

// ==========================================
// AUTENTYKACJA: 1. REJESTRACJA UŻYTKOWNIKA
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Użytkownik o tym adresie e-mail już istnieje.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    res.status(201).json({ 
      message: 'Rejestracja pomyślna!', 
      user: newUser.rows[0] 
    });

  } catch (err) {
    console.error('Błąd przy rejestracji:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// AUTENTYKACJA: 2. LOGOWANIE
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Nieprawidłowy e-mail lub hasło.' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Nieprawidłowy e-mail lub hasło.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Błąd przy logowaniu:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// UŻYTKOWNIK: 3. POBRANIE PROFILU I ULUBIONYCH PRODUKTÓW
// ==========================================
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const userResult = await pool.query(
      'SELECT id, name, email, phone, favorite_size, address FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
    }

    const favoritesResult = await pool.query(
      `SELECT p.* FROM favorites f
       JOIN products p ON f.product_id = p.id
       WHERE f.user_id = $1`,
      [userId]
    );

    res.json({
      ...userResult.rows[0],
      favorites: favoritesResult.rows
    });

  } catch (err) {
    console.error('Błąd przy pobieraniu profilu:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// UŻYTKOWNIK: 4. AKTUALIZACJA DANYCH PROFILU W BAZIE DANYCH
// ==========================================
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { name, phone, favorite_size, address } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: 'Imię nie może być puste.' });
  }

  try {
    // Email świadomie nie jest tu aktualizowany — służy do logowania, zmiana wymaga osobnej weryfikacji
    const updatedUser = await pool.query(
      `UPDATE users SET name = $1, phone = $2, favorite_size = $3, address = $4
       WHERE id = $5
       RETURNING id, name, email, phone, favorite_size, address`,
      [name, phone || null, favorite_size || null, address || null, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'Nie udało się zaktualizować danych.' });
    }

    res.json({
      message: 'Dane zostały zaktualizowane pomyślnie!',
      user: updatedUser.rows[0]
    });

  } catch (err) {
    console.error('Błąd przy aktualizacji profilu użytkownika:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// 1. TRASA DLA STRONY GŁÓWNEJ (wszystkie produkty)
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error('Błąd przy pobieraniu wszystkich produktów:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// 2. TRASA DLA STRONY POJEDYNCZEGO PRODUKTU
// ==========================================
app.get('/api/products/:prodId/:quality/:colorId', async (req, res) => {
  const { prodId, quality, colorId } = req.params;
  const cleanIdFromUrl = `${prodId}/${quality}/${colorId}`; 

  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE REPLACE(id, ' ', '') = $1", 
      [cleanIdFromUrl]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produkt nie został znaleziony w bazie.' });
    }

    const product = result.rows[0];

    const availableVariants = await pool.query(
      "SELECT id FROM products WHERE REPLACE(id, ' ', '') LIKE $1",
      [`${prodId}/%`]
    );

    const availableColorIds = availableVariants.rows.map(row => {
      const parts = row.id.replace(/\s+/g, '').split('/'); 
      return parts[2]; 
    });

    product.availableColors = availableColorIds;

    res.json(product);
  } catch (err) {
    console.error('Błąd w zapytaniu SQL pojedynczego produktu:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// ADMIN: 0. SPRAWDZENIE, CZY ZALOGOWANY UŻYTKOWNIK JEST ADMINEM (do bramkowania strony /admin)
// ==========================================
app.get('/api/admin/check', authenticateToken, requireAdmin, (req, res) => {
  res.json({ isAdmin: true });
});

// ==========================================
// ADMIN: 1. DODANIE NOWEGO PRODUKTU
// ==========================================
app.post('/api/admin/products', authenticateToken, requireAdmin, async (req, res) => {
  const { id, name, description, sub_category, gender, price, sizes, color, style, image, category_id, is_sale, old_price, collection } = req.body;

  const requiredFields = { id, name, gender, price, sizes, color, style, image, category_id };
  const missing = Object.entries(requiredFields)
    .filter(([, value]) => value === undefined || value === null || value === '')
    .map(([key]) => key);
  if (missing.length > 0) {
    return res.status(400).json({ message: `Brakuje pól: ${missing.join(', ')}` });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (id, name, description, sub_category, gender, price, sizes, color, style, image, category_id, is_sale, old_price, collection)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING
       RETURNING *`,
      [id, name, description || null, sub_category || null, gender, price, sizes, color, style, image, category_id, is_sale || false, old_price || null, collection || 'regular']
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ message: 'Produkt o tym ID już istnieje.' });
    }

    res.status(201).json({ message: 'Produkt dodany.', product: result.rows[0] });
  } catch (err) {
    console.error('Błąd przy dodawaniu produktu (admin):', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// ADMIN: 2. EDYCJA CENY ISTNIEJĄCEGO PRODUKTU
// ==========================================
app.put('/api/admin/products/*splat', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.splat.join('/');
  const { price, old_price, is_sale } = req.body;

  if (price === undefined || price === null || price === '') {
    return res.status(400).json({ message: 'Brak ceny.' });
  }

  try {
    const result = await pool.query(
      `UPDATE products SET price = $1, old_price = $2, is_sale = $3 WHERE id = $4 RETURNING *`,
      [price, old_price || null, is_sale || false, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono produktu.' });
    }
    res.json({ message: 'Zaktualizowano.', product: result.rows[0] });
  } catch (err) {
    console.error('Błąd przy edycji produktu (admin):', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// ULUBIONE (FAVORITES): 1. POBRANIE LISTY
// ==========================================
app.get('/api/favorites', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT p.* FROM favorites f
       JOIN products p ON f.product_id = p.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Błąd przy pobieraniu ulubionych:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// ULUBIONE (FAVORITES): 2. DODANIE PRODUKTU
// ==========================================
app.post('/api/favorites', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Brak ID produktu.' });
  }

  try {
    // Dzięki UNIQUE(user_id, product_id) w bazie, ON CONFLICT zapobiega duplikatom
    const newFavorite = await pool.query(
      `INSERT INTO favorites (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [userId, productId]
    );

    res.status(201).json({ message: 'Produkt dodany do ulubionych.' });
  } catch (err) {
    console.error('Błąd przy dodawaniu do ulubionych:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// ULUBIONE (FAVORITES): 3. USUNIĘCIE PRODUKTU
// ==========================================
app.delete('/api/favorites/*splat', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  // Id produktu zawiera ukośniki (np. "3941/443/300"), więc bierzemy cały "ogon" ścieżki po /api/favorites/
  const productId = req.params.splat.join('/');

  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    res.json({ message: 'Produkt usunięty z ulubionych.' });
  } catch (err) {
    console.error('Błąd przy usuwaniu z ulubionych:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// KOSZYK: 1. OTRZYMANIE ZAWARTOŚCI KOSZYKA
// ==========================================
app.get('/api/cart', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT c.id AS cart_item_id, c.size, c.quantity, p.*
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Błąd przy pobieraniu koszyka:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// KOSZYK: 2. DODANIE PRODUKTU DO KOSZYKA
// ==========================================
app.post('/api/cart', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { productId, size, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Brak ID produktu.' });
  }

  const safeSize = size || '';
  const safeQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

  try {
    // Jeśli ten sam produkt w tym samym rozmiarze już jest w koszyku — zwiększamy ilość
    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, size, quantity)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, product_id, size)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING id`,
      [userId, productId, safeSize, safeQuantity]
    );
    res.status(201).json({ message: 'Produkt dodany do koszyka.', cartItemId: result.rows[0].id });
  } catch (err) {
    console.error('Błąd przy dodawaniu do koszyka:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// KOSZYK: 3. ZMIANA ILOŚCI PRODUKTU
// ==========================================
app.put('/api/cart/:cartItemId', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: 'Nieprawidłowa ilość.' });
  }

  try {
    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING id',
      [quantity, cartItemId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono produktu w koszyku.' });
    }
    res.json({ message: 'Ilość zaktualizowana.' });
  } catch (err) {
    console.error('Błąd przy aktualizacji ilości:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// KOSZYK: 4. USUNIĘCIE PRODUKTU Z KOSZYKA
// ==========================================
app.delete('/api/cart/:cartItemId', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { cartItemId } = req.params;

  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [cartItemId, userId]);
    res.json({ message: 'Produkt usunięty z koszyka.' });
  } catch (err) {
    console.error('Błąd przy usuwaniu z koszyka:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// ZAMÓWIENIA: 1. ZŁOŻENIE ZAMÓWIENIA NA PODSTAWIE KOSZYKA
// ==========================================
const VALID_PAYMENT_METHODS = ['Karta', 'Za pobraniem', 'BLIK'];

app.post('/api/orders', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { shippingAddress, shippingPhone, paymentMethod } = req.body;

  if (!shippingAddress || shippingAddress.trim() === '') {
    return res.status(400).json({ message: 'Adres dostawy jest wymagany.' });
  }
  if (!shippingPhone || shippingPhone.trim() === '') {
    return res.status(400).json({ message: 'Telefon kontaktowy jest wymagany.' });
  }
  const safePaymentMethod = VALID_PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : 'Za pobraniem';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cartResult = await client.query(
      `SELECT c.id AS cart_item_id, c.size, c.quantity, p.id AS product_id, p.name, p.image, p.price
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Koszyk jest pusty.' });
    }

    const total = cartResult.rows.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, shipping_address, shipping_phone, payment_method)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, status, total, payment_method, created_at`,
      [userId, total, shippingAddress, shippingPhone, safePaymentMethod]
    );
    const order = orderResult.rows[0];

    for (const item of cartResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, size, quantity, price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.product_id, item.name, item.image, item.size, item.quantity, item.price]
      );
    }

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Zamówienie złożone pomyślnie!', order });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Błąd przy składaniu zamówienia:', err.message);
    res.status(500).send('Błąd serwera');
  } finally {
    client.release();
  }
});

// ==========================================
// ZAMÓWIENIA: pomocnicza funkcja — oblicza postęp zamówienia na podstawie czasu,
// jaki upłynął od jego złożenia (symulacja realizacji, bo nie mamy panelu magazynowego)
// ==========================================
const ORDER_STAGE_HOURS = { shipped: 24, delivered: 72 };

function getOrderTimeline(order) {
  const createdAt = new Date(order.created_at);
  const hoursElapsed = (Date.now() - createdAt.getTime()) / 3600000;

  // Symulujemy postęp tylko dla zamówień, które nigdy nie zostały ręcznie oznaczone inaczej
  const isDefaultFlow = order.status === 'W realizacji';
  const isShipped = isDefaultFlow && hoursElapsed >= ORDER_STAGE_HOURS.shipped;
  const isDelivered = isDefaultFlow && hoursElapsed >= ORDER_STAGE_HOURS.delivered;

  const stages = [
    { key: 'placed', label: 'Złożone', at: createdAt.toISOString(), done: true },
    { key: 'processing', label: 'Przyjęte do realizacji', at: createdAt.toISOString(), done: true },
    { key: 'shipped', label: 'Wysłane', at: new Date(createdAt.getTime() + ORDER_STAGE_HOURS.shipped * 3600000).toISOString(), done: isDefaultFlow ? isShipped : order.status === 'Dostarczone' },
    { key: 'delivered', label: 'Dostarczone', at: new Date(createdAt.getTime() + ORDER_STAGE_HOURS.delivered * 3600000).toISOString(), done: isDelivered || order.status === 'Dostarczone' }
  ];

  let currentStatus = order.status;
  if (isDefaultFlow) {
    currentStatus = isDelivered ? 'Dostarczone' : (isShipped ? 'Wysłane' : 'W realizacji');
  }

  return { currentStatus, stages };
}

// ==========================================
// ZAMÓWIENIA: 2. HISTORIA ZAMÓWIEŃ UŻYTKOWNIKA
// ==========================================
app.get('/api/orders', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const ordersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(
          'SELECT * FROM order_items WHERE order_id = $1',
          [order.id]
        );
        const { currentStatus } = getOrderTimeline(order);
        return { ...order, status: currentStatus, items: itemsResult.rows };
      })
    );

    res.json(orders);
  } catch (err) {
    console.error('Błąd przy pobieraniu historii zamówień:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// ZAMÓWIENIA: 3. SPRAWDZENIE STATUSU KONKRETNEGO ZAMÓWIENIA (numer + postęp)
// ==========================================
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: 'Nieprawidłowy numer zamówienia.' });
  }

  try {
    // Zamówienie musi należeć do zalogowanego użytkownika — nie da się podejrzeć cudzego numeru
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono zamówienia o tym numerze na Twoim koncie.' });
    }

    const order = orderResult.rows[0];
    const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    const { currentStatus, stages } = getOrderTimeline(order);

    res.json({ ...order, status: currentStatus, timeline: stages, items: itemsResult.rows });
  } catch (err) {
    console.error('Błąd przy sprawdzaniu statusu zamówienia:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// ZWROTY: 1. ZŁOŻENIE ZGŁOSZENIA ZWROTU
// ==========================================
const VALID_RETURN_REASONS = ['Zły rozmiar', 'Produkt uszkodzony', 'Produkt niezgodny z opisem', 'Zmieniłam/em zdanie', 'Inny powód'];

app.post('/api/returns', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { orderItemId, reason } = req.body;

  if (!orderItemId) {
    return res.status(400).json({ message: 'Brak wybranego produktu.' });
  }
  if (!VALID_RETURN_REASONS.includes(reason)) {
    return res.status(400).json({ message: 'Nieprawidłowy powód zwrotu.' });
  }

  try {
    // Sprawdzamy, że wybrana pozycja zamówienia rzeczywiście należy do tego użytkownika
    const itemResult = await pool.query(
      `SELECT oi.id, oi.order_id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.id = $1 AND o.user_id = $2`,
      [orderItemId, userId]
    );
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono tego produktu w Twoich zamówieniach.' });
    }

    const existing = await pool.query('SELECT id FROM returns WHERE order_item_id = $1', [orderItemId]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Zgłoszenie zwrotu dla tego produktu już istnieje.' });
    }

    const orderId = itemResult.rows[0].order_id;
    const result = await pool.query(
      `INSERT INTO returns (user_id, order_id, order_item_id, reason) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, orderId, orderItemId, reason]
    );

    res.status(201).json({ message: 'Zgłoszenie zwrotu zostało złożone.', return: result.rows[0] });
  } catch (err) {
    console.error('Błąd przy składaniu zgłoszenia zwrotu:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// ZWROTY: 2. LISTA WŁASNYCH ZGŁOSZEŃ
// ==========================================
app.get('/api/returns', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT r.*, oi.product_name, oi.product_image, oi.size, oi.price
       FROM returns r
       JOIN order_items oi ON r.order_item_id = oi.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Błąd przy pobieraniu zgłoszeń zwrotu:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// MATCH: 1. PEŁNY ZESTAW PROPOZYCJI (top / bottom / accessory / jacket)
// ==========================================
const VALID_STYLES = ['Casual', 'Streetwear', 'Elegancki', 'Y2K'];

app.get('/api/match', optionalAuth, async (req, res) => {
  const { seedProductId, gender: genderParam } = req.query;
  const size = Math.min(parseInt(req.query.size, 10) || 3, 6);
  const preferredStyle = VALID_STYLES.includes(req.query.preferredStyle) ? req.query.preferredStyle : null;

  try {
    const allProductsResult = await pool.query('SELECT * FROM products');
    const products = allProductsResult.rows;

    let seed = null;

    if (seedProductId) {
      seed = products.find((p) => p.id === seedProductId);
      if (!seed) {
        return res.status(404).json({ message: 'Nie znaleziono produktu startowego (seed).' });
      }
    } else if (genderParam) {
      // Użytkownik przełączył płeć budowanego looku — szukamy nowego punktu startowego dla tej płci
      if (req.user) {
        const favResult = await pool.query(
          `SELECT p.* FROM favorites f JOIN products p ON f.product_id = p.id WHERE f.user_id = $1 AND p.gender = $2`,
          [req.user.userId, genderParam]
        );
        if (favResult.rows.length > 0) {
          seed = favResult.rows[Math.floor(Math.random() * favResult.rows.length)];
        }
      }
      if (!seed) {
        const genderPool = products.filter((p) => p.gender === genderParam);
        if (genderPool.length > 0) {
          seed = genderPool[Math.floor(Math.random() * genderPool.length)];
        }
      }
    } else if (req.user) {
      // Bez podanego seeda — spróbuj wziąć losowy produkt z ulubionych zalogowanego użytkownika
      const favResult = await pool.query(
        `SELECT p.* FROM favorites f JOIN products p ON f.product_id = p.id WHERE f.user_id = $1`,
        [req.user.userId]
      );
      if (favResult.rows.length > 0) {
        seed = favResult.rows[Math.floor(Math.random() * favResult.rows.length)];
      }
    }

    if (!seed) {
      // Zupełny brak punktu startowego — bierzemy losowy produkt z całej bazy
      seed = products[Math.floor(Math.random() * products.length)];
    }

    const match = matchEngine.buildMatch(products, seed, size, preferredStyle);
    res.json({ seed, ...match });
  } catch (err) {
    console.error('Błąd przy budowaniu MATCH:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// MATCH: 2. LOSOWY PRODUKT DLA JEDNEGO SLOTU ("Zaskocz mnie" na pojedynczym kontenerze)
// ==========================================
app.get('/api/match/random', async (req, res) => {
  const { slot, gender, seedProductId, excludeId } = req.query;
  const preferredStyle = VALID_STYLES.includes(req.query.preferredStyle) ? req.query.preferredStyle : null;

  if (!['top', 'bottom', 'accessory', 'jacket'].includes(slot)) {
    return res.status(400).json({ message: 'Nieprawidłowy slot.' });
  }
  if (!gender) {
    return res.status(400).json({ message: 'Brak parametru gender.' });
  }

  try {
    const allProductsResult = await pool.query('SELECT * FROM products');
    const products = allProductsResult.rows;
    const pseudoSeed = { id: seedProductId || null, gender };

    const item = matchEngine.getRandomForSlot(products, pseudoSeed, slot, excludeId || null, preferredStyle);
    if (!item) {
      return res.status(404).json({ message: 'Brak dostępnych produktów dla tego slotu.' });
    }
    res.json(item);
  } catch (err) {
    console.error('Błąd przy losowaniu produktu MATCH:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// ==========================================
// FEED: rekomendacje w stylu Tindera, ranking wg profilu smaku użytkownika
// ==========================================
app.get('/api/feed', optionalAuth, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 20);
  const excludeIds = (req.query.excludeIds || '').split(',').map((s) => s.trim()).filter(Boolean);

  try {
    const allProductsResult = await pool.query('SELECT * FROM products');
    const products = allProductsResult.rows;

    let profile = null;

    if (req.user) {
      // Waga sygnału: zamówione (3) > w koszyku (2) > ulubione (1)
      const historyResult = await pool.query(
        `SELECT p.style, p.color, p.gender, p.price, 3 AS weight
           FROM order_items oi
           JOIN orders o ON oi.order_id = o.id
           JOIN products p ON oi.product_id = p.id
          WHERE o.user_id = $1
         UNION ALL
         SELECT p.style, p.color, p.gender, p.price, 2 AS weight
           FROM cart_items c
           JOIN products p ON c.product_id = p.id
          WHERE c.user_id = $1
         UNION ALL
         SELECT p.style, p.color, p.gender, p.price, 1 AS weight
           FROM favorites f
           JOIN products p ON f.product_id = p.id
          WHERE f.user_id = $1`,
        [req.user.userId]
      );
      profile = matchEngine.buildTasteProfile(historyResult.rows);
    }

    const items = matchEngine.rankFeed(products, profile, excludeIds, limit);
    res.json({ items, coldStart: !profile });
  } catch (err) {
    console.error('Błąd przy budowaniu Feed:', err.message);
    res.status(500).send('Błąd serwera');
  }
});

// Uruchomienie serwera
app.listen(5000, () => {
  console.log('Serwer działa na porcie 5000');
});