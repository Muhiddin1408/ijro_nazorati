# Next.js + PostgreSQL ga o‘tish rejasi

> Tuzilgan sana: 2026-09-28. Hozirgi holat: Vinext + Cloudflare Workers + D1 (SQLite) + R2,
> OpenAI Sites hostingida. Maqsad: standart Next.js + PostgreSQL + S3-mos fayl ombori,
> o‘z serveringizda yoki tanlangan bulutda.

---

## 0. Qisqacha xulosa

| | Hozir | Keyin |
|---|---|---|
| Framework | Vinext 0.0.50 (Next.js’ni Vite’da ishlatadi) | **Next.js 16** (rasmiy, `output: "standalone"`) |
| Runtime | Cloudflare Workers | **Node.js 24** (Docker konteyner) |
| Baza | Cloudflare D1 (SQLite) | **PostgreSQL 16+** |
| Fayllar | Cloudflare R2 | **S3-mos ombor** (MinIO o‘z serverda yoki bulutdagi S3) |
| Cron / fon ishlari | Worker `scheduled()` + `waitUntil` | Alohida **worker jarayoni** (cron) + mavjud `/api/reminders/process` |
| Qidiruv | SQLite FTS5 | Postgres `tsvector` + `pg_trgm` |
| Hosting | OpenAI Sites | Docker Compose (app + worker + postgres + minio + nginx) |

**Asosiy strategiya — kodni qaytadan yozmaslik.** D1 bilan bir xil interfeysga ega
(`prepare().bind().first()/all()/run()`, `batch()`) Postgres adapteri yoziladi. Shunda
539 ta so‘rovning mantig‘i joyida qoladi, faqat SQL sintaksisi Postgres’ga moslanadi.
Fayl ombori uchun ham R2 bilan bir xil interfeysli S3 adapteri qilinadi.

**Taxminiy hajm:** 1 tajribali dasturchiga **7–10 hafta**, 2 kishiga **5–6 hafta**
(test va parallel sinov davri bilan). Bu kodni ko‘rib chiqish asosidagi baho; aniq
muddat 1-bosqichdan keyin ma’lum bo‘ladi.

---

## 1. Hozirgi holatning o‘lchovlari (kod tahlili)

| Ko‘rsatkich | Soni | Ta’siri |
|---|---|---|
| `db.prepare(...)` chaqiruvlari | **539** (48 fayl) | Hammasi qo‘lda SQLite SQL — har birini ko‘rib chiqish kerak |
| `db.batch(...)` | 54 | Postgres’da tranzaksiyaga aylanadi |
| `.changes` (o‘zgargan qatorlar soni) | 28 | `rowCount` ga moslanadi (optimistik qulf shunga tayanadi!) |
| `datetime(...)` | 60 | `now()`, `interval`, `timestamptz` ga o‘zgaradi |
| `WITH RECURSIVE` | 34 | Postgres’da ishlaydi, o‘zgarish kam |
| `INSERT OR IGNORE` | 13 | `ON CONFLICT DO NOTHING` |
| `ON CONFLICT ... DO UPDATE` | 13 | Deyarli bir xil, `excluded.` ishlaydi |
| `json_extract` / `json_each` | 10 / 3 | `->>` / `jsonb_array_elements` |
| `last_insert_rowid()` | 2 | `RETURNING id` |
| FTS5 (`MATCH`, `bm25`) | 1 fayl + 11 trigger | To‘liq qayta yoziladi |
| Boshqa triggerlar | 2 (oxirgi admin himoyasi) | PL/pgSQL’ga qayta yoziladi |
| R2 (`BUCKET`) murojaatlari | 27 | S3 adapteri orqali |
| `cloudflare:workers` import | 2 (`db/index.ts`, `lib/background.ts`) | `process.env` va ichki navbatga almashadi |
| Migratsiyalar | 32 ta (0000–0031), 0011 = 850 KB seed | Bitta Postgres **baseline** sxemaga yig‘iladi |
| API route fayllari | 42 | Tuzilishi o‘zgarmaydi (Next.js App Router formati bir xil) |
| Testlar | 20 fayl, 109 test (`node:sqlite` xotirada) | Test Postgres’ga o‘tkaziladi |

---

## 2. Maqsadli arxitektura

```
                ┌──────────── nginx (HTTPS, xavfsizlik headerlari, 500 MB body) ────────────┐
Brauzer ───────►│                                                                            │
Telegram ──────►│   app (Next.js standalone, Node 24)  ──►  PostgreSQL 16                   │
                │          │                                ▲                                │
                │          └──► MinIO / S3 (fayllar)        │                                │
                │                                           │                                │
                │   worker (Node, cron har 1 daqiqa) ───────┘  Telegram outbox, hisobot       │
                │                                              davrlari, chat tozalash        │
                └────────────────────────────────────────────────────────────────────────────┘
```

- **app** — foydalanuvchi so‘rovlari (hozirgi `app/` deyarli o‘zgarishsiz).
- **worker** — hozirgi `worker/index.ts` dagi `scheduled()` o‘rniga:
  `processNotificationJobs(100)`, `ensureReportCycles()`, `cleanupExpiredChatUploads()`
  har daqiqada. Bir nechta nusxa ishlasa ham xavfsiz bo‘lishi uchun
  `SELECT ... FOR UPDATE SKIP LOCKED` yoki `pg_advisory_lock` ishlatiladi.
- **Zaxira:** `pg_dump` har kecha + WAL arxiv (PITR), MinIO bucket versiyalash /
  `rclone` bilan ikkinchi joyga nusxa.

> **Eslatma (huquqiy):** tizimda xodimlarning shaxsiy ma’lumotlari (F.I.Sh., tug‘ilgan
> sana, telefon) bor. O‘zbekistonning “Shaxsga doir ma’lumotlar to‘g‘risida”gi qonuni
> fuqarolar shaxsiy ma’lumotlarini O‘zbekiston hududidagi serverlarda saqlashni talab
> qiladi. Hosting joyini tanlashda buni yuristlar/axborot xavfsizligi bilan tasdiqlang —
> bu ko‘chishning muhim sabablaridan biri bo‘lishi mumkin.

---

## 3. Bosqichlar

### 0-bosqich. Tayyorgarlik va to‘siqlarni yechish (3–5 kun)

1. **Production ma’lumotiga kirishni ta’minlash — eng muhim to‘siq.** Baza va fayllar
   OpenAI Sites loyihasida (eski hosting loyihasi). D1’ni to‘liq eksport qilish (SQL dump)
   va R2’dagi barcha fayllarni yuklab olish imkoni borligini **birinchi navbatda** aniqlang.
   Imkon bo‘lmasa, ilova ichida faqat administrator uchun “to‘liq eksport” API’si yozish
   kerak bo‘ladi (jadvallarni JSON/CSV qilib, fayllarni oqim bilan beradi).
2. Kodni Git’ga qo‘yish (hozirgi papka Git repozitoriy emas), `migration/postgres` branch.
3. Mavjud testlar yashil ekanini tasdiqlash: `npm run check`.
4. Maqsadli server/hostingni tanlash, domen, SSL.
5. **Administrator login/paroli borligini tekshirish.** Hozir egasi Sites SSO orqali
   kiradi — yangi serverda bu headerlar bo‘lmaydi. Ko‘chishdan oldin egasi
   **Kirish xavfsizligi** bo‘limida o‘ziga login/parol yaratishi shart.

### 1-bosqich. Vinext → Next.js (hali D1’da qolib) (4–6 kun)

Maqsad: bir vaqtda bitta narsani o‘zgartirish. Avval framework, keyin baza.

1. `package.json`: `vinext`, `vite`, `@vitejs/*`, `@cloudflare/vite-plugin` ni olib
   tashlash; skriptlar: `next dev`, `next build`, `next start`.
2. `vite.config.ts`, `build/sites-vite-plugin.ts`, `.openai/`, `wrangler.local.jsonc`,
   `scripts/sites-env.sh` va boshqa Sites skriptlarini olib tashlash.
3. `next.config.ts`: `output: "standalone"`, xavfsizlik headerlari (`worker/index.ts`
   dagi `secureResponse` mazmuni `headers()` yoki `middleware.ts` ga ko‘chadi),
   katta fayllar uchun body limitlari.
4. `db/index.ts` → `getRuntimeEnv()` `process.env` dan o‘qiydigan bo‘ladi
   (`cloudflare:workers` o‘rniga).
5. `lib/background.ts` → `runInBackground` Next.js `after()` orqali (javobdan keyin bajarish).
6. `app/layout.tsx` fontlari (`.vinext/fonts`) → `next/font`.
7. Barcha sahifa va API ishlashini qo‘lda tekshirish.

> Bu bosqichda D1’ga lokal ulanish uchun vaqtincha `better-sqlite3` asosidagi D1-mos
> adapter ishlatish mumkin (2-bosqichdagi adapter bilan bir xil interfeys) — shunda
> Next.js’ni Cloudflare’siz sinab ko‘rish osonlashadi.

### 2-bosqich. Ma’lumotlar qatlami adapterlari (5–7 kun)

**2.1. `lib/db/` — D1-mos Postgres adapteri** (`pg` kutubxonasi, `Pool`):

```ts
// Maqsadli interfeys — mavjud kod shunday ishlatadi:
db.prepare(sql).bind(...args).first<T>()   // → bitta qator yoki null
db.prepare(sql).bind(...args).all<T>()     // → { results: T[] }
db.prepare(sql).bind(...args).run()        // → { meta: { changes, last_row_id } }
db.batch([stmt1, stmt2, ...])              // → BEGIN; ...; COMMIT (xatoda ROLLBACK)
```

- `?` belgilarini `$1, $2, ...` ga avtomatik o‘girish (satr literallari ichidagi `?` ni
  hisobga olib).
- `run().meta.changes` = `rowCount` — **optimistik qulf (`version`, `mutation_key`) shunga
  tayanadi**, alohida test bilan tekshiriladi.
- `batch()` — bitta tranzaksiya, `READ COMMITTED`; kerakli joylarda `SERIALIZABLE`.
- Barcha fayllarda `D1Database` turini o‘z `Db` interfeysimiz bilan almashtirish (47 fayl,
  mexanik o‘zgarish).

**2.2. `lib/storage/` — R2-mos S3 adapteri** (`@aws-sdk/client-s3`):
`put`, `get` (Range bilan — chat videolari uchun), `delete`, `head`,
`createMultipartUpload` / `uploadPart` / `complete` / `abort`. MinIO va AWS S3 ikkalasida
ishlaydi.

### 3-bosqich. Postgres sxemasi (5–7 kun)

32 ta SQLite migratsiyasini qayta o‘ynatish o‘rniga **bitta baseline** yoziladi:
`db/postgres/0001_baseline.sql` = hozirgi yakuniy sxema.

| SQLite | Postgres | Izoh |
|---|---|---|
| `INTEGER PRIMARY KEY AUTOINCREMENT` | `bigint GENERATED BY DEFAULT AS IDENTITY` | Ko‘chirishdan keyin sequence’larni `setval` bilan to‘g‘rilash |
| Tasodifiy 48-bit ID (hisobot shablonlari) | `bigint` | O‘zgarmaydi |
| `TEXT` sanalar (`CURRENT_TIMESTAMP`, ISO) | **`timestamptz`** | Ko‘chirishda formatlarni tekshirish shart (pastga qarang) |
| `INTEGER` 0/1 mantiqiy | `boolean` yoki `smallint` | 1-qadamda `smallint` qoldirish xavfsizroq — kod `=1` bilan solishtiradi |
| `*_json TEXT` | 1-qadamda `text`, keyin `jsonb` | `json_extract` o‘rniga `::jsonb->>` |
| `CHECK`, `UNIQUE`, indekslar | Bir xil | Qisman indekslar (`WHERE ...`) ham ishlaydi |
| Oxirgi admin triggerlari (0023) | PL/pgSQL trigger funksiyasi | Test bilan (`secure-role-credentials`) |
| FTS5 `app_center_search` + 11 trigger | `tsvector` ustun + GIN indeks + `pg_trgm` | 5-bosqichga qarang |
| Legacy jadvallar (`departments`, `employees`, `tasks`...) | **Ko‘chirilmaydi** | Kodda ishlatilmaydi |

Keyingi o‘zgarishlar uchun migratsiya vositasi: `drizzle-kit` (Postgres dialekti) yoki
oddiy raqamlangan SQL + `node-pg-migrate`.

### 4-bosqich. SQL so‘rovlarini Postgres’ga moslash (10–15 kun — eng katta ish)

Tartib: kichik va asosiy modullardan kattalariga. Har modul tugagach, uning testlari
Postgres’da yashil bo‘lishi kerak.

1. `lib/auth.ts`, `lib/password.ts`, `app/api/auth/*` — kirish ishlamasa hech narsa ishlamaydi
2. `lib/access-control.ts`, `lib/directory.ts`, `app/api/admin/*`, `app/api/staff`
3. `lib/data.ts`, `app/api/tasks`, `app/api/meetings`, `app/api/files`, `lib/recurrence.ts`
4. `lib/telegram.ts`, `lib/quiet-hours.ts`, `app/api/telegram/*`, `app/api/reminders`
5. `lib/chat*.ts`, `app/api/chat/*`
6. `lib/reports.ts`, `lib/report-*.ts`, `app/api/reports/*`
7. `lib/information*.ts`, `app/api/information/*`
8. `lib/research-*.ts`, `app/api/research/*` (1354 qatorli eng katta fayl)

**Almashtirish jadvali:**

| SQLite | Postgres |
|---|---|
| `datetime('now')` | `now()` |
| `datetime('now','-15 minutes')` | `now() - interval '15 minutes'` |
| `datetime(expires_at) > datetime('now')` | `expires_at > now()` |
| `INSERT OR IGNORE INTO t ...` | `INSERT INTO t ... ON CONFLICT DO NOTHING` |
| `json_extract(col,'$.a')` | `col::jsonb->>'a'` (jsonb bo‘lsa `col->>'a'`) |
| `json_each(?)` | `jsonb_array_elements(?::jsonb) WITH ORDINALITY` |
| `CAST(key AS INTEGER)` (`json_each`) | `ordinality - 1` |
| `last_insert_rowid()` | `INSERT ... RETURNING id` |
| `LIKE` (SQLite’da ASCII uchun katta-kichik harf farqsiz) | `ILIKE` — kirill qidiruvida ham to‘g‘ri ishlaydi |
| `IFNULL(a,b)` | `COALESCE(a,b)` |
| `a || b` | Bir xil |
| `SELECT ... WHERE EXISTS` bilan shartli INSERT | Bir xil ishlaydi |
| `MAX(a,b)` (skalyar) | `GREATEST(a,b)` |
| `substr`, `instr` | `substring`, `strpos` |

**Diqqat talab qiladigan joylar:**
- **Parallel yozish himoyasi.** Hisobotlar (`lib/report-mutations.ts`) va Ma’lumotlar
  markazidagi `expectedVersion` / `mutation_key` mantiqi SQLite’ning ketma-ket yozishiga
  tayangan. Postgres’da haqiqiy parallellik bor — `table-edit-safety` testlari va
  qo‘shimcha parallel so‘rov testi bilan tekshirish.
- **Biznes-kalit band qilish** (`app_information_business_keys`) — `UNIQUE` buzilishi
  Postgres’da `23505` xato kodi bilan keladi; xatoni tanib olish kodini moslash.
- **Chat yuklash kvotasi** — bitta `INSERT ... SELECT` bilan atomar tekshiriladi;
  Postgres’da poyga holati bo‘lmasligi uchun `pg_advisory_xact_lock(employee_id)`.
- **Telegram outbox** — “olish” so‘rovi `FOR UPDATE SKIP LOCKED` bilan qayta yoziladi.
- **AI qidiruv limiti** `app_audit_logs` orqali atomar band qilinadi — shu kabi.

### 5-bosqich. Qidiruvni qayta qurish (3–4 kun)

- `app_center_search` o‘rniga: `kind`, `source_id`, `title`, `body`, `search_vector tsvector`
  (`simple` konfiguratsiya — o‘zbek tili uchun tayyor lug‘at yo‘q), GIN indeks, `pg_trgm`
  indeks.
- Sinxronlash: 11 ta FTS5 triggeri o‘rniga PL/pgSQL triggerlar (yozuvlar, shakllar,
  domenlar, tashkilotlar, ilmiy loyihalar).
- `lib/search-language.ts`: lotin/kirill, stop-so‘zlar, qo‘shimcha kesish, sinonimlar
  **o‘zgarmaydi**; faqat natija FTS5 `"x"*` o‘rniga `to_tsquery('simple', 'x:*')` bo‘ladi
  (foydalanuvchi matni hech qachon to‘g‘ridan-to‘g‘ri sintaksisga tushmasligi saqlanadi).
- Tartiblash: `bm25(0,0,6,1)` → `ts_rank_cd(setweight(title,'A') || setweight(body,'B'), query)`.
- Kirish huquqini sanashdan oldin qo‘llash qoidasi saqlanadi —
  `information-search` testlari shuni tekshiradi.

### 6-bosqich. Fon ishlari va Cloudflare’ga xos kod (2–3 kun)

- `worker/index.ts` → `scripts/worker.ts` (alohida Node jarayoni, har daqiqa):
  Telegram navbati, hisobot davrlari, chat yuklamalarini tozalash.
- Ixtiyoriy: kerak bo‘lsa `pg-boss` (Postgres ustidagi navbat), lekin mavjud
  `app_notification_jobs` outbox’i yetarli.
- Admin bootstrap orqali navbatni “uyg‘otish” (`X-Ijro-Reminder-Worker`) olib tashlanadi —
  endi doimiy worker bor.
- `/_vinext/image` → Next.js standart `next/image`.

### 7-bosqich. Testlar (4–5 kun, 2–6-bosqichlar bilan parallel)

- Hozirgi testlar SQLite migratsiyalarini `node:sqlite` xotira bazasiga qo‘llaydi.
  Yangi: Docker’dagi Postgres (yoki `testcontainers`), har test fayli uchun alohida
  sxema/baza, baseline qo‘llanadi.
- Faqat SQLite migratsiya matnini tekshiradigan testlar (`erp-regression`,
  `information-clarifications` va h.k.) baseline yoki ma’lumot ko‘chirish skriptiga
  moslashtiriladi.
- Yangi testlar: adapter (`?`→`$n`, `changes`, `batch` rollback), parallel yozish,
  S3 adapter (MinIO bilan), ma’lumot ko‘chirish skripti.
- CI: GitHub Actions’da `services: postgres`, `minio`.

### 8-bosqich. Ma’lumotlarni ko‘chirish (3–5 kun + sinov)

1. **Eksport:** D1 → SQL dump yoki JSON (0-bosqichda aniqlangan usul bilan).
   R2 → barcha obyektlar (`rclone` yoki eksport API).
2. **O‘girish skripti** (`scripts/migrate-d1-to-pg.ts`):
   - har jadval uchun qator-qator o‘qish → turlarni o‘girish → `COPY` bilan yozish;
   - **sanalar:** bazada ikki xil format bo‘lishi mumkin — `CURRENT_TIMESTAMP`
     (`2026-09-28 10:00:00`, UTC) va JS ISO (`2026-09-28T10:00:00.000Z`). Ikkalasini UTC deb
     `timestamptz` ga o‘girish; noto‘g‘ri formatli qiymatlarni hisobotga chiqarish;
   - sequence’larni `setval(max(id))` bilan to‘g‘rilash;
   - FTS indeksini qayta qurish.
3. **Tekshirish:** har jadval qator soni, asosiy jadvallar uchun checksum, R2 obyektlar soni
   va hajmi, tasodifiy 50 ta yozuvni qo‘lda solishtirish, har rol bilan kirib ko‘rish.
4. Kamida **2 marta sinov ko‘chirish** (repetitsiya) — vaqtni o‘lchash uchun.

### 9-bosqich. Parallel sinov va o‘tish (1–2 hafta)

1. Staging serverda eski production nusxasi bilan 5–7 kun sinov: kalit foydalanuvchilar
   (admin, rahbar, hudud, tuman, oddiy xodim) asosiy ssenariylarni bajaradi.
2. Telegram botni **staging uchun alohida bot** bilan sinash (production bot webhook’i
   bir vaqtda faqat bitta manzilga ulanadi).
3. **O‘tish kuni:**
   - foydalanuvchilarni ogohlantirish, dam olish kuni/kechqurun;
   - eski tizimni faqat o‘qish rejimiga o‘tkazish (yoki texnik ishlar sahifasi);
   - yakuniy eksport → import → tekshirish;
   - DNS / domenni yangi serverga yo‘naltirish;
   - `POST /api/admin/telegram/setup` — webhook’ni yangi manzilga o‘rnatish;
   - sessiyalar ko‘chirilmaydi → hamma qayta login qiladi (oldindan xabar bering).
4. **Qaytish rejasi:** eski Sites nusxasi 2–4 hafta o‘chirilmay, faqat o‘qish rejimida
   saqlanadi. Jiddiy muammo bo‘lsa DNS va webhook qaytariladi (yangi tizimdagi o‘zgarishlar
   qo‘lda ko‘chiriladi — shuning uchun birinchi kunlar kuzatuv kuchaytiriladi).

### 10-bosqich. Ko‘chishdan keyin (ixtiyoriy, alohida loyiha sifatida)

- `*_json` ustunlarini `jsonb` ga, `smallint` mantiqiylarni `boolean` ga o‘tkazish.
- Chat uchun WebSocket (Socket.IO yoki `ws`) + Postgres `LISTEN/NOTIFY` yoki Redis —
  polling o‘rniga (30 ming foydalanuvchi maqsadi uchun).
- So‘rovlarni asta-sekin Drizzle query builder’ga o‘tkazish (tur xavfsizligi uchun) —
  shoshilmasdan, modul-modul.
- Monitoring: Sentry, Prometheus/Grafana, sekin so‘rovlar uchun `pg_stat_statements`.

---

## 4. Taxminiy jadval

| Bosqich | Davomiyligi (1 dasturchi) |
|---|---|
| 0. Tayyorgarlik, eksportga kirish | 3–5 kun |
| 1. Vinext → Next.js | 4–6 kun |
| 2. DB va storage adapterlari | 5–7 kun |
| 3. Postgres sxemasi | 5–7 kun |
| 4. 539 ta so‘rovni moslash | 10–15 kun |
| 5. Qidiruv | 3–4 kun |
| 6. Fon ishlari | 2–3 kun |
| 7. Testlar | 4–5 kun (parallel) |
| 8. Ma’lumot ko‘chirish | 3–5 kun |
| 9. Parallel sinov va o‘tish | 5–10 kun |
| **Jami** | **≈ 7–10 hafta** |

---

## 5. Xavflar va ularni kamaytirish

| Xavf | Ehtimol | Choralar |
|---|---|---|
| Production D1/R2 ni to‘liq eksport qilib bo‘lmaydi | O‘rta | 0-bosqichda birinchi navbatda tekshirish; kerak bo‘lsa admin eksport API |
| Egasi SSO’siz tizimga kira olmay qoladi | O‘rta | O‘tishdan oldin login/parol yaratish (0-bosqich, 5-band) |
| SQL o‘girishda sezilmas xato (ayniqsa sanalar, `changes`) | Yuqori | Modul-modul, har modulga Postgres testlari, sanalar uchun alohida test |
| Parallel yozishda yangi poyga holatlari | O‘rta | `SKIP LOCKED`, advisory lock, parallel testlar |
| Qidiruv sifati o‘zgaradi (FTS5 → tsvector) | O‘rta | Mavjud `information-search` testlari + 30–50 ta real so‘rov bilan solishtirish |
| Telegram xabarlari takrorlanadi yoki yo‘qoladi | Past | `idempotency_key` saqlanadi; o‘tish kuni navbat bo‘sh bo‘lishini kutish |
| Fayl yo‘llari (R2 kalitlari) mos kelmay qoladi | Past | Kalitlar o‘zgarishsiz ko‘chiriladi; obyektlar soni va hajmini solishtirish |
| Muddat cho‘zilishi | O‘rta | 1-bosqich (Vinext → Next.js) o‘zi alohida foyda beradi — shu yerda to‘xtab ham turish mumkin |

---

## 6. Kerakli qarorlar (boshlashdan oldin)

1. **Hosting:** o‘z serveringiz (on-prem) yoki O‘zbekistondagi bulut provayderi?
   (shaxsiy ma’lumotlar qonuni).
2. **Fayl ombori:** MinIO (o‘z serverda) yoki provayder S3.
3. **Jamoa:** kim bajaradi, qancha odam.
4. **Muzlatish davri:** ko‘chish vaqtida yangi funksiyalar qo‘shilmaydi (aks holda ikki
   joyda ish bo‘ladi).
5. **Eski tizimni qancha saqlash** (tavsiya: 2–4 hafta).

---

## 7. Birinchi qadamlar (shu haftada)

- [ ] Sites loyihasidan D1 va R2 ni eksport qilish mumkinligini aniqlash
- [ ] Egasi uchun login/parol yaratish va u bilan kirib ko‘rish
- [ ] Kodni Git repozitoriyga qo‘yish, `npm run check` yashil ekanini tasdiqlash
- [ ] Hosting va fayl ombori bo‘yicha qaror
- [ ] 1-bosqich: Vinext → Next.js (D1’da qolgan holda)
