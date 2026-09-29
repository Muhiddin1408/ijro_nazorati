# Ijro nazorati — Ichki hisobotlarni boshqarish tizimi
## Loyihaning to‘liq texnik va funksional hujjati

> Hujjat 2026-09-28 holatidagi kod asosida tuzilgan. Barcha fayl yo‘llari
> loyiha ildiz papkasiga (`ijro-nazorati/`) nisbatan berilgan.

---

## Mundarija

1. [Tizim nima va kim uchun](#1-tizim-nima-va-kim-uchun)
2. [Texnologiyalar va arxitektura](#2-texnologiyalar-va-arxitektura)
3. [Papka va fayllar tuzilmasi](#3-papka-va-fayllar-tuzilmasi)
4. [Ishga tushirish, build, test va deploy](#4-ishga-tushirish-build-test-va-deploy)
5. [Muhit o‘zgaruvchilari (env)](#5-muhit-ozgaruvchilari-env)
6. [Kirish (autentifikatsiya) va sessiyalar](#6-kirish-autentifikatsiya-va-sessiyalar)
7. [Rollar, vakolatlar va kirish profillari](#7-rollar-vakolatlar-va-kirish-profillari)
8. [Tashkiliy tuzilma: tashkilot, bo‘lim, xodim, shtat](#8-tashkiliy-tuzilma-tashkilot-bolim-xodim-shtat)
9. [Topshiriqlar](#9-topshiriqlar)
10. [Yig‘ilishlar](#10-yigilishlar)
11. [Telegram bot va eslatmalar](#11-telegram-bot-va-eslatmalar)
12. [Korporativ chat (Muloqot)](#12-korporativ-chat-muloqot)
13. [Davriy hisobotlar (Hisobotlar)](#13-davriy-hisobotlar-hisobotlar)
14. [Ma’lumotlar markazi](#14-malumotlar-markazi)
15. [AI qidiruv](#15-ai-qidiruv)
16. [Ilmiy tadqiqotlar](#16-ilmiy-tadqiqotlar)
17. [Bosh sahifa, rahbar paneli va tahlil](#17-bosh-sahifa-rahbar-paneli-va-tahlil)
18. [Audit jurnali](#18-audit-jurnali)
19. [Interfeys: menyu, alifbo, mavzular, mobil](#19-interfeys-menyu-alifbo-mavzular-mobil)
20. [Ma’lumotlar bazasi (jadvallar va migratsiyalar)](#20-malumotlar-bazasi-jadvallar-va-migratsiyalar)
21. [Barcha API marshrutlari ro‘yxati](#21-barcha-api-marshrutlari-royxati)
22. [Xavfsizlik choralari](#22-xavfsizlik-choralari)
23. [Testlar](#23-testlar)
24. [Ma’lum cheklovlar va kuzatilgan kamchiliklar](#24-malum-cheklovlar-va-kuzatilgan-kamchiliklar)
25. [Tezkor ma’lumotnoma (limitlar va konstantalar)](#25-tezkor-malumotnoma-limitlar-va-konstantalar)

---

## 1. Tizim nima va kim uchun

**Ijro nazorati** (paket nomi `ijro-nazorati`, ko‘rinadigan nomi *“Ichki
hisobotlarni boshqarish tizimi”*) — O‘zavtoyo‘l (Avtomobil yo‘llari qo‘mitasi)
tizimi uchun yaratilgan ichki ERP veb-ilovasi. U quyidagilarni bitta joyda
birlashtiradi:

| Modul | Vazifasi |
|---|---|
| **Topshiriqlar** | Rahbariyat topshiriqlarini berish, yo‘naltirish (delegatsiya), bajarilishini kuzatish, davomiy (takrorlanuvchi) topshiriqlar |
| **Yig‘ilishlar** | Yig‘ilishlar taqvimi, ishtirokchilar, eslatmalar |
| **Muloqot (chat)** | Umumiy e’lonlar, bo‘lim, guruh va shaxsiy suhbatlar, 500 MB gacha fayllar |
| **Telegram bot** | Muddat eslatmalari, bildirishnomalar, botdan topshiriqni qabul qilish/bajarildi deyish |
| **Hisobotlar** | Davriy (haftalik/oylik/choraklik/yillik) jadvalli hisobotlarni tashkilotlardan yig‘ish, quyi tashkilotlarga yo‘naltirish, tasdiqlash |
| **Ma’lumotlar markazi** | 16 boshqarma, 49 ta manba jadval shakli; ma’lumot kiritish → ko‘rib chiqish → tasdiqlash → nashr zanjiri |
| **AI qidiruv** | Ma’lumotlar markazi bo‘yicha lotin/kirill to‘liq matnli qidiruv, ixtiyoriy OpenAI javobi |
| **Ilmiy tadqiqotlar** | Ilmiy loyihalar, 6 bosqichli ish jarayoni, muammolar, takliflar |
| **Administratsiya** | Xodimlar, bo‘limlar, tashkilotlar, rollar, shtatlar, tematikalar, loginlar, Telegram sozlamasi |
| **Audit jurnali** | Barcha muhim o‘zgarishlar tarixi, Excel eksport |

Tizim ierarxiyaga asoslangan: **Markaziy apparat → Hududiy boshqarmalar →
Tuman korxonalari**, shuningdek **bevosita bo‘ysunuvchi tashkilotlar**. Har bir
foydalanuvchi faqat o‘z vakolati doirasidagi ma’lumotlarni ko‘radi va o‘zgartiradi.

Ishlab turgan nusxa (production) OpenAI Sites platformasida joylashgan:
(eski OpenAI Sites manzili — endi ishlatilmaydi)
(egasi ChatGPT akkaunti orqali kiradi). `TIZIMNI_OCHISH.html` fayli shu havolani
ochuvchi oddiy sahifa.

---

## 2. Texnologiyalar va arxitektura

| Qatlam | Texnologiya |
|---|---|
| Til | TypeScript 5.9 |
| Frontend | React 19.2, Next.js 16 App Router uslubi, **Vinext** (Next.js’ni Vite ustida ishlatuvchi) |
| Build | Vite 8, `@vitejs/plugin-rsc`, `@cloudflare/vite-plugin` |
| Server | **Cloudflare Workers** (`worker/index.ts`) |
| Ma’lumotlar bazasi | **Cloudflare D1** (SQLite), binding nomi `DB` |
| ORM / migratsiya | Drizzle ORM + `drizzle/` papkadagi SQL migratsiyalar (0000–0031) |
| Fayl ombori | **Cloudflare R2**, binding nomi `BUCKET` |
| Qidiruv | SQLite **FTS5** (`app_center_search`) |
| UI | Tailwind CSS 4, Radix UI, lucide-react ikonkalar, sonner (toast) |
| Excel | `xlsx-js-style` (eksport/import, dinamik yuklanadi) |
| Word | `docx` (rahbar AI-tahlil hisobotini .docx qilish) |
| Xabar | Telegram Bot API |
| AI (ixtiyoriy) | OpenAI Responses API (`gpt-4.1-mini` standart) |
| CI | GitHub Actions (`.github/workflows/ci.yml`), Node 24.14.0 |

### So‘rov qanday o‘tadi

```
Brauzer (React SPA: app/dashboard.tsx)
   │  fetch("/api/...")  (cookie: ijro_session)
   ▼
Cloudflare Worker  (worker/index.ts)
   │  - /_vinext/image → rasm optimizatsiyasi
   │  - qolgan hammasi → vinext app-router handler
   │  - javobga xavfsizlik headerlari qo‘shiladi
   ▼
app/api/**/route.ts   (GET/POST/PATCH/DELETE handlerlar)
   │  requireActor() → sessiya, rol, vakolatlar (lib/auth.ts)
   │  vakolat tekshiruvi (lib/access-control.ts, lib/mutation-authority.ts)
   ▼
D1 (SQL)  +  R2 (fayllar)  +  app_audit_logs (audit)
   │
   └─► app_notification_jobs (Telegram outbox) → processNotificationJobs() → Telegram
```

### Fon ishlari (background)

`worker/index.ts` da ikki kirish nuqtasi bor:

- **`fetch`** — oddiy HTTP so‘rovlar. Agar `/api/bootstrap` so‘rovi `canConfigure`
  huquqli administratordan kelsa, javobdan keyin 20 ta navbatdagi Telegram
  xabari yuboriladi (cron bo‘lmagan hostinglar uchun zaxira).
- **`scheduled`** (cron) — har ishga tushganda:
  - `processNotificationJobs(100)` — 100 tagacha Telegram xabarini yuboradi;
  - `ensureReportCycles()` — davriy hisobotlarning yangi davrlarini yaratadi.

Bundan tashqari mutatsiyalardan keyin `lib/background.ts` dagi
`runInBackground()` (Workers `waitUntil`) orqali xabarlar darhol yuboriladi.

Barcha javoblarga qo‘shiladigan headerlar: `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy: camera=(), microphone=(), geolocation=()`, CSP
(`base-uri 'self'; object-src 'none'; frame-ancestors 'none'`), HTML va API
javoblari uchun `Cache-Control: private, no-store`.

---

## 3. Papka va fayllar tuzilmasi

```
ijro-nazorati/
├── app/                      # Frontend sahifalar + API marshrutlar
│   ├── layout.tsx            # HTML skelet, dark-theme, FOUC oldini olish skripti
│   ├── page.tsx              # Kirish nuqtasi → Dashboard
│   ├── dashboard.tsx         # Asosiy "shell": menyu, bootstrap, sahifa almashtirish
│   ├── dashboard-home.tsx    # Bosh sahifa
│   ├── dashboard-kit.tsx     # readJson, PageIntro, ModalFrame, OrganizationCascadePicker
│   ├── login-screen.tsx      # Kirish va akkauntni faollashtirish ekrani
│   ├── tasks-page.tsx        # Topshiriqlar sahifasi
│   ├── meetings-page.tsx     # Yig‘ilishlar sahifasi
│   ├── task-meeting-modals.tsx  # Topshiriq/yig‘ilish yaratish, tahrirlash, tafsilot oynalari
│   ├── task-meeting-export.ts   # Topshiriq/yig‘ilish Excel eksporti
│   ├── chat-page.tsx         # Muloqot (chat)
│   ├── reports-page.tsx      # Davriy hisobotlar
│   ├── information-center.tsx   # Ma’lumotlar markazi
│   ├── information-dashboard.tsx# Shakl ichidagi ma’lumotlar ish maydoni (drill-down, KPI)
│   ├── information-search.tsx   # AI qidiruv sahifasi
│   ├── research-reports.tsx  # Ilmiy tadqiqotlar ish maydoni
│   ├── executive-reports.tsx # Rahbar paneli (hozir menyuga ulanmagan, §17)
│   ├── local-insights.tsx    # Brauzer ichidagi xavf/tavsiya tahlili
│   ├── admin-pages.tsx       # Shtatlar, Xodimlar, Rollar, Tashkilotlar, Xavfsizlik, Telegram, KPI
│   ├── admin-modals.tsx      # Xodim/rol/bo‘lim/tashkilot/tematika/Telegram modallari
│   ├── audit-page.tsx, audit-export.ts  # Audit jurnali va eksporti
│   ├── notification-prefs.tsx# Telegram bildirishnoma sozlamalari (tinch soatlar)
│   ├── theme-mode-toggle.tsx # Yorug‘/qorong‘i/tizim rejimi
│   ├── ui-helpers.tsx        # Lotin↔Kirill, sana formatlari, BrandMark, ThemePicker
│   ├── road-loader.tsx       # Yuklanish animatsiyasi
│   ├── chatgpt-auth.ts       # ChatGPT SSO yordamchilari (hozir ishlatilmaydi)
│   ├── globals.css, dark-theme.css, information-search.css
│   └── api/                  # Server API (batafsil §21)
├── components/ui/            # Umumiy UI komponentlar (button, dialog, table, ...)
├── lib/                      # Server biznes-mantiqi
│   ├── auth.ts               # requireActor, sessiya, vakolat to‘plami, audit()
│   ├── password.ts           # PBKDF2 xesh, login/parol qoidalari
│   ├── owner-sso.ts          # Tizim egasining SSO bog‘lanishi
│   ├── access-control.ts     # Kirish profillari, avtomatik profil aniqlash
│   ├── mutation-authority.ts # Kim nimani o‘zgartira oladi
│   ├── audiences.ts          # Tashkilot/bo‘lim auditoriyasi
│   ├── directory.ts          # Xodimlar katalogi qidiruvi
│   ├── data.ts               # Topshiriq/yig‘ilish ro‘yxatlari
│   ├── recurrence.ts         # Davomiy topshiriqning keyingi davri
│   ├── telegram.ts           # Outbox, eslatmalar, webhook, bot buyruqlari
│   ├── quiet-hours.ts        # Tinch soatlar (Toshkent vaqti)
│   ├── chat.ts, chat-uploads.ts  # Chat kanallari va katta fayl yuklash
│   ├── reports.ts, report-*.ts, table-values.ts  # Hisobotlar
│   ├── information*.ts       # Ma’lumotlar markazi, ish jarayoni, qidiruv, AI
│   ├── search-language.ts    # O‘zbekcha qidiruv so‘rovini tayyorlash
│   ├── research-server.ts, research-policy.ts  # Ilmiy tadqiqotlar
│   ├── activation-url.ts     # ?activate= tokenini URL’dan olib tashlash
│   └── background.ts         # waitUntil orqali fon ishi
├── db/
│   ├── schema.ts             # Drizzle sxemasi (70+ jadval)
│   └── index.ts              # getRuntimeEnv(), getD1() — env va D1’ni olish
├── drizzle/                  # SQL migratsiyalar 0000–0031 (+ meta/)
├── data/                     # Ma’lumotlar markazi katalogi (JSON) va namunaviy yozuvlar
├── worker/index.ts           # Cloudflare Worker kirish nuqtasi (fetch + scheduled)
├── build/sites-vite-plugin.ts# Build’dan keyin hosting.json va migratsiyalarni dist/.openai ga ko‘chiradi
├── scripts/                  # install-ci, build-verified, validate-artifact, sites-env, katalog generatori
├── tests/                    # 20 ta test fayli (node --test)
├── docs/                     # REVIEW.md, KNOWN_LIMITATIONS.md, TABLE_WORKFLOW_REVIEW_2026-09-17.md
├── examples/d1/              # Shablondan qolgan D1 namunasi (tizimda ishlatilmaydi)
├── public/                   # Logotip, emblema, favicon
├── .openai/hosting.json      # Sites hosting: D1=DB, R2=BUCKET
├── wrangler.local.jsonc      # Mahalliy wrangler sozlamasi
├── vite.config.ts, drizzle.config.ts, tsconfig.json, eslint.config.mjs
├── README.md, BOSHLASH.md, SECURITY.md, TIZIMNI_OCHISH.html
└── package.json, package-lock.json
```

---

## 4. Ishga tushirish, build, test va deploy

### Talablar
- Node.js 24 (kamida 22.15.0), npm;
- Linux yoki Windows WSL (Ubuntu) — skriptlar Bash, `flock`, GNU `timeout`,
  `curl`, `sha256sum` dan foydalanadi.

### Mahalliy ishga tushirish

```bash
npm ci                      # kutubxonalarni o‘rnatish
npm run db:local:migrate    # drizzle/ migratsiyalarini mahalliy D1 ga qo‘llash
npm run dev                 # Vite dev server → http://localhost:5173
```

Dev rejimida (`NODE_ENV=development`) login talab qilinmaydi: tizim avtomatik
ravishda seed qilingan administrator `admin@ijro.local` sifatida
ochiladi. Mahalliy D1/R2 ma’lumotlari `.wrangler/state` da saqlanadi.
Production ma’lumotlari mahalliy nusxaga ko‘chmaydi.

### npm skriptlari

| Skript | Nima qiladi |
|---|---|
| `dev` | Vite dev server (Cloudflare plugin bilan D1/R2 emulyatsiyasi) |
| `build` | `scripts/build-verified.sh` — vinext build (3 daqiqa limit), maxfiy migratsiyalarni tozalash, artefaktni tekshirish |
| `start` | `vinext start` — build natijasini ishga tushirish |
| `test` | avval build, so‘ng `node --test tests/*.test.mjs` |
| `check` | lint + `tsc --noEmit` + test |
| `lint` | ESLint |
| `db:local:migrate` | Mahalliy D1 ga migratsiyalar |
| `db:generate` | Drizzle yangi migratsiya generatsiyasi |
| `install:ci` | CI uchun himoyalangan `npm ci` (lockfile tekshiruvi, vinext tarball yaxlitligi, bitta parallel o‘rnatish) |
| `validate:artifact` | `dist/server/index.js` da `default.fetch` borligini va `dist/.openai/hosting.json` ni tekshiradi |

`scripts/sites-env.sh` — barcha skriptlarni loyiha ichidagi izolyatsiyalangan
`HOME`, npm kesh va wrangler log papkalari (`.sites-runtime/`) bilan ishga
tushiradi.

### Build va deploy

1. `npm run build` → `dist/` (Worker: `dist/server/index.js`).
2. `build/sites-vite-plugin.ts` `dist/.openai/` ga `hosting.json` va butun
   `drizzle/` papkasini ko‘chiradi — hosting shu migratsiyalarni D1 ga qo‘llaydi.
3. Birinchi administrator uchun maxfiy seed `SITES_PRIVATE_MIGRATION_PATH`
   orqali (`NNNN_private_nom.sql` formatida) faqat deploy paytida qo‘shiladi;
   oldingi build’dan qolgan `*_private_*.sql` fayllar avtomatik o‘chiriladi.

Production talablari: `DB` (D1) va `BUCKET` (R2) bindinglari, barcha
migratsiyalar, §5 dagi maxfiy qiymatlar, Telegram uchun ommaviy HTTPS manzil
va cron trigger (eslatmalar va hisobot davrlari uchun).

### CI (`.github/workflows/ci.yml`)
`main` ga push va har PR’da: Node 24.14.0 → `npm run install:ci` →
`npm run check` → `npm audit --omit=dev --audit-level=high`.

---

## 5. Muhit o‘zgaruvchilari (env)

Namunasi `.env.example` da. Mahalliy qiymatlar `.env.local` ga yoziladi
(Git’ga kirmaydi).

| O‘zgaruvchi | Maxfiy? | Vazifasi |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Ha | BotFather bergan token |
| `TELEGRAM_WEBHOOK_SECRET` | Ha | Webhook so‘rovlarini tekshirish siri |
| `TELEGRAM_BOT_USERNAME` | Yo‘q | Bot nomi (masalan `Ijro_nazorati_uzavtoyul_bot`), ulash havolasi uchun |
| `REMINDER_JOB_SECRET` | Ha | `POST /api/reminders/process` ni tashqi cron’dan chaqirish uchun Bearer |
| `SITE_BASE_URL` | Yo‘q | Ommaviy HTTPS manzil (webhook va havolalar uchun) |
| `APP_TIMEZONE` | Yo‘q | `Asia/Tashkent` |
| `INFORMATION_INGEST_SECRET` | Ha | Tashqi integratsiyalar uchun `POST /api/information/ingest` Bearer siri |
| `TRUST_OAI_AUTHENTICATED_USER_HEADER` | Yo‘q | `true` faqat ishonchli Sites proksi ortida — identifikatsiya headerlariga ishonish |
| `OWNER_SSO_EMAIL` | Yo‘q | Tizim egasining emaili (SSO orqali birinchi bog‘lanish uchun) |
| `OPENAI_API_KEY` | Ha | Ixtiyoriy: AI qidiruvda matnli javob uchun |
| `OPENAI_SEARCH_MODEL` | Yo‘q | Ixtiyoriy, standart `gpt-4.1-mini` |

---

## 6. Kirish (autentifikatsiya) va sessiyalar

### 6.1. Login va parol qoidalari (`lib/password.ts`)

- **Login:** 4–32 belgi, lotin harfi bilan boshlanadi, faqat `a-z 0-9 . _ -`
  (`/^[a-zA-Z][a-zA-Z0-9._-]{3,31}$/`), NFKC + kichik harfga keltiriladi.
- **Parol:** 10–128 belgi, kamida bitta harf (lotin yoki kirill) va bitta raqam;
  `password`, `parol`, `admin`, `123456`, `qwerty` bilan boshlanmasligi kerak.
- **Xesh:** PBKDF2-SHA256, **aniq 100 000 iteratsiya**, 16 baytlik tasodifiy salt,
  256-bit natija, base64. Taqqoslash doimiy vaqtda. Boshqa iteratsiyali xesh
  qabul qilinmaydi → administrator parolni qayta chiqarishi kerak (409).
- **Tokenlar:** 32 bayt base64url; bazada faqat SHA-256 xeshi saqlanadi.
- **Vaqtinchalik parol:** 16 belgi, katta/kichik harf, raqam va `!@#$%*-_`
  belgilaridan kamida bittadan (chalkash I, O, l belgilari yo‘q).

### 6.2. Kirish (`POST /api/auth/login`)

1. `assertSameOrigin` — boshqa saytdan kelgan so‘rov rad etiladi.
2. Login bo‘yicha foydalanuvchi topiladi; xodim faol bo‘lishi shart.
3. **Bloklash:** ketma-ket **5 ta** xato urinishdan so‘ng akkaunt **15 daqiqa**
   bloklanadi (bloklangan paytda 423).
4. Vaqtinchalik parol muddati (30 kun) o‘tgan bo‘lsa — 410.
5. Sessiya: “Eslab qolish” belgilansa **30 kun**, aks holda **12 soat**.
6. Cookie’lar:
   - `ijro_session` — `HttpOnly; SameSite=Lax; Secure` (https’da);
   - `ijro_login_only=1` (1 yil) — shu brauzerda SSO avtomatik kirishini o‘chiradi.
7. Muddati o‘tgan va 30 kundan eski sessiyalar tozalanadi.

### 6.3. Boshqa kirish marshrutlari

| Marshrut | Vazifasi |
|---|---|
| `POST /api/auth/logout` | Sessiyani o‘chiradi, cookie’ni tozalaydi, `ijro_login_only=1` qo‘yadi |
| `POST /api/auth/activate` | Bir martalik havola orqali akkauntni faollashtirish: `{token, username, password}`. Token ishlatilgan/bekor qilingan/muddati o‘tgan bo‘lsa 410. Muvaffaqiyatda xodimning boshqa ochiq tokenlari bekor qilinadi |
| `POST /api/auth/change-password` | Joriy parolni tekshirib yangisini qo‘yadi; `must_change_password` tozalanadi; joriy sessiyadan boshqa barcha sessiyalar o‘chiriladi. SSO orqali kirgan va logini yo‘q foydalanuvchi shu yerda login/parol yaratadi |
| `GET /api/auth/sso` | Faqat brauzer navigatsiyasida ishlaydi; cookie’larni tozalab `/signin-with-chatgpt` ga yo‘naltiradi |

### 6.4. Foydalanuvchini aniqlash tartibi (`requireActor()` — `lib/auth.ts`)

1. **`ijro_session` cookie** → sessiya topiladi (`last_seen_at` 5 daqiqada bir
   yangilanadi). Vaqtinchalik parolni almashtirish shart bo‘lsa — **428**
   “avval vaqtinchalik parolni almashtiring”.
2. `ijro_login_only=1` bo‘lsa — 401 (SSO sinab ko‘rilmaydi).
3. **Egasi SSO** (`lib/owner-sso.ts`): `TRUST_OAI_AUTHENTICATED_USER_HEADER=true`
   va `OWNER_SSO_EMAIL` berilgan bo‘lsa, `oai-authenticated-user-id` /
   `-email` headerlari o‘qiladi. Birinchi marta email mos kelganda foydalanuvchi
   ID si xodimga `app_owner_identities` jadvalida bog‘lanadi, keyin faqat shu
   ID ga ishoniladi.
4. **Dev rejim:** header yoki seed qilingan admin emaili.
   Production’da bu bosqich yo‘q → 401.

Natijada “actor” obyekti: xodim, bo‘lim, tashkilot (turi bilan), rol
(kod/nom/daraja), vakolatlar va faol kirish profillari birlashtirilgan holda.

### 6.5. Akkaunt yaratish usullari

1. **Administrator login/parolni darhol beradi** — xodim yaratishda; parol
   vaqtinchalik (30 kun), birinchi kirishda almashtiriladi.
2. **Bir martalik faollashtirish havolasi** — `POST /api/admin/accounts/activate-bulk`,
   250 tagacha xodim, **72 soat** amal qiladi, havola: `https://.../?activate=<token>`.
   Login ekrani tokenni olib, URL’dan o‘chiradi.
3. **Ommaviy provisioning** — `POST /api/admin/accounts/provision`: xodimlar
   yoki vakant shtatlar uchun loginlar (`u<id>.<ism>` / `v<pozitsiya>.<slot>.<nom>`)
   va vaqtinchalik parollar yaratiladi, **faqat bir marta** Excel fayl sifatida
   yuklab olinadi; bazada faqat xesh qoladi.
4. **Vakant shtat rezervi** — vakant lavozim uchun oldindan yaratilgan
   credential (`app_position_credentials`, kira olmaydi). Xodim shu lavozimga
   tayinlangach `activate-reserved` orqali (90 kun ichida) unga o‘tkaziladi.

---

## 7. Rollar, vakolatlar va kirish profillari

### 7.1. Vakolatlar to‘plami (PermissionSet)

**Ko‘lamlar (scope):**
- `viewScope` — nimani ko‘radi: `all` | `subtree` (o‘z tashkiloti va quyi
  tashkilotlar + bo‘ysunuvchilar zanjiri) | `department` | `own`;
- `assignScope` — kimga topshiriq bera oladi: `all` | `subtree` | `department` | `none`;
- `informationScope` — Ma’lumotlar markazi: `all` | `organization` | `department` | `assigned`.

**Mantiqiy huquqlar:** `canCreateTask`, `canCreateMeeting`, `canExport`,
`canManageOrganization`, `canManageRoles`, `canConfigure`, `canViewAudit`,
`canUpdateAnyTask`, `canManageReports`, `canManageInformation`,
`canViewRestrictedInformation`, `canEnterInformation`, `canSubmitInformation`,
`canVerifyInformation`, `canApproveInformation`.

### 7.2. Tizim rollari (daraja qancha kichik bo‘lsa, shuncha yuqori)

| Kod | Nomi | Daraja | Ko‘rish/Berish | Asosiy huquqlar |
|---|---|---|---|---|
| `admin` | Administrator | 0 | all/all | Hammasi |
| `rahbar` | Rahbar | 10 | all/all | Topshiriq, yig‘ilish, eksport, audit, istalgan topshiriqni o‘zgartirish, hisobotlar |
| `orinbosar` | Rais o‘rinbosari | 20 | subtree/subtree | Topshiriq, eksport, hisobotlar |
| `hudud_rahbari` | Hududiy boshqarma rahbari | 25 | subtree/subtree | Topshiriq, yig‘ilish, eksport, audit, hisobotlar, ma’lumot kiritish/yuborish/tekshirish/tasdiqlash |
| `boshqarma` | Boshqarma boshlig‘i | 30 | department/department | Topshiriq, eksport, hisobotlar |
| `hudud_tasdiqlovchi` | Hududiy bo‘lim tasdiqlovchisi | 35 | department/department | Topshiriq, eksport, hisobot, ma’lumot kiritish/yuborish/tekshirish |
| `tuman_rahbari` | Tuman korxonasi rahbari | 35 | subtree/subtree | `hudud_rahbari` bilan bir xil |
| `tashkilot_rahbari` | Tizim tashkiloti rahbari | 35 | subtree/subtree | `hudud_rahbari` bilan bir xil |
| `yordamchi` | Rahbar yordamchisi | 40 | own/none | Faqat yig‘ilish yaratish |
| `malumot_kirituvchi` | Ma’lumot kirituvchi | 45 | own/none | Eksport, ma’lumot kiritish/yuborish |
| `xodim` | Xodim | 50 | own/none | Faqat o‘ziga tegishli |

Administrator yangi rollar yaratishi mumkin (kod `^[a-z][a-z0-9_]{2,29}$`,
daraja 1–999). `admin` roli himoyalangan. **Oxirgi faol administratorni**
o‘chirish, faolsizlantirish yoki rolini tushirish bazadagi trigger (0023) va API
tomonidan bloklanadi.

### 7.3. Kirish profillari (`lib/access-control.ts`, migratsiya 0021)

14 ta profil: `system_administrator`, `committee_leadership`,
`central_unit_approver`, `central_unit_editor`, `territorial_leadership`,
`territorial_unit_reviewer`, `territorial_unit_editor`, `district_leadership`,
`district_editor`, `direct_org_leadership`, `direct_org_editor`,
`organization_leadership`, `organization_editor`, `employee_personal`.

- Profil **avtomatik aniqlanadi**: rol + tashkilot turi (markaziy/hududiy/tuman/
  bevosita bo‘ysunuvchi) + lavozim nomidagi so‘zlar (lotin/kirill/rus:
  “rahbar”, “direktor” → rahbariyat; “boshlig‘i”, “o‘rinbosar” → tekshiruvchi;
  “mutaxassis”, “muhandis”, “hisobchi” → kirituvchi). **Haydovchi, kotib,
  yordamchi, maslahatchi** lavozimlariga rahbar huquqi berilmaydi.
- Ko‘lam: global / tashkilot / bo‘lim; rahbariyat profillarida quyi
  tashkilotlar ham qo‘shiladi.
- Manba: `migration_role_mapping`, `staff_schedule_mapping`,
  `credential_provisioning`, `position_occupancy`, `manual_admin`.
- Bir nechta profil bo‘lsa eng keng `informationScope` olinadi, huquqlar OR qilinadi.

### 7.4. Kim nimani o‘zgartira oladi (`lib/mutation-authority.ts`)

- **Yig‘ilish:** tashkilotchi yoki `canManageRoles`.
- **Hisobot ma’muriyati:** `canManageRoles` + `canManageReports`.
- **Hisobotni ko‘rib chiqish:** shablon muallifi, yuqori bo‘g‘indagi mas’ul
  yoki egasi bo‘limidagi hisobot menejeri.
- **Ma’lumot faylini o‘chirish:** yuklagan kishi yoki `canManageInformation` + `canManageRoles`.
- **Faqat o‘qish huquqi hech qachon o‘zgartirish huquqini bermaydi.**

### 7.5. Auditoriya (`lib/audiences.ts`)

Topshiriq va yig‘ilish nafaqat alohida xodimlarga, balki **tashkilot yoki
bo‘lim**ga ham berilishi mumkin (50 tagacha nishon, “barcha quyi tashkilotlar
bilan” belgisi). Nishon actor ko‘lami ichida bo‘lishi shart.

---

## 8. Tashkiliy tuzilma: tashkilot, bo‘lim, xodim, shtat

### 8.1. Tashkilotlar (`/api/admin/organizations`)
Turlari va bo‘ysunish qoidasi:
- `central` — faqat bitta faol, ota-tashkilotsiz;
- `territorial` → `central` ga;
- `district` → `territorial` ga;
- `direct_subordinate` → `central` ga.

Aylana (sikl) bloklanadi. Faol bolasi yoki xodimi bor tashkilot
faolsizlantirilmaydi. Tizim bo‘ylab vakolati bo‘lmagan menejer faqat o‘z
tashkiloti ostida `district` yarata oladi.

### 8.2. Bo‘limlar (`/api/admin/departments`)
Nomi 2–160 belgi, ota-bo‘lim shu tashkilotda bo‘lishi shart, sikl yo‘q. Faol
xodimi yoki quyi bo‘limi bor bo‘lim o‘chirilmaydi.

### 8.3. Xodimlar (`/api/admin/employees`)
- Yaratish: F.I.Sh. (≥3 belgi), rol, ixtiyoriy email, tashkilot/bo‘lim/rahbar,
  profil (kirillcha ism, tug‘ilgan sana, ichki raqam ≤10 raqam, telefon
  `+998XXXXXXXXX`), ixtiyoriy login/parol.
- `canManageRoles` bo‘lmagan menejer faqat `xodim` rolini bera oladi.
- Rahbar shu tashkilotdan bo‘lishi va sikl bo‘lmasligi shart.
- **Faolsizlantirish** bloklanadi, agar xodimning faol bo‘ysunuvchilari, ochiq
  topshiriqlari yoki ochiq hisobot vazifalari bo‘lsa. Faolsizlantirilganda:
  Telegram bloklanadi, sessiyalar va ulash tokenlari o‘chadi, navbatdagi
  xabarlar bekor qilinadi, profillar o‘chiriladi.
- **Parolni tiklash:** yangi vaqtinchalik parol (30 kun), sessiyalar yopiladi.
- Oddiy xodimlarga boshqalarning tug‘ilgan sanasi, telefoni, emaili ko‘rinmaydi.

### 8.4. Shtatlar va import qilingan ma’lumotlar
- `0011_unified_staff_seed.sql` — `avtoyol_yagona_shtatlar.xlsx` dan:
  **241 yuridik tashkilot, 536 shtat qatori, 920,75 shtat birligi**. F.I.Sh. yo‘q,
  shu sababli lavozimlar vakant; taxminiy bog‘lanishlar `hierarchy_verified=0`.
- `0012_central_apparatus_staff.sql` — 2026-04-30 dagi 25-son buyruq 2-ilovasi:
  markaziy apparat **19 blok, 57 lavozim, 76 shtat birligi**.
- `0016_central_apparatus_employees.sql` — `Тел рақамлар 3.xlsx` dan **77 xodim**:
  69 tasi shtatni band qiladi, 7 birlik vakant, 8 texnik xodim alohida.
  Hech kimga login yaratilmaydi.
- **Shtatlar** sahifasi (`GET /api/staff`): umumiy statistika va hududlar
  kesimi, tashkilot tanlansa lavozimlar reestri (30 tadan).

### 8.5. Xodimlar katalogi (`GET /api/directory`)
Qidiruv (ism, kirillcha ism, lavozim, tashkilot, bo‘lim bo‘yicha), 25 tadan
sahifalash, `scope=chat|task|meeting|staff`. `kind=branches` — tashkilot
daraxtini bosqichma-bosqich ochish (bolalar, xodim va shtat soni bilan).

### 8.6. Tematikalar (`/api/admin/topics`)
Topshiriq mavzulari: nom 3–160, tavsif ≤500, rang `#RRGGBB`. Topshiriqlarni
tematika bo‘yicha qidirish mumkin.

---

## 9. Topshiriqlar

### 9.1. Qiymatlar
- **Ustuvorlik:** `Yuqori`, `O‘rta` (standart), `Oddiy`.
- **Holat:** `Jarayonda` (standart), `Ko‘rib chiqilmoqda`, `Kechikkan`,
  `Davomiy`, `Bajarildi`.
- **Davriylik:** `Har kuni`, `Har hafta`, `Har oy`, `Har chorak`
  (standart topshiriq bir martalik; davomiylik alohida yoqiladi).

### 9.2. Ish jarayoni (`/api/tasks`)

**Yaratish (POST)** — `canCreateTask` kerak:
- sarlavha 3–240, tavsif ≤5000 belgi;
- kamida bitta ijrochi yoki auditoriya; o‘ziga topshiriq berib bo‘lmaydi;
- **250 tagacha** ijrochi, hammasi `assignScope` ichida;
- muddat kelajakda; davomiy topshiriqda muddat majburiy;
- tematika, “pin” (qadash) ixtiyoriy;
- yo‘nalish tarixiga “Topshiriq berildi” yoziladi;
- Telegram xabarlari navbatga qo‘yiladi (o‘chirib qo‘yish mumkin).

**PATCH amallari:**

| `action` | Nima qiladi |
|---|---|
| `pin` | Foydalanuvchi uchun shaxsiy qadash |
| `progress` | 0–100% bajarilish. 100% → “Bajarildi”. Auditoriya a’zosi birinchi marta yangilaganda avtomatik ijrochi bo‘ladi (“Auditoriyadan qabul qilindi”). Topshiriq progressi = barg ijrochilar o‘rtachasi; hammasi 100% bo‘lganda topshiriq bajarilgan hisoblanadi, eslatmalar bekor qilinadi va davomiy bo‘lsa keyingi davri yaratiladi |
| `update` | Faqat muallif yoki `canUpdateAnyTask`; bajarilgan topshiriq o‘zgarmaydi; eslatmalar qayta rejalashtiriladi |
| `forward` | **Yo‘naltirish (delegatsiya):** ijrochi o‘z qo‘l ostidagilarga yo‘naltiradi. Bola-topshiriqlar (`parent_assignment_id`) va yo‘nalish tarixi (`parent_route_id`, izoh ≤1000) yaratiladi; yo‘naltiruvchining holati “Yo‘naltirildi” bo‘ladi |
| `archive` | `canUpdateAnyTask`; arxivlaydi, eslatmalarni bekor qiladi |

**Ro‘yxat (GET):** 300 tagacha, arxivlanmagan, ko‘rish ko‘lami ichida; avval
qadalganlar, keyin muddat bo‘yicha. Har topshiriqda ijrochilar, yo‘nalish
tarixi (**rahbar → o‘rinbosar → boshqarma boshlig‘i → xodim**), fayllar,
auditoriya va tematika. Oddiy xodim yo‘nalish tarixining faqat o‘ziga olib
keluvchi qismini ko‘radi.

### 9.3. Kim qaysi topshiriqni ko‘radi (`canAccessTask`)
- `all` — hammasini;
- `own` — o‘zi yaratgan/ijrochi bo‘lgan yoki bo‘limi/tashkiloti auditoriyada bo‘lganlarni;
- `department` — shu, plus bo‘limidagi har qanday ijrochi;
- `subtree` — muallif yoki ijrochi uning tashkiliy daraxtida bo‘lganlarni.

### 9.4. Davomiy topshiriqlar (`lib/recurrence.ts`)
Topshiriq bajarilganda keyingi muddat +1 kun / +7 kun / +1 oy / +3 oy
(oy oxiriga moslanadi) qilib hisoblanadi, kelajakka yetguncha suriladi. Yangi
topshiriq `Davomiy` holatida, yuqori darajadagi ijrochilar va auditoriya bilan
nusxalanadi. Takroriy yaratilish bazada unikal indeks bilan oldi olinadi.

### 9.5. Topshiriq fayllari (`/api/files`)
- Hajm **1 bayt – 25 MB**, R2 kalit `tasks/<taskId>/<uuid>-<nom>`;
- yuklash: ijrochi, muallif yoki `canUpdateAnyTask`;
- yuklab olish: topshiriqqa kirish huquqi bo‘lsa; SVG/HTML/XML/JS xavfsizlik
  uchun `application/octet-stream` sifatida beriladi.

### 9.6. Excel eksport (`app/task-meeting-export.ts`)
Rangli, filtrlanuvchi 3 varaqli fayl: **“Qisqa hisobot”**, **“Topshiriqlar”**
(18 ustun), **“Yig‘ilishlar”** (13 ustun). Nomi `ichki-hisobotlar-<sana>.xlsx`.

---

## 10. Yig‘ilishlar

`/api/meetings`:
- **Format:** `Oflayn` (standart), `Onlayn`, `Aralash`.
- **Yaratish** (`canCreateMeeting`): nom 3–240, joy 2–500, boshlanish
  kelajakda, tugash boshlanishdan keyin; yaratuvchi doim ishtirokchi;
  auditoriya bo‘lishi mumkin; eslatma 0–10080 daqiqa (standart 30).
- **Tahrirlash:** tashkilotchi yoki `canManageRoles`; olib tashlanganlarga
  “olib tashlandingiz”, qolganlarga “o‘zgardi” xabari ketadi.
- **Bekor qilish (DELETE):** yig‘ilish o‘chiriladi, “bekor qilindi” xabari yuboriladi.
- **Ro‘yxat:** `?from&to` oralig‘ida, 300 tagacha, taqvim ko‘rinishida.

---

## 11. Telegram bot va eslatmalar

### 11.1. Ulanish
1. Administrator **Telegram → Webhookni faollashtirish** tugmasini bosadi
   (`POST /api/admin/telegram/setup`, `canConfigure`): bot `getMe` bilan
   tekshiriladi va webhook `SITE_BASE_URL/api/telegram/webhook` ga o‘rnatiladi.
2. Xodim uchun ulash havolasi yaratiladi (`POST /api/telegram/link`):
   `https://t.me/<bot>?start=<token>` — **30 daqiqa** amal qiladi.
3. Xodim havolani bosadi → bot `/start <token>` oladi → akkaunt bog‘lanadi,
   kutib turgan xabarlar yuboriladi.

`localhost` ga webhook kelmaydi — mahalliy sinov uchun HTTPS tunnel kerak.

### 11.2. Xabarlar navbati (outbox) — `app_notification_jobs`
Har bir xabar avval bazaga yoziladi (takrorlanmaslik kaliti bilan), keyin
`processNotificationJobs()` yuboradi.

- **Holatlar:** `pending`, `processing`, `waiting_link` (Telegram ulanmagan —
  1 soatdan keyin qayta), `sent`, `failed`, `failed_permanent`, `cancelled`.
- Olinganda 10 daqiqalik “ijara” qo‘yiladi (parallel yuborilmasligi uchun).
- Yuborish vaqti limiti 12 soniya.
- Telegram 400/403 qaytarsa — doimiy xato, akkaunt “bloklangan” deb belgilanadi.
- Boshqa xatolarda eksponensial kutish `min(3600, 30·2^urinish)` soniya,
  **6 urinish**dan keyin to‘xtaydi.
- Topshiriq bajarilgan/arxivlangan, yig‘ilish o‘tib ketgan, hisobot
  tasdiqlangan bo‘lsa, xabar yuborilmaydi.

### 11.3. Eslatma jadvali

| Obyekt | Qachon |
|---|---|
| Topshiriq | Muddatdan **3 kun, 24 soat, 3 soat, 1 soat, 15 daqiqa** oldin. Ijrochiga tugmalar: **✅ Qabul qildim**, **🏁 Bajarildi**. Topshiriq beruvchiga “📊 Nazorat eslatmasi” |
| Yig‘ilish | 1 kun, 60 daqiqa, 15 daqiqa oldin + yig‘ilishning o‘z eslatma vaqti; yaratildi/o‘zgardi/bekor qilindi/olib tashlandi xabarlari |
| Hisobot | Muddatdan 3 kun, 24 soat, 3 soat oldin; tayinlandi/yuborildi/tasdiqlandi/qaytarildi |
| Chat | Kanalning Telegram ulangan boshqa a’zolariga yangi xabar (1200 belgi) |

Auditoriyaga berilgan topshiriqlarda qabul qiluvchilar tashkilot daraxti bo‘yicha
SQL’da hisoblanadi.

### 11.4. Tinch soatlar (`lib/quiet-hours.ts`)
Xodim o‘zi sozlaydi (`/api/telegram/preferences`): bildirishnomalarni
yoqish/o‘chirish va tinch soatlar (standart **22:00–07:00**, Toshkent vaqti,
yarim tundan o‘tishi mumkin). Tinch soatda xabar yuborilmaydi, tugashiga
ko‘chiriladi.

### 11.5. Bot buyruqlari (faqat shaxsiy chatda)

| Buyruq | Natija |
|---|---|
| `/start <token>` | Akkauntni ulash |
| `/vazifalar`, `/tasks` | Ochiq topshiriqlar (15 tagacha) |
| `/bugun` | Bugun muddati tugaydiganlar |
| `/kechikkan` | Muddati o‘tganlar |
| `/yigilishlar`, `/meetings` | Keyingi 10 ta yig‘ilish |
| `/uzish` | Akkauntni uzish |
| boshqa | Yordam matni |

Tugmalar: **Qabul qildim** → progress kamida 10%, holat “Jarayonda”;
**Bajarildi** → 100%.

### 11.6. Webhook xavfsizligi
`x-telegram-bot-api-secret-token` header `TELEGRAM_WEBHOOK_SECRET` ga teng
bo‘lishi shart (aks holda 401), faqat JSON, ≤1 MB, `update_id` bo‘yicha takror
ishlov berilmaydi (`app_telegram_updates`).

### 11.7. Qo‘lda ishga tushirish
`POST /api/reminders/process` — `Authorization: Bearer <REMINDER_JOB_SECRET>`
yoki `canConfigure` administrator: 100 ta xabar + muddati o‘tgan chat
yuklamalarini tozalash. `POST /api/telegram/test` — sinov xabari.

---

## 12. Korporativ chat (Muloqot)

### 12.1. Kanal turlari (`lib/chat.ts`)
- `broadcast` — **“Umumiy e’lonlar”**, hamma ko‘radi;
- `department` — “<bo‘lim> suhbati”, shu bo‘lim xodimlari;
- `group` — guruh: 3–100 belgili nom, jami **250 gacha** a’zo;
- `direct` — ikki kishilik shaxsiy suhbat.

Umumiy va o‘z bo‘limi kanali birinchi ochilishda avtomatik yaratiladi.

### 12.2. Xabarlar (`/api/chat`)
- Kanallar ro‘yxati (200 tagacha) o‘qilmaganlar soni bilan;
- oxirgi 100 xabar, keyin `afterId` bilan faqat yangilari;
- xabar 1–5000 belgi, javob (reply) mumkin, “o‘qildi” belgisi;
- **Enter** — yuborish, **Shift+Enter** — yangi qator;
- yangilanish **polling** orqali: kanallar ro‘yxati 15 s, ochiq kanal 6 s
  (sahifa yashirin bo‘lsa to‘xtaydi).

### 12.3. Fayllar (`/api/chat/files`, `lib/chat-uploads.ts`)
- **12 MB gacha** — bitta so‘rovda to‘g‘ridan-to‘g‘ri;
- **12 MB dan 500 MB gacha** — R2 multipart: `init` → `part` (8 MB bo‘laklar,
  brauzer 3 ta parallel, har biri 3 marta qayta urinadi) → `complete`;
  yuklanish foizi ko‘rsatiladi;
- har foydalanuvchiga bir vaqtda **3 ta** yuklash va **24 soatda 2 GiB** limit
  (oshsa 429);
- PDF, PPTX, rasm, video, audio, Office va boshqa fayllar; rasm/video/audio/PDF
  brauzerda ochiladi, video uchun HTTP Range qo‘llab-quvvatlanadi;
- tugallanmagan yuklamalar avtomatik tozalanadi.

---

## 13. Davriy hisobotlar (Hisobotlar)

Maqsad: markaz jadval shaklidagi hisobotni belgilaydi, u tashkilotlarga
yuboriladi, ular to‘ldiradi yoki quyi tashkilotlarga taqsimlaydi, yuqori bo‘g‘in
tekshirib tasdiqlaydi, tizim avtomatik svod (yig‘ma) chiqaradi.

### 13.1. Shablon yaratish (`POST /api/reports`, `canManageReports`)
- **Davriylik:** `one_time`, `weekly`, `monthly`, `quarterly`, `yearly`.
- Nom 3–240, yo‘riqnoma ≤8000 belgi, yo‘riqnoma fayli ilova qilinishi mumkin.
- **Ustunlar:** 1–32 ta, turi `number | text | date | boolean`, birlik,
  majburiylik, yig‘ish usuli (`sum`, `average`, `last`, `none` — faqat
  sonlarda). Ustunlarni Excel fayldan avtomatik aniqlash mumkin.
- **Qabul qiluvchilar:** 1–250 (tashkilot + mas’ul xodim) juftligi.
- Sozlamalar: quyi tashkilotlarga yo‘naltirishga ruxsat (standart yoqilgan),
  dalil fayli majburiyligi.
- Takroriy bosishda bir xil `requestId` — ikkinchi nusxa yaratilmaydi.

### 13.2. Davrlar (`lib/report-periods.ts`)
Toshkent vaqti bo‘yicha. Oylik/choraklik/yillik muddat asl kunga bog‘langan
(31-yanvar → fevral oxiri → 31-mart). Davr nomlari: “2026-yil 3-chorak”,
“2026-yil”, “dd MMM — dd MMM yyyy”, “Bir martalik hisobot”. Cron har ishga
tushganda yetishmayotgan davrlarni (shablonga 24 tagacha) yaratib, vazifalarni
taqsimlaydi.

### 13.3. Vazifa holatlari
`new` → `draft` → `submitted` → `approved`, yoki `returned` (qayta
to‘ldirish), `collecting` (quyi tashkilotlardan yig‘ilmoqda).

### 13.4. Amallar (`PATCH /api/reports`)

| Amal | Kim | Natija |
|---|---|---|
| `save` | Mas’ul | Qoralama saqlanadi (majburiy kataklar to‘liq bo‘lmasa ham) |
| `submit` | Mas’ul | Tekshiriladi (majburiy kataklar, kamida 1 qator, kerak bo‘lsa fayl) → `submitted`; tekshiruvchiga xabar |
| `delegate` | Mas’ul | Bevosita quyi tashkilotlarga bola-vazifalar; o‘zi `collecting` |
| `approve` | Tekshiruvchi | `submitted` → `approved` |
| `return` | Tekshiruvchi | `submitted` → `returned`, izoh ≥3 belgi |

**Parallel tahrir himoyasi:** har so‘rovda `expectedVersion` yuboriladi; versiya
mos kelmasa **409 `REPORT_VERSION_CONFLICT`** — eski oynadan yozib bo‘lmaydi.
Qatorlar, holat va audit bitta tranzaksiyada (`mutation_key`) yoziladi.

### 13.5. Jadval kiritish (UI)
- 1000 qatorgacha, 100 tadan sahifalanadi;
- Enter/strelkalar bilan kataklar bo‘ylab yurish;
- **Excel’dan nusxa-joylash (TSV)** — ko‘p qatorli va qo‘shtirnoqli kataklar saqlanadi;
- **Excel import** — sanalar Toshkentda siljimaydi (1900 va 1904 tizimlari),
  takroriy sarlavhalar rad etiladi;
- raqamlar `1 234,5` ko‘rinishida ham qabul qilinadi; mantiqiy: `ha/yo‘q`, `1/0`;
- to‘ldirilgan shablonni yuklab olish; dalil fayllari (**100 MB** gacha).

### 13.6. Svod va eksport
Har davr uchun **“Avtomatik svod”**: sonlar yig‘indi/o‘rtacha (haqiqiy kataklar
soni bo‘yicha)/oxirgi; matn ustunlarida “N ta yozuv”. **“Yig‘ma Excel”** —
“Hududlar va tumanlar” varag‘i, faqat barcha sahifalar yuklangach faollashadi.
Ro‘yxat 500 tadan sahifalanadi.

**“Ijro tahlili”** tabi — bo‘limlar kesimida topshiriqlar bajarilishi.

---

## 14. Ma’lumotlar markazi

### 14.1. Katalog
Manba: foydalanuvchi bergan `маълумотлар.xlsx` (varaq “123”, A2:G51).
`scripts/generate-information-catalog-v2.mjs` uni SQL’ga aylantiradi
(`drizzle/0017`), natija `data/information-center-catalog-v2.json` da ham bor.

**16 boshqarma (domen), 49 manba jadvali** (32 oylik, 16 doimiy, 1 belgilanmagan),
5 ta qo‘shimcha jadval (0018 da o‘chirilgan):

| Kod | Boshqarma | Jadvallar |
|---|---|---|
| `press_service` | Matbuot xizmati | 2 |
| `appeals` | Murojaatlar | 4 |
| `finance_economy` | Moliya-iqtisod | 6 |
| `design_cost_analysis` | Loyiha-smeta tahlili | 1 |
| `maintenance_repair` | Saqlash va ta’mirlash | 11 |
| `roadside_infrastructure` | Yo‘l bo‘yi infratuzilmasi | 2 |
| `road_machinery` | Yo‘l texnikasi | 2 |
| `execution_discipline` | Ijro intizomi | 1 |
| `road_network_development` | Yo‘l tarmog‘ini rivojlantirish | 1 |
| `industrial_infrastructure` | Sanoat infratuzilmasi | 4 |
| `digitalization_innovation` | Raqamlashtirish va innovatsiyalar | 3 |
| `investments_ppp` | Investitsiyalar va DXSh | 4 |
| `human_resources` | Kadrlar | 4 |
| `anti_corruption` | Korrupsiyaga qarshi (**yopiq**) | 2 |
| `legal_service` | Yuridik xizmat | 1 |
| `sports_youth` | Sport va yoshlar | 1 |

Domen kodi `SRC_<KOD>`, jadval kodi `SRC_<DOMEN>_<HISOBOT>`. Oldingi katalog
(14 domen, 78 shablon, 0014) “legacy” sifatida saqlangan.

### 14.2. Shakl (template) tuzilishi (`lib/information.ts`)
- 21 maydon turi: text, textarea, number, currency, percentage, date, datetime,
  select, multiselect, boolean, url, country, employee, employees, organization,
  region, road, geo, file va boshqalar;
- shaklga 80 maydon, 40 ko‘rsatkich, 30 o‘lchov;
- ko‘rinish sozlamalari: KPI kartalar, jadval ustunlari, filtrlar, drill-down,
  tablar, davr rejimi, demo rejim.

Qiymat tekshiruvi: sonlar min/max, sanalar qat’iy, geo (±90/±180), URL faqat
http(s), matn ≤700, uzun matn ≤8000, yozuv ≤160 KB. **To‘liqlik %** =
to‘ldirilgan majburiy maydonlar / majburiy maydonlar.

### 14.3. Kim ko‘radi/kiritadi
Har foydalanuvchi uchun 4 ro‘yxat hisoblanadi: ko‘rinadigan, tahrirlanadigan,
tekshiriladigan, yopiq domenlar. Manbalar: domen a’zoligi, lavozim yoki xodimga
berilgan ruxsat (**Rollar → Ma’lumot ruxsatlari**, `/api/admin/information-access`,
`editor`/`reviewer`), bo‘lim profillari, kutib turgan tasdiqlash bosqichi.
**Yopiq (restricted) domenlar** faqat administrator qo‘lda bergan ruxsat bilan ochiladi.

### 14.4. Ish jarayoni (`lib/information-workflow.ts`)

Holatlar: `draft` (qoralama) → `submitted` (ko‘rib chiqilmoqda) →
`published` (tasdiqlangan) → `archived`; yoki `returned` / `rejected`.

| Amal | Qayerdan | Qayerga | Shart |
|---|---|---|---|
| save | draft/returned | o‘sha | — |
| submit | draft/returned | submitted | To‘liqlik 100%, majburiy fayllar yuklangan |
| approve | submitted | keyingi bosqich yoki published | Navbatdagi bosqich tekshiruvchisi, muallif emas |
| return | submitted | returned | Izoh ≥3 belgi |
| reject | submitted | rejected | Izoh ≥3 belgi |
| archive | published | archived | Admin yoki egasi bo‘lim rahbari (daraja ≤30) |

**Tasdiqlash zanjiri** yozuv kiritilgan tashkilotga qarab avtomatik quriladi
(12 darajagacha):
- Markaz → `central_owner_approval`;
- Tuman → `organization_approval` → `territorial_approval` → `central_owner_approval`;
- Hudud → `territorial_approval` → markaz;
- boshqalar → `organization_approval` → markaz.

Hududsiz tuman — faqat tasdiqlangan istisno (`app_information_route_exceptions`)
bilan. Har bosqichda muallifdan boshqa kamida bitta tekshiruvchi bo‘lishi shart.
`central_only` shakllarni faqat markaziy apparatdagi egasi bo‘lim kiritadi.

**Nazorat qoidalari** (xato → 422): sanalar tartibi, majburiy maydon, foiz
0–100, soni/dona/nafar — butun manfiy bo‘lmagan, pul — manfiy emas, davr mosligi,
**ish haqi fondi ÷ xodimlar = o‘rtacha ish haqi** (2% tolerantlik), qismlar
yig‘indisi, takroriy biznes-kalit, boshqa shakl bilan solishtirish.

**Biznes-kalit** (0028): shakl + tashkilot + davr + kalit maydonlar.
Yuborilgan/nashr qilingan yozuv kalitni band qiladi — ikkita bir xil yozuv bo‘lmaydi.

Parallel tahrir: `expectedVersion`, mos kelmasa 409 `INFORMATION_VERSION_CONFLICT`.
Har o‘zgarish tarixga (`app_information_record_history`) yoziladi.

### 14.5. Tashqi integratsiya (`POST /api/information/ingest`)
- `Authorization: Bearer <INFORMATION_INGEST_SECRET>` (sir yo‘q bo‘lsa 503);
- so‘rovda 1–100 yozuv, tana ≤20 MB;
- har yozuvda `templateCode`, `sourceRecordKey`, sarlavha; `sourceMode`:
  `api | telemetry | xlsx`;
- `templateCode + sourceMode + sourceRecordKey` bo‘yicha takror yuborish
  yangilanadi yoki `unchanged` qaytadi;
- **integratsiya yozuvlari har doim qoralama bo‘lib tushadi** — insonga
  ko‘rib chiqish uchun.

Kelajakdagi integratsiyalar (SKUD, GPS, transport, yo‘l aktivlari, soliq,
ijro.gov.uz) uchun `app_integration_connectors/events` navbat qatlami tayyor,
lekin real adapterlar hali yo‘q.

### 14.6. Fayllar
Yozuv kartochkasiga **100 MB** gacha, faqat qoralama/qaytarilgan holatda,
fayl maydoniga bog‘lanadi.

### 14.7. Interfeys
- `information-center.tsx`: boshqarmalar to‘ri → shakllar → yozuvlar →
  kartochka (mas’ul, manba, tarix, tasdiqlash zanjiri, nazorat xatolari);
- `information-dashboard.tsx`: drill-down, filtrlar, KPI kartalar, Excel eksport
  (“Ma’lumotlar” varag‘i); ma’lumot yo‘q bo‘lsa demo namunalar (`is_demo`,
  real ma’lumotdan qat’iy ajratilgan).

---

## 15. AI qidiruv

**Menyu → AI qidiruv** (`app/information-search.tsx`, `POST /api/information/search`).

- **Indeks:** SQLite FTS5 `app_center_search` (migratsiya 0031) — yozuvlar,
  shakllar va ilmiy loyihalar; triggerlar orqali avtomatik yangilanadi.
- **So‘rovni tayyorlash** (`lib/search-language.ts`): kichik harf, apostrof
  variantlarini birxillashtirish, **kirill → lotin**, ~36 stop-so‘z, o‘zbekcha
  qo‘shimchalarni kesish, 10 sinonim guruhi (masalan oylik / maosh / ish haqi /
  зарплата), har so‘z lotin+kirill variantda prefiks qidiruv. “tasdiqlangan”
  so‘zi faqat nashr qilinganlarni qidiradi.
- **Natijalar:** so‘rov 2–400 belgi, **20 tadan** sahifa, turlar: hammasi /
  yozuv / shakl / tadqiqot. Kirish huquqi **sanashdan oldin** qo‘llanadi —
  foydalanuvchi ko‘rmasligi kerak bo‘lgan narsa sonlarda ham ko‘rinmaydi.
  Natijadan **“Manbani ochish”**.
- Qidiruvga fayl ichidagi matn, chat va topshiriqlar kirmaydi.

**AI javobi (ixtiyoriy):**
- faqat `OPENAI_API_KEY` bo‘lsa va “AI javobi” tugmasi bosilganda;
- topilgan **8 tagacha** ruxsat etilgan manba parchasi yuboriladi; yopiq
  domenlar va `sensitive` maydonlar yuborilmaydi;
- OpenAI Responses API, `store:false`, 1200 token, 15 s, qat’iy JSON sxema;
  javob kamida bitta manbaga iqtibos keltirishi shart, aks holda rad etiladi;
- limit: foydalanuvchiga **daqiqasiga 6, sutkasiga 100**;
- holatlar: `not_configured`, `ready`, `no_sources`, `unavailable`.
  Xatoda oddiy qidiruv natijalari saqlanadi.

---

## 16. Ilmiy tadqiqotlar

Joylashuvi: **Ma’lumotlar markazi → Raqamlashtirish va innovatsiyalar
boshqarmasi → Ilmiy tadqiqotlar va innovatsiyalar** (`app/research-reports.tsx`,
`/api/research`).

- **6 bosqich:** Muammo va TT → Metodika → Laboratoriya/dala sinovi → Tahlil →
  Tajriba-sinov → Yakuniy hisobot. Progress: 0/10/30/50/70/85/100%.
- **Holatlar:** draft → active → institute_review → committee_review →
  (keyingi bosqich) → completed → implementation; shuningdek returned, archived.
- Loyiha kodi: `IT-YYYYMMDD-XXXXXXXX`; bajaruvchi — institut (STIR 205340218).

| Rol | Kim | Huquq |
|---|---|---|
| Administrator | admin | Hammasi |
| Rahbariyat | rahbar / orinbosar | Faqat ko‘rish |
| Egasi bo‘lim | Raqamlashtirish boshqarmasi | Yaratish, tahrirlash, faollashtirish, ko‘rib chiqish |
| Mas’ul ijrochi | Institutdagi mas’ul | Bosqich natijasini yuborish |
| Tekshiruvchi | Institutning boshqa xodimi | Bosqichni tekshirish |

Tekshiruvchi muallif/yuboruvchi bo‘lishi mumkin emas. Qo‘shimcha: muammolar,
takliflar (tanlash/rad etish), tavsiya etilgan mavzular, xorijiy tajriba.
Fayllar **15 MB** gacha, faqat pdf/docx/xlsx/zip/jpg/png/webp.
Tablar: Boshqaruv, Katalog, Ilmiy loyihalar, Muammolar, Tavsiya mavzular,
Xorijiy tajriba, Aqlli qidiruv. 7 yo‘nalish: Qoplama, Ko‘prik, Yo‘l aktivlari,
Yo‘l xavfsizligi, Yo‘l diagnostikasi, Ekologiya, Raqamlashtirish.

---

## 17. Bosh sahifa, rahbar paneli va tahlil

**Bosh sahifa** (`app/dashboard-home.tsx`): ko‘rsatkich kartalari, topshiriqlar
jadvali, bugungi yig‘ilishlar, bo‘limlar samaradorligi va **lokal tahlil**
(`app/local-insights.tsx`) — tashqi AIsiz, brauzerda:
xavf balli = min(100, 16×kechikkan + 8×48 soatda tugaydigan + 7×anomaliya +
10×ijrochisiz + 12×yig‘ilish to‘qnashuvi); anomaliya — progress mediana − 2×MAD
dan past. Tablar: **Xavflar** va **Tavsiya**.

**Rahbar paneli** (`app/executive-reports.tsx`) — **8 strategik yo‘nalish**
(yo‘llar, ko‘priklar, dasturlar, moliya, ekspluatatsiya, sanoat, kadrlar,
standartlar), 14 hudud → tuman → yozuv drill-down, davr filtrlari, Excel
(“Rahbar hisoboti”), **.docx AI-tahlil** (hudud yoki yo‘nalish bo‘yicha,
lotin/kirill), xorijiy safarlar (8 davlat bayrog‘i bilan). ⚠️ Hozirgi kodda bu
sahifa **menyuga ulanmagan** va ma’lumotlari **namunaviy (demo)** — §24 ga qarang.

**KPI** sahifasi — hozircha joy egallovchi (“BPR kutilmoqda”).

---

## 18. Audit jurnali

- Jadval: `app_audit_logs` (kim, amal, obyekt turi, ID, `detail_json`, vaqt).
- Yoziladigan amallar (asosiylari): `account.activated`, `auth.password_changed`,
  `auth.credentials_claimed`, `accounts.*`, `employee.*`, `department.*`,
  `organization.*`, `role.*`, `topic.*`, `information_access.*`, `task.*`
  (created/updated/forwarded/progress/archived/recurrence_created/telegram_*),
  `file.*`, `meeting.*`, `telegram.*`, `chat.*`, `report.*`, `information.*`,
  `research.*`.
- Login/logout audit qilinmaydi.
- Ko‘rish: `canViewAudit` — bootstrap orqali oxirgi **60 ta** yozuv (global
  ko‘lamda hammasi, aks holda o‘z daraxti).
- `app/audit-page.tsx` — ro‘yxat (18 amalning o‘zbekcha nomi bor);
  `app/audit-export.ts` — Excel `audit-log-YYYYMMDD-HHMM.xlsx`.

---

## 19. Interfeys: menyu, alifbo, mavzular, mobil

### 19.1. Menyu (`app/dashboard.tsx`)

| Menyu bandi | Kim ko‘radi |
|---|---|
| Bosh sahifa, Topshiriqlar, Yig‘ilishlar, Muloqot, Kirish xavfsizligi, Ma’lumotlar markazi, AI qidiruv, Hisobotlar, KPI | Hamma |
| Xodimlar, Bo‘limlar, Tashkilotlar, Tematikalar | `canManageOrganization` |
| Rollar (va vakolatlar, loginlar) | `canManageRoles` |
| Shtatlar | `canManageOrganization` yoki `canManageReports` |
| Telegram, Integratsiyalar | `canConfigure` |
| Audit jurnali | `canViewAudit` |

Og‘ir sahifalar (chat, topshiriqlar, yig‘ilishlar, hisobotlar) kerak bo‘lganda
yuklanadi (lazy + `RoadLoader`).

**Ishga tushish:** sahifa ochilganda `GET /api/bootstrap` bitta so‘rovda actor,
topshiriqlar, yig‘ilishlar, xodimlar (500 gacha), rollar, bo‘limlar,
tashkilotlar, tematikalar, (kerak bo‘lsa) integratsiyalar, Telegram holati va
audit oxirgi yozuvlarini qaytaradi. Vaqtinchalik parol almashtirilmaguncha bo‘sh
javob qaytadi va parol almashtirish oynasi chiqadi.

### 19.2. Lotin / Кирилл
Yuqori paneldagi tugma butun interfeysni kirillga o‘giradi (DOM matnlari
`latinToCyrillic` orqali), tanlov `localStorage` `ijro-alphabet` da saqlanadi.
`data-alphabet-static` belgili elementlar o‘zgarmaydi.

### 19.3. Mavzular
6 rang mavzusi (blue, indigo, emerald, teal, amber, graphite) va
**yorug‘ / qorong‘i / tizim** rejimi (`internal-reports-color-theme`,
`internal-reports-color-mode`).

### 19.4. Mobil
iOS/Android uchun moslashuvchan: pastki navigatsiya (Bosh sahifa,
Topshiriqlar, Muloqot, Yig‘ilishlar, Menyu).

### 19.5. Kirish ekrani
Login/parol, parolni ko‘rsatish, “eslab qolish”, alifbo tugmasi, SSO havolasi;
`?activate=` havolasi bilan kelganda — faollashtirish formasi (login + parol 2 marta).

---

## 20. Ma’lumotlar bazasi (jadvallar va migratsiyalar)

### 20.1. Asosiy jadval guruhlari (`db/schema.ts`)

| Guruh | Jadvallar |
|---|---|
| Tuzilma | `app_organizations`, `app_departments`, `app_employees`, `app_employee_profiles`, `app_roles` |
| Shtat | `app_staff_import_batches`, `app_staff_positions`, `app_staff_position_roles`, `app_position_occupancies`, `app_employee_import_batches` |
| Kirish | `app_user_credentials`, `app_sessions`, `app_account_activation_tokens`, `app_position_credentials`, `app_owner_identities`, `app_access_profiles`, `app_access_profile_assignments` |
| Topshiriq | `app_tasks`, `app_task_assignments`, `app_task_routes`, `app_task_audiences`, `app_task_pins`, `app_task_topics`, `app_attachments` |
| Yig‘ilish | `app_meetings`, `app_meeting_participants`, `app_meeting_audiences` |
| Telegram | `app_telegram_accounts`, `app_telegram_link_tokens`, `app_telegram_updates`, `app_notification_jobs` |
| Chat | `app_chat_channels`, `app_chat_members`, `app_chat_messages`, `app_chat_attachments`, `app_chat_upload_sessions` |
| Integratsiya | `app_integration_connectors`, `app_integration_events` |
| Ma’lumotlar markazi | `app_information_domains`, `_templates`, `_template_workflows`, `_route_exceptions`, `_catalog_imports`, `_records`, `_record_history`, `_record_approval_steps`, `_validation_issues`, `_values`, `_members`, `_domain_assignments`, `_participants`, `_actions`, `_files`, `_business_keys` |
| Hisobotlar | `app_report_templates`, `_template_recipients`, `_cycles`, `_assignments`, `_data_rows`, `_files` |
| Ilmiy | `app_research_projects`, `_milestones`, `_intake_items`, `_files` |
| Qidiruv | `app_center_search` (FTS5) |
| Audit | `app_audit_logs` |
| Eski (ishlatilmaydi) | `departments`, `employees`, `tasks`, `meetings`, `attachments`, `reminder_logs` |

### 20.2. Migratsiyalar tarixi (`drizzle/`)

| № | Mazmuni |
|---|---|
| 0000 | Dastlabki prototip jadvallari (eski) |
| 0001 | `app_*` yadro: rollar, bo‘limlar, xodimlar, topshiriqlar, yig‘ilishlar, audit, Telegram; 6 rol seed |
| 0002 | Topshiriq ijrochisiga `progress` |
| 0003 | Davomiy topshiriq zanjiri |
| 0004 | Loginlar, sessiyalar, tematikalar, chat |
| 0005 | Integratsiya konnektorlari, indekslar |
| 0006 | Tashkilotlar ierarxiyasi va hisobot jadvallari |
| 0007 | Hisobot qatorlari |
| 0008 | Bo‘limga tashkilot, chat yuklash sessiyalari |
| 0009 | Email ixtiyoriy |
| 0010 | Shtatlar, faollashtirish tokenlari, auditoriyalar |
| 0011 | Yagona shtatlar importi (241 tashkilot, 536 lavozim) |
| 0012 | Markaziy apparat shtati (19 blok, 57 lavozim, 76 birlik) |
| 0013 | Ma’lumotlar markazi jadvallari |
| 0014 | Katalog v1 (14 domen, 78 shablon) |
| 0015 | Ma’lumot fayllariga `field_code` |
| 0016 | 77 markaziy apparat xodimi |
| 0017 | Katalog v2 (16 domen, 49 + 5 shablon) |
| 0018 | Qo‘shimcha shablonlarni o‘chirish, OAV monitoringi |
| 0019 | Manba workbook profillari |
| 0020 | Katalog aniqlashtirishlari |
| 0021 | Kirish profillari, lavozim credentiallari, yangi rollar |
| 0022 | Ma’lumot ish jarayoni, tasdiqlash bosqichlari, nazorat xatolari |
| 0023 | RBAC moslashtirish, “kamida bitta admin” triggerlari |
| 0024 | Istisnolar jadvalini qayta yaratish |
| 0025 | Telegram tinch soatlar |
| 0026 | Ilmiy tadqiqotlar |
| 0027 | Hisobot versiyasi (tahrir xavfsizligi) |
| 0028 | Biznes-kalitlar |
| 0029 | Shakl sxemasi tuzatishlari |
| 0030 | Egasi SSO identifikatsiyasi |
| 0031 | FTS5 qidiruv indeksi |

---

## 21. Barcha API marshrutlari ro‘yxati

Barcha o‘zgartiruvchi so‘rovlar `assertSameOrigin` bilan himoyalangan va
audit qilinadi.

| Marshrut | Metodlar | Vazifa |
|---|---|---|
| `/api/bootstrap` | GET | Boshlang‘ich ma’lumotlar |
| `/api/auth/login` | POST | Kirish |
| `/api/auth/logout` | POST | Chiqish |
| `/api/auth/activate` | POST | Akkauntni faollashtirish |
| `/api/auth/change-password` | POST | Parol almashtirish |
| `/api/auth/sso` | GET | Egasi SSO |
| `/api/tasks` | GET, POST, PATCH | Topshiriqlar |
| `/api/files` | GET, POST, DELETE | Topshiriq fayllari |
| `/api/meetings` | GET, POST, PATCH, DELETE | Yig‘ilishlar |
| `/api/directory` | GET | Xodimlar katalogi, tashkilot daraxti |
| `/api/staff` | GET | Shtatlar |
| `/api/chat` | GET, POST | Chat kanallari va xabarlar |
| `/api/chat/files` | GET, POST, DELETE | Chat fayllari (multipart) |
| `/api/reports` | GET, POST, PATCH | Davriy hisobotlar |
| `/api/reports/files` | GET, POST, DELETE | Hisobot fayllari |
| `/api/reports/research`, `/files` | — | Ilmiy tadqiqot marshrutlariga yo‘naltirish |
| `/api/information` | GET, POST, PATCH | Ma’lumotlar markazi |
| `/api/information/files` | GET, POST, DELETE | Ma’lumot fayllari |
| `/api/information/ingest` | POST | Tashqi integratsiya (Bearer) |
| `/api/information/search` | POST | AI qidiruv |
| `/api/information/research`, `/files` | — | Ilmiy tadqiqotga yo‘naltirish |
| `/api/research` | GET, POST | Ilmiy loyihalar |
| `/api/research/files` | GET, POST | Ilmiy fayllar |
| `/api/research/files/[id]` | GET | Doim 404 (ishlatilmaydi) |
| `/api/telegram/webhook` | POST | Telegram webhook |
| `/api/telegram/link` | POST | Ulash havolasi |
| `/api/telegram/preferences` | GET, PATCH | Bildirishnoma sozlamalari |
| `/api/telegram/test` | POST | Sinov xabari |
| `/api/reminders/process` | POST | Navbatni qo‘lda ishlatish |
| `/api/admin/employees` | POST, PATCH | Xodimlar |
| `/api/admin/departments` | POST, PATCH | Bo‘limlar |
| `/api/admin/organizations` | POST, PATCH | Tashkilotlar |
| `/api/admin/roles` | POST, PATCH | Rollar |
| `/api/admin/topics` | POST, PATCH | Tematikalar |
| `/api/admin/access-profiles` | GET | Kirish profillari va matritsa |
| `/api/admin/information-access` | GET, POST, DELETE | Domen ruxsatlari |
| `/api/admin/accounts/provision` | POST | Ommaviy login/parol (bir martalik Excel) |
| `/api/admin/accounts/activate-bulk` | POST | 72 soatlik faollashtirish havolalari |
| `/api/admin/accounts/activate-reserved` | POST | Vakant rezervini xodimga o‘tkazish |
| `/api/admin/telegram/setup` | POST | Webhookni o‘rnatish |

---

## 22. Xavfsizlik choralari

- Parollar faqat PBKDF2-SHA256 (100 000 iteratsiya) xeshi sifatida; ochiq parol
  faqat yaratilganda bir marta ko‘rsatiladi.
- Sessiya, faollashtirish va Telegram tokenlarining faqat SHA-256 xeshi saqlanadi.
- 5 xato urinish → 15 daqiqa bloklash; vaqtinchalik parol 30 kunda tugaydi va
  birinchi kirishda majburan almashtiriladi.
- CSRF: `assertSameOrigin`, `SameSite=Lax`, HttpOnly cookie.
- Har API so‘rovida vakolat serverda qayta tekshiriladi (fayllar ham).
- Oxirgi administrator himoyasi (trigger + API); ierarxiyada sikllar bloklanadi.
- Xavfli fayl turlari (SVG/HTML/XML/JS) yuklab olishda `octet-stream`.
- Yopiq domenlar (korrupsiyaga qarshi va h.k.) faqat qo‘lda berilgan ruxsat bilan;
  tashqi AIga yuborilmaydi.
- Shaxsiy ma’lumotlar (tug‘ilgan sana, telefon) oddiy xodimlarga ko‘rinmaydi.
- `TRUST_OAI_AUTHENTICATED_USER_HEADER` faqat headerlarni tozalaydigan ishonchli
  proksi ortida yoqiladi.
- Maxfiy qiymatlar, `*_private_*.sql` va credential Excel fayllari Git’ga kirmaydi.
  Repozitoriy **private** bo‘lishi shart (`SECURITY.md`).
- Sir oshkor bo‘lsa: darhol almashtirish, sessiyalarni yopish, auditni
  tekshirish, Git tarixidan tozalash.
- CI’da `npm audit --audit-level=high` majburiy.

---

## 23. Testlar

`npm test` avval build qiladi, so‘ng `node --test tests/*.test.mjs` ni
ishlatadi. Ko‘pchilik testlar barcha migratsiyalarni xotiradagi `node:sqlite`
bazaga qo‘llab, **haqiqiy route handlerlarni** ishga tushiradi (auth, R2,
Telegram almashtiriladi). Oxirgi hisobotga ko‘ra (2026-09-17) **109/109 o‘tgan**.

| Fayl | Nimani tekshiradi |
|---|---|
| chat-upload-safety | 3 ta parallel yuklash, kunlik limit, tozalash |
| dashboard-modular-wiring | Sahifalar alohida modullarga ajratilgani |
| erp-regression | Shtat/katalog migratsiyalari, katalog, DOCX, guruh chat |
| information-access-grants | Lavozim ruxsatlari, yopiq domenlar |
| information-clarifications | Katalog aniqlashtirishlari, drill-down |
| information-loading-race | Eskirgan so‘rovlarni bekor qilish |
| information-pagination | Sahifalash va jami sonlar |
| information-search | Lotin/kirill qidiruv, ACL, AI iqtiboslar |
| information-workflow | Tasdiqlash yo‘nalishi, nazorat, integratsiya |
| mutation-authority | Kim nimani o‘zgartira oladi |
| owner-sso | Egasi SSO bog‘lanishi va chiqish |
| password-runtime | 100 000 iteratsiya qabul, 100 001 rad |
| quiet-hours | Tinch soatlar |
| recurrence | Davomiy topshiriq takrorlanmasligi |
| rendered-html | Origin, cookie, header xavfsizligi |
| report-periods | Toshkent taqvimi, oy oxiri, kabisa yil |
| research-workflow | Ilmiy tadqiqot siyosati |
| roles-credentials-ui | Bir martalik credential eksporti |
| secure-role-credentials | Ochiq sir yo‘qligi, kamida 1 admin |
| table-edit-safety | Joylash, qoralama, parallel yozish, Excel sanalari |

To‘liq tekshiruv: `npm run check` va `npm audit --omit=dev --audit-level=high`.

---

## 24. Ma’lum cheklovlar va kuzatilgan kamchiliklar

**Hujjatlarda qayd etilgan (`docs/KNOWN_LIMITATIONS.md`):**
1. `app/dashboard.tsx` ilgari monolit edi; ko‘p sahifalar ajratildi, lekin
   shell va provisioning hali unda.
2. Chat **polling** asosida — 30 ming bir vaqtdagi foydalanuvchi uchun Durable
   Objects + WebSocket + Queues kerak.
3. Eski (prefikssiz) jadvallar sxemada qolgan.
4. SKUD, GPS, transport, yo‘l aktivlari, soliq, ijro.gov.uz integratsiyalari —
   faqat reja.
5. Backlog: PWA/offline, global qidiruv, ommaviy topshiriq amallari, KPI (BPR kutilmoqda).

**Ushbu tahlilda kod asosida aniqlangan:**
- `app/executive-reports.tsx` (rahbar paneli, 8 yo‘nalish) **hech qaysi
  sahifaga ulanmagan** va raqamlari **qattiq kodlangan demo** ma’lumotlar.
- **“Umumiy e’lonlar”** kanaliga har qanday kirgan foydalanuvchi yoza oladi
  (faqat audit qilinadi, huquq cheklovi yo‘q).
- `app/chatgpt-auth.ts` hech qayerda ishlatilmaydi.
- Audit sahifasida faqat 18 amalning o‘zbekcha nomi bor, qolganlari kod
  ko‘rinishida chiqadi.
- Login/logout audit jurnaliga yozilmaydi.
- `/api/research/files/[id]` doim 404 qaytaradi.
- `examples/d1/` — shablondan qolgan, tizimda ishlatilmaydi.

---

## 25. Tezkor ma’lumotnoma (limitlar va konstantalar)

| Parametr | Qiymat |
|---|---|
| Sessiya | 12 soat / “eslab qolish” 30 kun |
| Bloklash | 5 xato → 15 daqiqa |
| Vaqtinchalik parol | 30 kun |
| Faollashtirish havolasi | 72 soat, bir martalik |
| Vakant rezerv credential | 90 kun |
| Telegram ulash havolasi | 30 daqiqa |
| PBKDF2 | SHA-256, 100 000 iteratsiya |
| Topshiriq ijrochilari | ≤250 |
| Topshiriq fayli | ≤25 MB |
| Topshiriq/yig‘ilish ro‘yxati | ≤300 |
| Topshiriq eslatmalari | 3 kun, 24 s, 3 s, 1 s, 15 daq |
| Telegram urinishlari | ≤6, kutish ≤1 soat |
| Tinch soatlar (standart) | 22:00–07:00 Toshkent |
| Chat xabari | ≤5000 belgi |
| Chat fayli | to‘g‘ridan ≤12 MB, multipart ≤500 MB, bo‘lak 8 MB |
| Chat yuklash limiti | 3 parallel, 2 GiB / 24 soat |
| Chat guruhi | ≤250 a’zo |
| Chat polling | 15 s ro‘yxat, 6 s kanal |
| Hisobot ustunlari / qatorlari | ≤32 / ≤1000 |
| Hisobot qabul qiluvchilari | ≤250 |
| Hisobot fayli | ≤100 MB |
| Hisobot ro‘yxati sahifasi | 500 |
| Ma’lumot yozuvi | ≤160 KB, fayl ≤100 MB |
| Ingest | 1–100 yozuv, ≤20 MB |
| Qidiruv | 2–400 belgi, 20 tadan sahifa |
| AI javobi | 6/daqiqa, 100/sutka, ≤8 manba |
| Ilmiy fayl | ≤15 MB |
| Audit (bootstrap) | oxirgi 60 ta |
| Vaqt mintaqasi | Asia/Tashkent (UTC+5) |

---

*Qo‘shimcha manbalar: `README.md` (umumiy), `BOSHLASH.md` (tez boshlash),
`SECURITY.md` (xavfsizlik siyosati), `docs/REVIEW.md` (arxitektura ko‘rib
chiqish), `docs/KNOWN_LIMITATIONS.md` (backlog),
`docs/TABLE_WORKFLOW_REVIEW_2026-09-17.md` (jadval mantiqi tuzatishlari).*
