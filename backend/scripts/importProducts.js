// Jednorazowy (można uruchamiać wielokrotnie) skrypt: importuje nowe produkty
// z backend/data/new-products.json do tabeli products.
// Produkty, których id już jest w bazie, są pomijane (ON CONFLICT DO NOTHING) —
// można bezpiecznie uzupełniać plik i ponownie uruchamiać skrypt.
const fs = require('fs');
const path = require('path');
const pool = require('../db');

const DATA_PATH = path.join(__dirname, '..', 'data', 'new-products.json');

const REQUIRED_FIELDS = ['id', 'name', 'gender', 'price', 'sizes', 'color', 'style', 'image', 'category_id'];

(async () => {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  const products = JSON.parse(raw);

  if (!Array.isArray(products) || products.length === 0) {
    console.error('backend/data/new-products.json powinien zawierać niepustą tablicę produktów.');
    process.exit(1);
  }

  let inserted = 0;
  let skipped = 0;

  for (const product of products) {
    const missing = REQUIRED_FIELDS.filter((field) => product[field] === undefined || product[field] === null || product[field] === '');
    if (missing.length > 0) {
      console.error(`Pomijam "${product.id || product.name || '???'}" — brakuje pól: ${missing.join(', ')}`);
      skipped++;
      continue;
    }

    const result = await pool.query(
      `INSERT INTO products (id, name, description, sub_category, gender, price, sizes, color, style, image, category_id, is_sale, old_price, collection)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [
        product.id,
        product.name,
        product.description || null,
        product.sub_category || null,
        product.gender,
        product.price,
        product.sizes,
        product.color,
        product.style,
        product.image,
        product.category_id,
        product.is_sale || false,
        product.old_price || null,
        product.collection || 'regular'
      ]
    );

    if (result.rows.length > 0) {
      inserted++;
    } else {
      console.log(`Już istnieje w bazie, pomijam: ${product.id}`);
      skipped++;
    }
  }

  console.log(`\nGotowe: dodano ${inserted}, pominięto ${skipped} z ${products.length} produktów.`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
