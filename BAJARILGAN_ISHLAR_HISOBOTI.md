# Bajarilgan ishlar hisoboti

> **Loyiha:** Ijro nazorati (ichki hisobotlar tizimi)
> **Davr:** 2026-09-29
> **Asos hujjatlar:** `ijro-nazorati-kod-auditi.md`, `KOD_VA_TEZLIK_REJASI.md`
> **Batafsil hisobotlar:** `XAVFSIZLIK_HISOBOTI.md` (xavfsizlik), `KOD_VA_TEZLIK_REJASI.md` (holat jadvali), `DEPLOY.md` (serverga joylash)

## Umumiy natija

| Ko'rsatkich | Boshida | Hozir |
|---|---|---|
| Avtomatik testlar | 116 (asosan kod matnini tekshirgan) | **232** + brauzer E2E 34 ta tekshiruv (Playwright + axe) |
| Kritik xavfsizlik muammolari | 3 ochiq | 0 (K1 ning git tarixi qismi egasida) |
| Yuqori xavfsizlik muammolari | 17 ochiq | 0 to'liq ochiq (Y15 qisman) |
| Past darajadagi xavfsizlik bandlari | 10+ ochiq | 5 tasi yopildi |
| Platforma | Cloudflare Workers + D1 + R2 (OpenAI Sites'ga bog'liq) | Next.js 16 standalone + SQLite + disk, Docker + Caddy (istalgan VPS) |
| Chat | Har 6 soniyada polling | SSE (real vaqt, xabar ~0.02 s da yetadi) |
| Eng katta kod fayli | 1693 qator (`reports-page.tsx`), qatorlar 1000+ belgigacha siqilgan | 1007 qator (`record-form.tsx`), Prettier bilan formatlangan (120 belgi); god-file'lar bo'lingan |
| Bootstrap (birinchi ochilish) | ~280 KB + 500 xodim | **7.4 KB** (gzip bilan 1.5 KB), qayta so'rovda 304 |
| Frontend bahosi (`FRONTEND_TAHLILI.md`) | 5/10 | 41 banddan 41 tasi yopildi (pastga qarang) |
| Tillar | Lotin, kirill (DOM ni o'zgartirib) | Lotin, kirill, **rus** (render vaqtida, `lib/i18n`) |
| Frontend JS | 2.5 MB | 2.2–2.4 MB (ko'proq chunk'larga bo'lingan, talab bo'yicha yuklanadi) |

Holat: **232/232 test**, brauzer E2E 34/34, `tsc`, `eslint`, Prettier va `next build` toza. Docker + Caddy stekida jonli tekshirildi.

---

## 1-bosqich. Xavfsizlik auditi tuzatishlari (K1–K3, Y1–Y17)

To'liq tavsif: `XAVFSIZLIK_HISOBOTI.md`.

| Band | Qisqacha nima qilindi |
|---|---|
| K1 | 77 xodimning shaxsiy ma'lumoti migratsiyadan `private-seed/` ga ko'chirildi (git va Docker'ga kirmaydi); testlar uchun sintetik ma'lumot; egasi emaili almashtirildi |
| K2 | Faollashtirish havolasi faqat oddiy xodim uchun; rahbar/admin — `canManageRoles` bilan; owner akkaunti himoyalangan |
| K3 | Dev rejimdagi avtomatik admin va header orqali kirish olib tashlandi; dev server faqat `127.0.0.1` |
| Y1, Y2 | Atomar login limitlari (IP+login, IP, akkaunt); qattiq bloklash yo'q — rahbarni chetlatib bo'lmaydi |
| Y3 | Parol tiklash va lavozim orqali imtiyozni oshirish yopildi; reissue admin/owner'ga tegmaydi, har akkaunt auditga |
| Y4 | Ijrochi "Tekshiruvga yuborish" qiladi; "Bajarildi"ni faqat topshiriq beruvchi qabul qiladi (web va Telegram) |
| Y5 | Topshiriq, yig'ilish, audit — server sahifalash, "Yana yuklash" |
| Y6, Y7 | E'lonlar kanaliga yozish huquqi va limit; o'qish belgisi endi kirish bermaydi |
| Y8 | Hisobot va Ma'lumotlar markazida o'zini o'zi tasdiqlash yopildi |
| Y9, Y10 | Maxfiy maydonlar API'da yashiriladi; tasdiqlash navbati faqat o'sha yozuvni ochadi |
| Y11 | Ilova ichidagi har daqiqalik scheduler |
| Y12, Y14 | Telegram navbati tozalandi; Telegram va AI'ga minimal ma'lumot; AI kunlik limiti |
| Y13 | Boshqa xodim uchun Telegram havolasi — faqat `canManageRoles`, auditga yoziladi |
| Y15 | ⚠️ qisman — yaratish atomar; FK'lar Postgres bosqichiga |
| Y16 | Nonce'li to'liq CSP, HSTS |
| Y17 | Handler darajasidagi xatti-harakat testlari |

**Yo'l-yo'lakay topilgan xatolar:**
- Tashkilot/bo'limga yuborilgan topshiriqlar bo'yicha Telegram bildirishnomalari SQL sintaksis xatosi tufayli **umuman ishlamagan** — tuzatildi.
- Davriy topshiriqda auditoriya a'zolari keyingi davrga to'g'ridan-to'g'ri ijrochi bo'lib o'tib ketardi — tuzatildi.
- Chat fayl route'ida xatolar ushlanmasdi (`await` yo'q edi) — tuzatildi.

---

## 2-bosqich. Platformani VPS'ga ko'chirish

| Nima | Oldin | Keyin |
|---|---|---|
| Freymvork | Vinext 0.0.50 (eksperimental) | Next.js 16 standalone |
| Baza | Cloudflare D1 | SQLite (`node:sqlite`, D1-mos adapter `db/sqlite-d1.ts`) |
| Fayllar | Cloudflare R2 | Disk (`db/local-bucket.ts`, R2-mos, multipart, range) |
| Cron | Cloudflare trigger (sozlanmagan edi) | `instrumentation.ts` — har daqiqa |
| HTTPS | OpenAI Sites | Caddy (avtomatik Let's Encrypt) |
| Kirish | ChatGPT SSO | Login/parol; `scripts/db.mjs admin` bilan birinchi admin |

- `scripts/db.mjs`: `migrate`, `seed-private`, `admin` buyruqlari; konteyner ishga tushganda migratsiyalar avtomatik.
- Proksi ortida Origin tekshiruvi va `Secure` cookie'lar uchun `publicOrigin()` (`SITE_BASE_URL`).
- Olib tashlandi: Vinext/Vite/Wrangler, Sites skriptlari, `worker/`, `examples/`, ChatGPT SSO kodi.

---

## 3-bosqich. Tezlik (P0) — `KOD_VA_TEZLIK_REJASI.md`

| Band | Natija |
|---|---|
| 1. Sana filtrlari | `lib/sql-time.ts`; sessiya tekshiruvi, Telegram navbati, login limitlari endi indeks bilan; aralash formatlar ISO ga keltirildi (0036) |
| 2. Indekslar | 8 ta yangi indeks; `EXPLAIN QUERY PLAN` testlari; "bitta faol lavozim" qoidasi tuzatildi |
| 3. SQLite | 64 MB kesh, mmap, statement LRU keshi, 100 ms dan sekin so'rovlar logi |
| 4. Chat | SSE (`/api/chat/stream`), `since=` + 204, kanal ro'yxati 1 ta so'rov; Caddy SSE ni buferlamaydi |
| 5. Bootstrap | 500 xodim va audit olib tashlandi (alohida endpointlar), ETag/304 |
| 6. Bundle | Namuna JSON alohida chunk; Excel kutubxonasi yagona yuklovchi orqali |
| 11. Takrorlar | `lib/shared/*`: `readJson` (o'zbekcha xato xabari), turlar, ID, statuslar, ETag, body limit |
| 12. O'lik kod | 235 CSS qoida, 4 marshrut, 6 legacy jadval (0038) |
| 15. Tartiblash | Ma'lumotlar markazi — `created_at DESC` |
| 16. Monitoring | `/api/health`, Docker healthcheck, kunlik `VACUUM INTO` zaxira (14 kun), `PRAGMA optimize` |

---

## 4-bosqich. Kod sifati (P1)

**Vakolat (policy) qatlami** — `lib/policy/`:
`index.ts` (yadro: `Decision`, `authorize`), `tasks.ts`, `meetings.ts`, `admin.ts`, `reports.ts`, `information.ts`, `research.ts`, `chat.ts`. Barcha marshrutlar huquqni faqat shu funksiyalar orqali tekshiradi — K2/Y3 kabi "bir joyda bor, boshqasida unutilgan" xatolarning ildizi yopildi. Har modul uchun jadvalli testlar.

**Service qatlami** — `services/`:
`tasks.ts`, `meetings.ts`, `task-files.ts`, `accounts.ts`, `employees.ts`, `reports.ts`, `information.ts`, `chat.ts`, `research/*`. Web va Telegram bir xil funksiyalarni chaqiradi.

**Katta fayllar bo'lindi:**

| Fayl | Oldin | Keyin |
|---|---|---|
| `app/api/research/route.ts` | 1356 | 37 |
| `app/reports-page.tsx` | 1693 | 133 |
| `app/dashboard.tsx` | 1649 | 598 |
| `app/information-center.tsx` | 1635 | 478 |
| `app/research-reports.tsx` | 1349 | 229 |
| `app/admin-pages.tsx` | 1148 | 52 |
| `app/task-meeting-modals.tsx` | 1102 | 13 |
| `app/information-dashboard.tsx` | 1096 | 267 |
| `lib/telegram.ts` | 870 | 24 (+ `lib/telegram-bot/*`) |

Navigatsiya o'zbekcha yorliq matni (`activeNav.includes("Topshiriq")`) o'rniga turli `NavKey` bilan ishlaydi.

**So'rov chegaralari:** JSON — 2 MB (`readJsonBody`, 413); fayllar oqim bilan, `Content-Length` majburiy; yopilgan/arxivlangan topshiriq isbot fayllarini o'chirib bo'lmaydi; tadqiqot paneli sahifalangan.

**Qo'shimcha yopilgan xavfsizlik bandlari:** parol almashtirish limiti, 8 soatlik harakatsizlik taymauti, PBKDF2 600 000 + avtomatik qayta xeshlash, rol o'zgarishlari auditida oldin/keyin farqi, login vaqtini tenglashtirish.

---

## 5-bosqich. Frontend tuzatishlari — `FRONTEND_TAHLILI.md`

Tahlil frontendga **5/10** baho bergan va 41 ta kamchilik topgan edi. Ular bosqichma-bosqich tuzatildi:

**1. Kritik xatolar**
- **Bootstrap sikli:** `dashboard.tsx` dagi effekt o'zi yangilaydigan qiymatga bog'liq bo'lgani uchun har bir ochiq oyna serverga to'xtovsiz so'rov yuborardi. `useRef` bilan tuzatildi, regressiya testi qo'shildi.
- **Sessiya tugashi:** 401 kelsa (masalan, 8 soatlik harakatsizlikdan keyin) eskirgan ma'lumot tozalanadi va login sahifasi chiqadi (`SessionExpiredError`).
- **Ro'yxat holati:** yangilanishda tanlangan filtr va yuklangan sahifalar saqlanadi.

**2. Kirill rejimi va ish oqimlari**
- Fondagi xato kirill rejimini o'chirmaydi.
- Telegram ulash kodi, login, email va `@username` kirillga o'girilmaydi (admin xodimga to'g'ri kod beradi).
- Yig'ilishlarda "Yana yuklash"; yopilgan/arxivlangan topshiriqda fayl o'chirish va yo'naltirish tugmalari yashirilgan.
- Topshiriqlarda "Tekshiruvda" tabi va topshiriq beruvchi uchun "Qabulingizni kutmoqda" belgisi.
- Aloqa uzilganda "Aloqa uzildi — Qayta urinish" banneri; chatda "Qayta ulanmoqda…" belgisi.

**3. Accessibility**
- Modal oynalar: fokus ichkarida ushlanadi, Escape yopadi, yopilganda fokus joyiga qaytadi, ekran o'quvchi sarlavhani o'qiydi.
- 12 ta brauzer `confirm` va 2 ta `prompt` o'rniga o'zimizning `ConfirmDialog` (kirill rejimida ham o'giriladi). Parollarni ommaviy yangilash uchun "PAROLNI YANGILASH" deb yozish talab qilinadi; hisobotni qaytarish sababi majburiy.
- Toast xabarlari `aria-live` bilan e'lon qilinadi; jadval qatorlari va kartalar klaviatura bilan ochiladi.

**4. Kichik xatolar va tozalash**
- Toast taymeri, logout xatosini tekshirish, `localStorage` xavfsiz ishlatilishi, ro'yxatlarda barqaror `key`.
- ETag Caddy siqishi (`-gzip`) bilan ham mos keladi — gzip bilan 304 jonli tasdiqlandi.
- Yuklanish skeletlari (topshiriqlar, audit).
- Ishlatilmaydigan `docx` va ikkinchi toast tizimi (`sonner`) olib tashlandi.

**5. Tuzilma va tezlik**
- Tashkilot va bo'limlar bootstrap'dan `/api/bootstrap/structure` ga ko'chirildi: bootstrap **104 KB → 7.4 KB**.
- Topshiriqlar offset o'rniga **cursor** bilan sahifalanadi — ro'yxat o'zgarsa ham takror yoki tushib qolish yo'q.
- Qolgan katta fayllar bo'lindi: `admin-modals.tsx` 858→13, `chat-page.tsx` 797→11, `report-fill-modal.tsx` 700→222 (+ `_components/*`).
- `DashboardContext` (actor, alifbo, notify, refresh) — prop orqali uzatish kamaydi; hisobot mantig'i `useReportSheet`/`useReportDraft` hook'larida.
- Prettier (`npm run format`, `format:check`): 300 belgidan uzun, bir qatorga siqilgan JSX qatorlari yo'qoldi.
- Uslub qoidalari: `docs/FRONTEND_STYLE.md`.

**6. Qolgan bandlar ham yopildi**
- **i18n qatlami (`lib/i18n`):** DOM'ni o'zgartiruvchi MutationObserver olib tashlandi. UI matni `t()`, ma'lumot `tx()` orqali render vaqtida o'giriladi; login, kod, URL — xom. Kirill rejimidagi xatolarning ildizi yopildi.
- **Rus tili:** uchinchi til (~1 950 kalit); til almashtirgich Lotin / Кирилл / Рус; tanlov cookie'da saqlanadi.
- **Server Components:** birinchi ekran ma'lumoti HTML bilan keladi — `/api/bootstrap` birinchi so'rovi va login sahifasidagi 401 so'rov yo'q.
- **CSS:** `globals.css` 249 KB → 171 KB; soha CSS'lari sahifa bilan yuklanadi; 40 ta rang tokeni.
- **Virtualizatsiya:** xodimlar, shtat va ijrochi tanlash ro'yxatlari (`useVirtualList`).
- **Brauzer E2E (Playwright + axe):** desktop va mobilda 34/34. Test topgan va tuzatilgan xatolar: topbar 1440 px ekranga sig'mas edi (57 px siljish), mobil bosh sahifada 17 px siljish, 17 ta kam kontrastli matn (WCAG AA). Skript: `tests/e2e/browser-smoke.mjs`, yo'riqnoma: `docs/E2E.md`.

---

## 6-bosqich. Audit hujjatining o'rta darajali bandlari

Audit (`ijro-nazorati-kod-auditi.md`) o'rta darajali bandlarining hammasi yopildi; holat jadvali audit hujjatining boshida.

| Soha | Nima tuzatildi |
|---|---|
| Topshiriqlar | Davriy muddat endi asl kunga qaytadi (31-yan → 28-fev → **31-mar**), hisob Toshkent vaqtida (avval kun siljib ketardi); muddati o'tgan topshiriq nomini tahrirlash mumkin; tahrirdan keyin auditoriya eslatmalari qayta tiklanadi; o'tgan yig'ilishni tahrirlash/o'chirish qoidasi izchil; topshiriq fayllari uchun kvota (topshiriqqa 200 MB, xodimga kuniga 1 GB) |
| Hisobotlar | Hisobot davri holati: ochiq → **kechikkan** → yopilgan (avval hech kim yozmas edi); UI'da "Muddati o‘tgan" belgisi; tekshiruvchining qaytarish sababi qoralama saqlanganda o'chmaydi |
| Integratsiya (ingest) | 100 dan ortiq yozuv jimgina tashlanmaydi — 413; mavjud yozuvlar yangilanadi (tasdiqlashdagi va xodim tahrirlaganlari himoyalangan) |
| Baza yaxlitligi | Audit jurnali append-only (trigger), nazoratli saqlash muddati (3 yil) va eski sessiya/token/ishlarni tozalash; status/progress/ustuvorlik uchun tekshiruv triggerlari; foydalanilmagan Drizzle ORM olib tashlandi; qolgan sana filtrlari indeksga moslandi; chat multipart jami hajmi cheklandi |
| Xodimlar | Rahbar sikli (A→B→A) — xodim yaratishdagi "tiklash" yo'lida sikl tekshiruvsiz yangilanish xatosi topildi va tuzatildi; baza triggeri qo'shildi |

Yangi migratsiyalar: `0039_recurrence_anchor_and_task_file_quota.sql`, `0040_report_cycle_lifecycle.sql`, `0041_audit_append_only_and_value_guards.sql`.

**Tuzatish:** avvalgi xabarda "davriy topshiriq muddati siljishi tuzatildi" deyilgan edi — bu noto'g'ri edi; u aynan shu bosqichda tuzatildi.

---

## Yangi migratsiyalar

| Fayl | Mazmuni |
|---|---|
| `0032_login_rate_limits.sql` | Login urinishlari jadvali |
| `0033_task_review_and_pagination.sql` | `creation_key`, sahifalash indekslari |
| `0034_chat_read_state_and_limits.sql` | O'qish holati jadvali, soxta a'zoliklarni tozalash |
| `0035_telegram_queue_hygiene.sql` | Navbat tozaligi, AI kunlik hisoblagich |
| `0036_timestamp_formats_and_indexes.sql` | Sana formatlari, 8 ta indeks |
| `0038_drop_legacy_tables.sql` | 6 ta eski jadvalni o'chirish |

---

## Tekshiruv usuli

1. **Avtomatik:** `npm test` — 232 test (Node 24); `tsc --noEmit`; `eslint`; `npm run format:check`; `next build`.
2. **Jonli (Docker + Caddy, `localhost`):**
   - bosh sahifa: CSP nonce bilan, 11/11 skript nonce'li, HSTS bor;
   - soxta identity header → 401; boshqa saytdan POST → 403;
   - login → 200, bootstrap → 200, qayta so'rov ETag bilan → 304;
   - chat: SSE hodisasi 0.02 s da yetib keldi, `since=` → 204;
   - `/api/health` → 200, Docker holati "healthy", kunlik zaxira fayli yaratildi.

---

## Qolgan ishlar

| Ish | Kim / qachon |
|---|---|
| **VPS'ga deploy** | IP, SSH va domen berilgach (`DEPLOY.md`) |
| Brauzerda qo'lda ko'rib chiqish (haqiqiy telefon, qorong'i mavzu) — avtomatik E2E 34/34 o'tgan | Deploydan oldin, egasi bilan |
| Git tarixini tozalash va eski ZIP'larni bekor qilish (K1) | Loyiha egasi |
| Asosiy jadvallarga FK (Y15), to'liq tur xavfsizligi (10) | Postgres bosqichida |
| Xatolarni markaziy yig'ish (Sentry/GlitchTip) | Hisob ochilgach |
| Chat qidiruvi har bir xodimga barcha xodimlar ro'yxatini ko'rsatadi — bu ataylabmi? (siyosat qarori) | Loyiha egasi |
| Postgres'ga o'tish | Faol foydalanuvchilar bir necha yuzdan oshganda (`MIGRATSIYA_REJASI.md`) |

**Git holati:** barcha o'zgarishlar indeksga qo'shilgan (`git add`), commit qilinmagan. `private-seed/`, `deploy/.env`, `runtime-data/` git'dan tashqarida.
