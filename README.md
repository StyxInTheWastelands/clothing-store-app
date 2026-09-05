# Urban Stitch

Praca inżynierska: *Projekt i implementacja aplikacji webowej sklepu odzieżowego z systemem rekomendacji produktów*.

**Działająca strona:** https://clothing-store-app-rouge.vercel.app

## Opis

Urban Stitch to sklep internetowy z odzieżą z pełną funkcjonalnością e-commerce (rejestracja i logowanie, katalog z filtrowaniem, koszyk, zamówienia, zwroty i reklamacje, panel administratora) oraz autorskim systemem rekomendacji produktów, na który składają się dwa uzupełniające się moduły:

- **MATCH** — dobór kompletnego zestawu ubioru (góra, dół, dodatki) na podstawie wybranego produktu i preferencji stylu użytkownika.
- **Feed** — mechanizm typu „swipe”, w którym użytkownik ocenia produkty, budując profil stylu wykorzystywany do personalizacji kolejnych rekomendacji.

## Stos technologiczny

- **Frontend:** React, React Router, Context API
- **Backend:** Node.js, Express, JWT (autoryzacja), bcrypt (hashowanie haseł)
- **Baza danych:** PostgreSQL (Supabase), zapytania SQL bez ORM

## Uruchomienie lokalne

```bash
# backend
cd backend
npm install
cp .env.example .env   # uzupełnić DATABASE_URL
npm start               # http://localhost:5000

# frontend (w drugim terminalu)
cd frontend
npm install
cp .env.example .env   # domyślnie wskazuje na localhost:5000
npm start               # http://localhost:3000
```

## Struktura repozytorium

```
backend/    Express API, logika systemu rekomendacji (matchEngine.js), połączenie z bazą
frontend/   Aplikacja React (strony, komponenty, konteksty)
```
