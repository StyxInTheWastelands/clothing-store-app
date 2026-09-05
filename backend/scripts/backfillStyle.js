// Jednorazowy skrypt: uzupełnia puste pole style w istniejących produktach.
// Opis (description) jest pusty dla wszystkich takich produktów, dlatego opieramy się na słowach kluczowych w name.
const pool = require('../db');

const STREETWEAR_KEYWORDS = [
  'oversize', 'boxy', 'baggy', 'cargo', 'dresow', 'sportow', 'nadruk',
  'kaptur', 'denim', 'jeans', 'ćwiek', 'naszyw', 'spider-man', 'eminem',
  'techniczn', 'wiatrówka', 'puffy', 'parachute', 'skater', 'racing',
  'funnel', 'color block', 'balonowy'
];

function classify(name) {
  const lower = name.toLowerCase();
  return STREETWEAR_KEYWORDS.some((keyword) => lower.includes(keyword)) ? 'Streetwear' : 'Casual';
}

(async () => {
  const { rows } = await pool.query('SELECT id, name FROM products WHERE style IS NULL');
  const counts = { Streetwear: 0, Casual: 0 };

  for (const row of rows) {
    const style = classify(row.name);
    counts[style]++;
    await pool.query('UPDATE products SET style = $1 WHERE id = $2', [style, row.id]);
  }

  console.log(`Backfill zakończony: ${rows.length} produktów →`, counts);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
