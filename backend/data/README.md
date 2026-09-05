# Jak dodać nowe produkty (`new-products.json`)

1. Otwórz `new-products.json` i zamień dwa przykładowe wpisy na prawdziwe produkty (możesz dodać dowolną ich liczbę — cel: ~25, różnych kategorii i obu płci).
2. Uruchom import: `node scripts/importProducts.js` (z folderu `backend`).
3. Skrypt można uruchamiać wielokrotnie — produkty, których `id` już jest w bazie, zostaną pominięte, więc możesz dopisywać kolejne partie do tego samego pliku.

## Pola

| Pole | Wymagane | Opis |
|---|---|---|
| `id` | tak | **Musi mieć format `kod/jakość/kolor`** (np. `9001/001/800`) — trzy segmenty oddzielone `/`, tak jak w istniejących produktach. To nie musi być prawdziwe SKU ze sklepu źródłowego, wystarczy że jest unikalne w tym formacie — strona produktu i warianty kolorystyczne polegają na tej strukturze. |
| `name` | tak | Nazwa produktu. |
| `description` | nie | Można zostawić `null`. |
| `sub_category` | nie | Wolny tekst, np. `"koszule"`. |
| `gender` | tak | Tylko `"women"` lub `"men"`. |
| `price` | tak | Liczba (PLN). |
| `old_price` | nie | Liczba lub `null` — jeśli produkt jest na wyprzedaży. |
| `is_sale` | nie | `true`/`false`, domyślnie `false`. |
| `sizes` | tak | Tablica stringów, np. `["XS","S","M","L"]`. |
| `color` | tak | Nazwa koloru po polsku (np. `"Czarny"`, `"Beżowy"`) — używana też do dopasowania kolorystycznego w MATCH. |
| `style` | tak | Na razie używamy `"Elegancki"` dla nowej partii (drugi klaster stylu obok istniejącego `"Casual"`/`"Streetwear"`). |
| `category_id` | tak | `1` koszulki/topy, `2` spodnie, `3` spodenki, `4` kurtki, `5` swetry/bluzy, `6` akcesoria, `7` spódnice. |
| `image` | tak | Bezpośredni URL do zdjęcia (ten sam sposób, w jaki dodawałaś dotychczasowe produkty). |
| `collection` | nie | Domyślnie `"regular"`. |
