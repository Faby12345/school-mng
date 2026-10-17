# Școala Mea — Architecture

## 1. Rezumat tehnic

Aplicația este un proiect full-stack Next.js, instalabil ca PWA și găzduit pe HTTPS. Next.js gestionează interfața, randarea server-side, mutațiile și endpointurile. Supabase oferă autentificare și PostgreSQL. Aplicația este online-first; service worker-ul oferă experiența de instalare și cache pentru shell/static assets, nu o bază paralelă de date.

## 2. Stack

| Zonă | Alegere |
|---|---|
| Framework | Next.js App Router + TypeScript |
| UI | React, Tailwind CSS, CSS custom properties |
| Componente | componente proprii + primitive accesibile, Lucide icons |
| Validare | Zod |
| Formulare | React Hook Form pentru formularele complexe |
| Backend | Server Actions și Route Handlers Next.js |
| Bază de date | Supabase PostgreSQL |
| Autentificare | Supabase Auth, sesiune în cookies |
| Autorizare | PostgreSQL Row Level Security |
| PWA | Web App Manifest + service worker propriu |
| Găzduire web | Vercel |
| Fișiere | export/import JSON; fără storage media în MVP |
| Testare | Vitest, Testing Library, Playwright |
| Package manager | pnpm |

Versiunile exacte se fixează în `pnpm-lock.yaml`. Nu se folosesc versiuni `latest` în automatizările de producție.

## 3. Ce înseamnă „aplicație pe ecran”

PWA-ul include `app/manifest.ts`, iconuri și `display: "standalone"`. Pe iPhone, utilizatoarea deschide URL-ul în Safari și alege **Add to Home Screen**. Pictograma deschide aplicația într-o fereastră standalone.

Aceasta nu este o extensie WidgetKit. Un widget iOS real nu poate fi livrat numai cu Next.js. Dacă va fi necesar, se poate construi ulterior un companion Swift foarte mic, care citește un endpoint securizat și expune un widget WidgetKit.

## 4. Structura proiectului

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── catalog/
│   │   ├── teme/
│   │   ├── invata/
│   │   └── setari/
│   ├── api/
│   │   ├── flashcards/generate/route.ts
│   │   ├── backup/export/route.ts
│   │   └── backup/import/route.ts
│   ├── auth/callback/route.ts
│   ├── manifest.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── error.tsx
├── components/
│   ├── ui/
│   ├── navigation/
│   └── shared/
├── features/
│   ├── subjects/
│   ├── grades/
│   ├── homework/
│   ├── lessons/
│   ├── flashcards/
│   └── reviews/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── proxy.ts
│   ├── auth/
│   ├── validation/
│   ├── flashcard-generation/
│   ├── calculations/
│   └── utils/
├── server/
│   ├── actions/
│   ├── queries/
│   └── repositories/
└── types/

public/
├── icons/
├── apple-touch-icon.png
├── offline.html
└── sw.js

supabase/
├── migrations/
├── seed.sql
└── config.toml

tests/
├── unit/
├── integration/
└── e2e/
```

Codul este organizat pe domenii. O funcționalitate își păstrează schema de validare, componentele și logica apropiate, fără foldere globale de tip `helpers` care devin neclare.

## 5. Randare și limite server/client

- paginile și interogările sunt Server Components implicit;
- Client Components sunt folosite numai pentru interacțiuni, formulare, animații și API-uri de browser;
- datele inițiale sunt citite pe server după verificarea sesiunii;
- mutațiile folosesc Server Actions pentru fluxurile interne;
- Route Handlers sunt folosite pentru AI, backup, Web Push și integrări care au nevoie de HTTP;
- după mutații se apelează `revalidatePath` sau `revalidateTag`;
- se evită un store global dacă starea poate rămâne în URL, formular sau server.

## 6. Autentificare

### Flux

1. Contul unic este creat manual.
2. Înregistrarea publică este dezactivată.
3. Utilizatoarea intră cu email și parolă.
4. Sesiunea este păstrată în cookies și reînnoită prin integrarea SSR Supabase.
5. Rutele din grupul `(app)` verifică utilizatorul pe server.
6. După instalarea PWA, sesiunea rămâne activă conform politicii de expirare configurate.

Protecția rutelor îmbunătățește experiența, dar securitatea reală este asigurată de RLS. Cheia `service_role` nu ajunge niciodată în browser.

## 7. Schema bazei de date

Toate tabelele de conținut au:

- `id uuid primary key default gen_random_uuid()`;
- `user_id uuid not null references auth.users(id)`;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()`.

### `subjects`

```text
name              text not null
icon              text not null
color_token       text not null
sort_order        integer not null default 0
```

Un index unic pe `(user_id, lower(name))` împiedică duplicatele indiferent de majuscule și spațiile sunt eliminate înainte de salvare.

### `grades`

```text
subject_id        uuid not null references subjects(id) on delete cascade
value             smallint not null check (value between 1 and 10)
assessment_type   text not null
graded_on         date not null
note              text
```

Media nu este persistată; este calculată din note. Formula este izolată astfel încât ponderile să poată fi adăugate ulterior.

### `homework`

```text
subject_id        uuid references subjects(id) on delete set null
title             text not null
details           text
due_at            timestamptz not null
priority          text not null check (priority in ('low', 'medium', 'high'))
completed_at      timestamptz
reminder_at       timestamptz
```

### `lessons`

```text
subject_id        uuid not null references subjects(id) on delete cascade
title             text not null
notes             text not null default ''
```

În interfață, un `lesson` este prezentat ca un capitol sau subiect de studiu. Această denumire păstrează schema existentă, dar permite fluxul Materie → Capitol → Notițe fără un tabel redundant.

### `flashcards`

```text
lesson_id         uuid not null references lessons(id) on delete cascade
question          text not null
answer            text not null
source            text not null check (source in ('manual', 'generated'))
next_review_at    timestamptz not null default now()
interval_days     integer not null default 0
ease_score        numeric not null default 2.0
```

Pentru cardurile manuale de notițe, `question` este titlul sau ideea-cheie, iar `answer` este conținutul notiței. Relația are `on delete cascade`, astfel încât ștergerea unui capitol elimină în siguranță toate cardurile sale.

### `study_reviews`

```text
flashcard_id      uuid not null references flashcards(id) on delete cascade
rating            text not null check (rating in ('again', 'hard', 'known'))
reviewed_at       timestamptz not null default now()
```

### `push_subscriptions` — post-MVP

```text
endpoint          text not null
p256dh            text not null
auth              text not null
unique(user_id, endpoint)
```

## 8. Row Level Security

RLS este activat pe fiecare tabel. Politica de bază este:

```sql
using (auth.uid() = user_id)
with check (auth.uid() = user_id)
```

Pentru relații, serverul nu acceptă orbește `subject_id`, `lesson_id` sau `flashcard_id`. Verifică și că părintele aparține aceluiași utilizator. Testele de integrare încearcă explicit accesul cross-user și trebuie să primească refuz.

Chiar dacă există un singur cont, această izolare este obligatorie deoarece aplicația este găzduită pe internet.

## 9. Server Actions și validare

Fiecare mutație urmează aceiași pași:

1. citește utilizatorul autentificat pe server;
2. parsează `FormData` cu o schemă Zod;
3. normalizează textul și datele;
4. execută operația folosind `user_id` din sesiune, niciodată din formular;
5. tratează constrângerile bazei de date;
6. invalidează datele afectate;
7. returnează un rezultat serializabil și sigur pentru UI.

Tip recomandat:

```ts
type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors?: Record<string, string[]>; message: string }
```

## 10. Generarea flashcardurilor

Browserul nu comunică direct cu furnizorul AI. Fluxul este:

```text
Lesson editor
  → POST /api/flashcards/generate
  → auth + rate limit + Zod
  → FlashcardGenerator
  → validare output structurat
  → QuestionDraft[]
  → ecran de revizuire
  → Server Action de salvare
```

Interfața internă:

```ts
type QuestionDraft = {
  question: string
  answer: string
}

interface FlashcardGenerator {
  generate(input: {
    subject: string
    title: string
    notes: string
    count: number
  }): Promise<QuestionDraft[]>
}
```

Reguli:

- cheia API este disponibilă numai pe server;
- promptul cere limba română și interzice informații care nu apar în notițe;
- outputul este structurat și validat cu Zod;
- se aplică limită de lungime și maximum de carduri per cerere;
- endpointul are rate limiting;
- propunerile nu sunt salvate automat;
- eroarea nu modifică lecția;
- providerul poate fi schimbat fără modificarea UI-ului.

Pentru dezvoltare și funcționare fără cheie AI există un `HeuristicFlashcardGenerator`, care recunoaște definiții și enumerări simple.

## 11. Repetarea flashcardurilor

Un serviciu pur `scheduleNextReview` primește ratingul și starea actuală:

- `again`: mai târziu în aceeași zi;
- `hard`: ziua următoare;
- `known`: 3 zile, apoi intervalul se multiplică gradual;
- intervalul are un prag maxim configurabil.

Actualizarea cardului și inserarea în `study_reviews` au loc într-o singură operație server-side. Algoritmul este testat separat și poate fi înlocuit ulterior.

## 12. PWA

### Manifest

`app/manifest.ts` definește:

- `name` și `short_name`;
- `start_url: "/"`;
- `display: "standalone"`;
- culorile light/dark potrivite;
- iconuri 192×192 și 512×512;
- icon maskable;
- categorii și descriere.

În plus se oferă `apple-touch-icon.png` și metadatele iOS relevante.

### Service worker

`public/sw.js` este mic și explicit:

- cache-uiește doar shell-ul și asseturile statice versionate;
- folosește network-first pentru navigare;
- nu cache-uiește răspunsuri de autentificare, mutații sau conținut privat API;
- oferă o pagină offline clară;
- elimină cache-urile vechi la `activate`;
- poate primi ulterior evenimente Web Push.

MVP-ul este online-first. Nu se afișează butonul „Salvat” înainte ca serverul să confirme operația.

### Instalare

Pe iOS nu se bazează pe `beforeinstallprompt`. Un component detectează Safari/iOS și afișează instrucțiunile Share → Add to Home Screen. Mesajul dispare după instalare sau după ce utilizatoarea îl închide.

## 13. Notificări

### MVP

- indicator pentru teme apropiate în dashboard;
- badge în interfață;
- reminder vizibil la deschiderea aplicației.

### Post-MVP: Web Push

- permisiunea este cerută doar după o acțiune explicită;
- service worker-ul salvează `PushSubscription` în baza de date;
- un job programat caută reminderele scadente;
- serverul semnează mesajele cu VAPID;
- clickul pe notificare deschide tema relevantă;
- endpointurile expirate sunt eliminate;
- se păstrează un jurnal idempotent pentru a evita notificări duplicate.

Web Push se testează obligatoriu pe PWA instalată pe iPhone, nu doar în browser desktop.

## 14. Design system web

### Tokenuri

`globals.css` definește tokenuri semantice:

```css
:root {
  --background: ...;
  --surface: ...;
  --surface-glass: ...;
  --foreground: ...;
  --muted: ...;
  --accent: ...;
  --border: ...;
  --danger: ...;
  --shadow: ...;
}

[data-theme="dark"] {
  /* aceleași tokenuri, valori dark */
}
```

Nu se folosesc culori hardcodate în componente. Culoarea unei materii este un token dintr-o listă controlată, nu CSS introdus arbitrar de utilizator.

### Glass surfaces

`GlassSurface` combină:

- fundal semitransparent;
- `backdrop-filter: blur(...) saturate(...)`;
- border cu transparență;
- umbră discretă;
- fallback opac când blur-ul nu este suportat;
- variantă redusă pentru `prefers-reduced-transparency`.

Glass se folosește pentru tab bar, sheets și acțiuni flotante. Listele și formularele folosesc suprafețe solide pentru lizibilitate și performanță.

### Safe areas

Tab bar-ul și sheets folosesc:

```css
padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
```

Viewportul evită salturile produse de bara Safari și tastatura virtuală. Formularele nu depind de o înălțime fixă `100vh`.

## 15. Tema

Tema are valorile `system`, `light`, `dark`:

- preferința se păstrează în cookie pentru randarea server-side;
- un script inline minimal aplică tema înainte de hidratare;
- `system` urmărește `prefers-color-scheme`;
- culoarea browser UI este actualizată prin metadata/theme-color;
- schimbarea temei nu produce flash sau hydration mismatch.

## 16. Backup și portabilitate

Endpointul de export:

- verifică sesiunea;
- citește numai datele utilizatorului;
- returnează JSON versionat;
- exclude secrete, sesiuni și abonamente push.

Importul:

1. parsează fișierul fără să modifice datele;
2. validează schema și dimensiunea;
3. afișează un rezumat;
4. cere confirmare;
5. importă tranzacțional;
6. raportează elementele ignorate sau duplicate.

## 17. Securitate

- HTTPS obligatoriu în producție;
- RLS activ pe toate tabelele de conținut;
- validare server-side pentru toate datele;
- CSP, `X-Content-Type-Options`, `Referrer-Policy` și protecție anti-framing;
- cookies de sesiune `Secure`, `HttpOnly` unde integrarea permite și `SameSite` potrivit;
- fără secrete în variabile `NEXT_PUBLIC_*`;
- rate limiting pentru autentificare, AI și import;
- limită pentru dimensiunea notițelor și fișierelor JSON;
- logurile nu includ notițe, răspunsuri AI sau tokenuri;
- dependențele și migrațiile sunt fixate și revizuite.

## 18. Observabilitate

În MVP se păstrează observabilitate minimă, fără analytics comportamental:

- erori server cu request ID;
- log pentru operații eșuate, fără conținut personal;
- health check pentru aplicație și conexiunea la bază;
- raportarea erorilor client poate fi adăugată ulterior numai după configurarea filtrării datelor personale.

## 19. Testare

### Unit

- calcularea și simularea mediei;
- validarea notelor și termenelor;
- programarea recapitulării;
- parsarea outputului de flashcarduri;
- selecția temei și funcțiile de dată.

### Integration

- Server Actions cu o bază de test;
- RLS: utilizatorul A nu poate citi sau modifica datele utilizatorului B;
- ștergeri în cascadă;
- import/export round-trip;
- fallback când generatorul AI eșuează.

### End-to-end

- login și protecția rutelor;
- adăugare notă și afișare medie;
- creare și finalizare temă;
- lecție → generare → editare → salvare carduri;
- sesiune de recapitulare;
- Light/Dark Mode;
- manifest valid și pornire standalone;
- layout pe viewport-uri de iPhone.

## 20. Deployment

### Medii

- local;
- preview pentru fiecare branch/PR;
- production.

Fiecare mediu are propriile variabile și, ideal, propria bază de date. Migrațiile SQL sunt păstrate în Git și aplicate înaintea codului care depinde de ele.

### Variabile

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY        # numai dacă este strict necesară pe server
AI_API_KEY                       # server only
NEXT_PUBLIC_APP_URL
VAPID_PUBLIC_KEY                 # post-MVP
VAPID_PRIVATE_KEY                # post-MVP, server only
```

Niciun fișier `.env.local` nu este comis.

## 21. Ordinea implementării

1. Inițializare Next.js, TypeScript, linting și testare.
2. Design tokens, shell mobil, tab bar și dark mode.
3. Supabase Auth, rută privată și RLS.
4. Schema SQL, migrații și seed pentru materii.
5. Catalog și simulator de medie.
6. Teme și dashboard.
7. Lecții, flashcarduri și recapitulare.
8. Generator server-side și verificarea propunerilor.
9. Manifest, service worker și ghid de instalare.
10. Backup, accesibilitate, securitate și teste E2E.
11. Opțional: Web Push.
12. Opțional: companion Swift + WidgetKit.

## 22. Reguli de implementare

- Server Components sunt implicite; `"use client"` necesită un motiv concret.
- `user_id` vine exclusiv din sesiunea verificată.
- RLS nu este dezactivat pentru comoditate.
- Secretele nu ajung în browser.
- Conținutul generat nu se salvează automat.
- PWA nu pretinde suport offline pentru mutații înainte ca acesta să fie implementat corect.
- Actualizările bazei de date trec prin migrații versionate.
- Nu se adaugă o bibliotecă dacă platforma sau câteva linii clare rezolvă problema.
- Orice acțiune distructivă cere confirmare și descrie impactul.

