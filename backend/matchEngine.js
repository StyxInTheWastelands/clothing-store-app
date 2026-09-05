// Silnik content-based dopasowania dla MATCH. Bez bibliotek ML — przejrzyste,
// wytłumaczalne reguły oparte na atrybutach produktu (style, color, price, gender).

const SLOT_BY_CATEGORY = {
  1: 'top',       // koszulki / topy
  5: 'top',       // swetry / bluzy
  2: 'bottom',    // spodnie
  3: 'bottom',    // spodenki
  7: 'bottom',    // spódnice
  6: 'accessory', // akcesoria
  4: 'jacket'     // kurtki (opcjonalny 4. slot)
};

const COLOR_FAMILIES = {
  neutral: ['czarn', 'biał', 'szar', 'popielat', 'beżow', 'kremow', 'granatow', 'piaskow', 'khaki', 'ecru'],
  warm: ['czerwon', 'pomarańcz', 'żółt', 'brązow', 'bordow', 'rubinow', 'złot', 'koralow', 'rud'],
  cool: ['niebiesk', 'zielon', 'fioletow', 'różow', 'turkus', 'błękit']
};

function getSlot(categoryId) {
  return SLOT_BY_CATEGORY[Number(categoryId)] || null;
}

function colorFamily(colorName) {
  if (!colorName) return 'unknown';
  const lower = colorName.toLowerCase();
  for (const [family, keywords] of Object.entries(COLOR_FAMILIES)) {
    if (keywords.some((keyword) => lower.includes(keyword))) return family;
  }
  return 'unknown';
}

function colorScore(colorA, colorB) {
  const famA = colorFamily(colorA);
  const famB = colorFamily(colorB);
  if (famA === 'unknown' || famB === 'unknown') return 0.5;
  if (famA === 'neutral' || famB === 'neutral') return 1.0;
  return famA === famB ? 0.8 : 0.3;
}

function styleScore(styleA, styleB) {
  if (!styleA || !styleB) return 0.5;
  return styleA === styleB ? 1.0 : 0.2;
}

function priceProximityScore(priceA, priceB) {
  const diff = Math.abs(parseFloat(priceA) - parseFloat(priceB));
  return Math.max(0, 1 - diff / 300);
}

// `targetStyle` — jeśli podany (przypięta preferencja użytkownika), używamy go zamiast stylu zerna
function compatibilityScore(seed, candidate, targetStyle = null) {
  return (
    styleScore(targetStyle || seed.style, candidate.style) * 0.5 +
    colorScore(seed.color, candidate.color) * 0.3 +
    priceProximityScore(seed.price, candidate.price) * 0.2
  );
}

// Zwraca do `limit` najlepszych kandydatów dla slotu (posortowanych wg score).
// Jeśli podano preferredStyle (i nie jest to Casual) — gwarantujemy, że przynajmniej
// jeden kandydat będzie Casual (neutralna baza, która pasuje do wszystkiego).
function getCandidatesForSlot(products, seed, slot, limit = 3, preferredStyle = null) {
  const pool = products.filter((p) => getSlot(p.category_id) === slot && p.gender === seed.gender && p.id !== seed.id);
  const scored = pool
    .map((p) => ({ ...p, score: compatibilityScore(seed, p, preferredStyle) }))
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, limit);

  if (preferredStyle && preferredStyle !== 'Casual' && top.length >= 2 && !top.some((p) => p.style === 'Casual')) {
    const bestCasual = scored.find((p) => p.style === 'Casual');
    if (bestCasual) top[top.length - 1] = bestCasual;
  }

  return top;
}

// Zwraca jeden losowy produkt ze slotu — dla "Zaskocz mnie".
// Z preferredStyle: ~75% szans na produkt tego stylu, ~25% Casual (żeby też domieszać podstawowe rzeczy).
function getRandomForSlot(products, seed, slot, excludeId = null, preferredStyle = null) {
  const pool = products.filter(
    (p) => getSlot(p.category_id) === slot && p.gender === seed.gender && p.id !== seed.id && p.id !== excludeId
  );
  if (pool.length === 0) return null;

  if (preferredStyle) {
    const preferredPool = pool.filter((p) => p.style === preferredStyle);
    const casualPool = pool.filter((p) => p.style === 'Casual');
    const wantCasual = preferredStyle !== 'Casual' && Math.random() < 0.25 && casualPool.length > 0;
    const chosenPool = wantCasual ? casualPool : (preferredPool.length > 0 ? preferredPool : pool);
    return chosenPool[Math.floor(Math.random() * chosenPool.length)];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

// Buduje pełny zestaw propozycji dla MATCH: top / bottom / accessory / jacket
function buildMatch(products, seed, candidatesPerSlot = 3, preferredStyle = null) {
  return {
    top: getCandidatesForSlot(products, seed, 'top', candidatesPerSlot, preferredStyle),
    bottom: getCandidatesForSlot(products, seed, 'bottom', candidatesPerSlot, preferredStyle),
    accessory: getCandidatesForSlot(products, seed, 'accessory', candidatesPerSlot, preferredStyle),
    jacket: getCandidatesForSlot(products, seed, 'jacket', candidatesPerSlot, preferredStyle)
  };
}

// ==========================================
// FEED: profil smaku użytkownika + rankowanie
// ==========================================

// `historyItems` — [{ style, color, gender, price, weight }], gdzie weight
// odzwierciedla siłę sygnału (zamówione > w koszyku > ulubione).
// Zwraca zagregowany profil albo null, gdy historia jest pusta (cold start).
function buildTasteProfile(historyItems) {
  if (!historyItems || historyItems.length === 0) return null;

  const styleWeights = {};
  const colorWeights = {};
  const genderWeights = {};
  let totalWeight = 0;
  let weightedPriceSum = 0;

  for (const item of historyItems) {
    const w = item.weight || 1;
    totalWeight += w;
    if (item.style) styleWeights[item.style] = (styleWeights[item.style] || 0) + w;
    const fam = colorFamily(item.color);
    colorWeights[fam] = (colorWeights[fam] || 0) + w;
    if (item.gender) genderWeights[item.gender] = (genderWeights[item.gender] || 0) + w;
    weightedPriceSum += (parseFloat(item.price) || 0) * w;
  }

  if (totalWeight === 0) return null;

  return { styleWeights, colorWeights, genderWeights, avgPrice: weightedPriceSum / totalWeight, totalWeight };
}

// Ocena jednego produktu względem profilu smaku (udział wagi stylu/koloru/płci
// w historii użytkownika + bliskość ceny do jego średniej ważonej).
function profileScore(product, profile) {
  const styleShare = profile.styleWeights[product.style]
    ? profile.styleWeights[product.style] / profile.totalWeight
    : 0.15;
  const colorShare = profile.colorWeights[colorFamily(product.color)]
    ? profile.colorWeights[colorFamily(product.color)] / profile.totalWeight
    : 0.15;
  const genderShare = profile.genderWeights[product.gender]
    ? profile.genderWeights[product.gender] / profile.totalWeight
    : 0.05;
  const priceScore = priceProximityScore(profile.avgPrice, product.price);

  return styleShare * 0.4 + colorShare * 0.2 + genderShare * 0.3 + priceScore * 0.1;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Brak profilu (gość / nowy użytkownik) — wybór "po kolei" z każdego stylu
// (round-robin), żeby pierwsza partia miała równy rozkład stylów zamiast
// przypadkowo przekrzywionej próbki.
function coldStartFeed(pool, limit) {
  const byStyle = {};
  for (const p of pool) {
    const key = p.style || 'Casual';
    if (!byStyle[key]) byStyle[key] = [];
    byStyle[key].push(p);
  }
  Object.values(byStyle).forEach(shuffle);

  const styles = Object.keys(byStyle);
  const result = [];
  let i = 0;
  while (result.length < limit && styles.some((s) => byStyle[s].length > 0)) {
    const bucket = byStyle[styles[i % styles.length]];
    if (bucket.length > 0) result.push(bucket.pop());
    i++;
  }
  return result;
}

// Losowanie ważone bez zwracania — produkty o wyższym score mają dużo większą
// szansę wypaść wcześniej, ale kolejność/skład partii nie jest identyczny za
// każdym razem (w przeciwieństwie do zwykłego sortowania, które przy tym samym
// profilu smaku zawsze dałoby dokładnie tę samą kolejkę po odświeżeniu strony).
function weightedSample(scoredPool, limit) {
  const pool = scoredPool.slice();
  const result = [];
  while (pool.length > 0 && result.length < limit) {
    const total = pool.reduce((sum, p) => sum + p.score, 0);
    let r = Math.random() * total;
    let idx = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].score;
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// Ranguje produkty dla Feed względem profilu smaku; bez profilu — cold start.
function rankFeed(products, profile, excludeIds = [], limit = 10) {
  const excludeSet = new Set(excludeIds);
  const pool = products.filter((p) => !excludeSet.has(p.id));

  if (!profile) return coldStartFeed(pool, limit);

  // Podnosimy score do potęgi ("temperatura" doboru), żeby wyraźnie faworyzować
  // najlepiej dopasowane produkty — przy samym score losowanie ważone wychodziło
  // za mało zdecydowane (duża liczba średnio dopasowanych produktów w całym
  // katalogu przeważała łączną wagą nad garstką najlepszych trafień). Minimalna
  // podłoga przed potęgowaniem, żeby nawet słabe dopasowania miały rzadką szansę.
  const scored = pool.map((p) => ({ ...p, score: Math.pow(Math.max(profileScore(p, profile), 0.05), 3) }));
  return weightedSample(scored, limit);
}

module.exports = {
  getSlot,
  colorFamily,
  colorScore,
  styleScore,
  priceProximityScore,
  compatibilityScore,
  getCandidatesForSlot,
  getRandomForSlot,
  buildMatch,
  buildTasteProfile,
  profileScore,
  rankFeed
};
