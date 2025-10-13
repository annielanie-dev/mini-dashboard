# ✅ Mini-Dashboard (Vanilla TS + Vite)

🔍 **Case study**

**Problem:**  
Chciałam pokazać pracę z publicznym API w „czystym” front-endzie bez frameworka – z pełnym UX (wyszukiwarka, paginacja) i poprawnymi stanami aplikacji (loading/empty/error/offline), plus akcent na dostępność (a11y).

**Rozwiązanie:**  
Zbudowałam mini-dashboard w TypeScript + Vite na bazie Rick & Morty API. Stan interfejsu jest odzwierciedlany w adresie URL (`?q=&page=`), więc można dzielić się linkami do wyników. Dodałam debounce wyszukiwania, skeletony przy ładowaniu, panel błędu z przyciskiem „Retry” oraz baner „offline”.

**Efekt:**  
Lekki, responsywny dashboard działający w przeglądarce bez backendu. Projekt opublikowany na GitHub i wdrożony na GitHub Pages, aby rekruter mógł od razu przetestować demo.

---

## ✨ Funkcje
- Wyszukiwanie z **debounce (300 ms)** po nazwie postaci.
- **Paginacja** z oknem stron i elipsami (np. `1 … 5 6 [7] 8 9 … 20`).
- **Stany aplikacji:** skeleton (loading), „Brak wyników” (empty), panel błędu z **Retry**, **offline indicator**.
- **A11y:** skip-link, `aria-live` dla statusów, `role="alert"` dla błędów, przenoszenie fokusu na nagłówek wyników.
- **URL-state**: filtr i strona w query params (wspierają wstecz/do przodu i udostępnianie linka).
- **Responsywny UI** i lazy-loading obrazków.

---

## 🛠️ Technologie
- **TypeScript** (bez frameworka)
- **Vite** (dev server + build)
- **Fetch API** do komunikacji z **Rick & Morty API**
- **CSS3** (lekki, dark UI)

---

## 📂 Struktura projektu
mini-dashboard/
└── .github/workflows/
└── pages.yml
└── public
└── images/
└── src/
├── main.ts
├── api.ts
├── pagination.ts
├── types.ts
└── vite-env.d.ts
└── utils/
└── debounce.ts
├── index.html
├── style.css
├── vite.config.ts
├── tsconfig.json
├── package-lock.json
├── package.json
├──.gitignore
├── README.md
└──LICENSE

---

## 📸 Zrzuty ekranu
![screenshot-6](https://github.com/user-attachments/assets/9e400dae-f841-4519-b9cd-c8afae49b30b)
![screenshot-7](https://github.com/user-attachments/assets/93a04f82-7a48-4114-85a1-ebe273cf5709)

---

## 🔗 Demo
- GitHub Pages: `https://annielanie-dev.github.io/mini-dashboard/`
- Repo: [`https://github.com/annielanie-dev/mini-dashboard`]

---

## 📌 Autor
Projekt stworzony przez **[Ania (annielanie-dev)](https://github.com/annielanie-dev)**  

---

## 📄 Licencja
Ten projekt dostępny na licencji [MIT](LICENSE).

---

## Uruchomienie
```bash
# instalacja
npm i
# dev
npm run dev
# build + lokalny podgląd builda
npm run build && npm run preview
