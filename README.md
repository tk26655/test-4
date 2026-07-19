# Vintera — Marketplace Mody

Pełna aplikacja Next.js + Supabase. Logowanie, ogłoszenia, zdjęcia, czat, opinie, butiki.

## Szybki start

### 1. Pobierz i rozpakuj
```bash
cd vintera
```

### 2. Zainstaluj zależności
```bash
npm install
```

### 3. Skonfiguruj Supabase
- Wejdź na https://supabase.com i stwórz projekt
- Region: Central EU (Frankfurt)
- Wejdź w SQL Editor i wklej całą zawartość pliku `supabase_schema.sql` (poniżej) — kliknij Run
- Wejdź w Storage → New Bucket → nazwa: `listings` → Public bucket: ON
- Wejdź w Project Settings → API → skopiuj `Project URL` i `anon public` key

### 4. Stwórz plik .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 5. Uruchom
```bash
npm run dev
```
Otwórz http://localhost:3000

### 6. Opcjonalnie: dodaj funkcję czatu
Wklej zawartość `supabase_sql_extra.sql` do SQL Editor w Supabase.

### 7. Deploy (Vercel)
```bash
npm install -g vercel
vercel
```

## Funkcje
- ✅ Logowanie email (magic link) + Google OAuth
- ✅ Dodawanie ogłoszeń ze zdjęciami (do 5)
- ✅ Przeglądanie, filtrowanie, wyszukiwanie
- ✅ Szczegóły produktu z galerią
- ✅ Profil użytkownika / butiku
- ✅ Strona butików
- ✅ Czat realtime między użytkownikami
- ✅ System opinii (reviews)
- ✅ Baza AI-ready (embeddingi, tagi, moderacja)

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth, DB, Storage, Realtime)

## Baza AI-ready
Tabele mają prefiksowane kolumny `ai_*` gotowe na przyszłe wdrożenie AI:
- `ai_embedding` — wektory do wyszukiwania semantycznego
- `ai_tags` — auto-generowane tagi
- `ai_moderation_status` — status moderacji
- `ai_sentiment` — analiza sentymentu wiadomości
- `user_behaviors` — śledzenie aktywności do rekomendacji


## 🔒 System kodów zaproszeń (beta)

Cała strona jest zablokowana kodem. Aby wejść, trzeba wpisać kod zaproszenia.

### Dodawanie kodów
W Supabase SQL Editor:
```sql
INSERT INTO public.invite_codes (code, description, max_uses) VALUES
  ('TWOJKOD', 'Dla znajomych', 10);
```

### Wyłączenie blokady (gdy platforma publiczna)
Wystarczy zmienić 1 linijkę w `middleware.ts`:
```typescript
// ZAMIEŃ TO:
if (!inviteCookie) {
  return NextResponse.redirect(new URL("/zaproszenie", request.url));
}

// NA TO (lub usuń cały blok):
// if (!inviteCookie) { ... }
```

### Domyślne kody (dodane automatycznie)
- `VINTERA2026` — 100 użyć
- `SLASK` — 50 użyć
- `KATO` — 50 użyć


## 🆕 Dodatkowe funkcje

### Wyszukiwanie full-text
Wpisz nazwę produktu, markę lub słowo kluczowe w pasku wyszukiwania.

### Filtrowanie zaawansowane
- Cena (zakresy: 0-50, 50-100, 100-200, 200+)
- Rozmiar (XS-XXL, numeryczne)
- Stan (nowe, jak nowe, dobry, zadowalający)

### Sortowanie
Najnowsze, najstarsze, cena rosnąco/malejąco.

### Paginacja
20 produktów na stronę — szybkie ładowanie.

### Panel sprzedawcy (`/moje-ogloszenia`)
- Lista Twoich ogłoszeń
- Podgląd, usuwanie
- Szybkie dodawanie nowego

### Panel admina (`/admin`)
- Statystyki (ogłoszenia, użytkownicy, butiki, transakcje)
- Lista ostatnich ogłoszeń i użytkowników
- Dostęp tylko dla konta o nazwie "admin"

### Cookie banner (RODO)
Automatyczny baner zgody na cookies.

### Newsletter
Zapis do newslettera w bazie danych.

### PWA
- Manifest JSON
- Service Worker (offline cache)
- Można dodać do ekranu głównego telefonu

### Google Analytics
Wbudowany tracking (zmień `GA_MEASUREMENT_ID` w layout.tsx na swój ID).

### Skeleton loaders
Placeholder animacje podczas ładowania.

### Strony informacyjne
- `/jak-to-dziala` — Jak działa Vintera
- `/kontakt` — Dane kontaktowe
- `/regulamin` — Regulamin i RODO
 
