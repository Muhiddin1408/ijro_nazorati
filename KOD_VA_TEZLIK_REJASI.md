# Kodni tuzatish va tizimni yengillashtirish rejasi

> **Sana:** 2026-09-29
> **Asos:** kod o'lchovlari (fayl hajmlari, build natijasi, so'rovlar soni), `ijro-nazorati-kod-auditi.md` va arxitektura tahlili.
> **Holat:** Next.js 16 standalone + SQLite (`node:sqlite`) + disk ombori, Docker + Caddy.
> **Hajm baholari:** bitta tajribali dasturchi uchun taxminiy.

## Bajarilish holati

| Band | Holat | Natija |
|---|---|---|
| 1. Sana filtrlari | ✅ | `lib/sql-time.ts`; sessiya, Telegram navbati, login limitlari endi indeks bilan; aralash formatlar migratsiya 0036 bilan ISO ga keltirildi |
| 2. Indekslar | ✅ | 0036: 8 ta yangi indeks, `EXPLAIN QUERY PLAN` testlari bilan; "bitta faol lavozim" qoidasi endi ishlaydi |
| 3. SQLite sozlamalari | ✅ | 64 MB kesh, mmap, statement LRU keshi (500), sekin so'rov logi (>100 ms) |
| 4. Chat | ✅ | 6 s polling o'rniga SSE (`/api/chat/stream`), `since=` + 204, kanal ro'yxati 1 ta SQL, standart kanallar keshlangan; Caddy SSE ni buferlamaydi |
| 5. Bootstrap | ✅ | Xodimlar (500 ta) va audit olib tashlandi → alohida endpointlar; ETag/304 |
| 6. Bundle | ✅ | Namuna JSON alohida chunk, Excel yagona yuklovchi orqali; JS 2.5 MB → 2.2 MB |
| 11. Takrorlar | ✅ | `lib/shared/*`: `readJson` (o'zbekcha xato), turlar, ID, statuslar |
| 12. O'lik kod | ✅ | 235 ta CSS qoida, 4 ta marshrut, SSO havolasi, 6 ta legacy jadval (0038) |
| 16. Monitoring | ✅ qisman | `/api/health`, kunlik `VACUUM INTO` zaxira (14 kun), `PRAGMA optimize`; Sentry hali yo'q |
| 15. Tartiblash | ✅ | Ma'lumotlar markazi `created_at DESC, id DESC` |
| 7. Policy qatlami | ✅ | `lib/policy/{tasks,meetings,admin,reports,information,research,chat}.ts`; marshrutlar faqat `authorize(...)` chaqiradi; har modul uchun jadvalli testlar |
| 8. Service qatlami | ✅ | `services/*`: web va Telegram bir xil funksiyalarni chaqiradi (Y4 qoidasi endi bitta joyda) |
| 9. Katta fayllar | ✅ | `research/route.ts` 1356→37, `reports-page.tsx` 1693→133, `dashboard.tsx` 1649→598, `lib/telegram.ts` 870→24 (+ `lib/telegram-bot/*`); navigatsiya o'zbekcha yorliq o'rniga `NavKey` |
| 10. Turlar | ✅ qisman | Refaktor qilingan modullarda Row turlari va mapper'lar; qolgan so'rovlar Postgres bosqichida |
| 13. Seed ajratish | ➖ qaror | Katalog seed'lari (0011, 0014, 0017…) ma'lumotnoma sifatida migratsiyada qoldirildi: toza bazada bir marta ishlaydi, testlar ularga tayanadi. Asosiy xavf (shaxsiy ma'lumot) K1 da hal qilingan |
| 14. So'rov chegaralari | ✅ | `readJsonBody` (2 MB, 413), fayllar oqim bilan va `Content-Length` bilan cheklangan; tadqiqot paneli sahifalangan |
| 17. Masshtab | ➖ qaror | Hozircha SQLite (bir necha yuz faol foydalanuvchi); Postgres `MIGRATSIYA_REJASI.md` bo'yicha yuklama oshganda |
| Xavfsizlik (past) | ✅ | Parol almashtirish limiti, 8 soat harakatsizlik taymauti, PBKDF2 600k + avtomatik qayta xeshlash, rol auditi farqi, login vaqtini tenglashtirish |

Tekshiruv (P0+P1 dan keyin): 185/185 test, `tsc`, `eslint`, `next build` toza; Docker + Caddy stekida health, login, CSP, ETag 304, SSE (xabar 0.02 s da yetib keldi) va kunlik zaxira jonli tekshirildi.

---

## Hozirgi o'lchovlar

| Ko'rsatkich | Qiymat | Izoh |
|---|---|---|
| Frontend JS (`.next/static/chunks`) | **2.5 MB** | Eng katta chunk 884 KB (Excel kutubxonasi, talab bo'yicha yuklanadi) |
| Eng katta fayllar | `dashboard.tsx` 1693, `reports-page.tsx` 1692, `information-center.tsx` 1636, `research/route.ts` 1354 qator | "God-file"lar |
| `"use client"` komponentlar | 20 ta fayl | Deyarli butun UI client tomonda ishlaydi |
| Qo'lda yozilgan SQL | ~540 ta `prepare()` | Turlari tekshirilmaydi |
| `datetime(col)` filtrlari | 45 ta | Indeksdan foydalana olmaydi |
| Chat polling | xabarlar 6 s, kanallar 15 s | Har bir ochiq chat oynasi daqiqasiga ~14 ta so'rov yuboradi |
| Bootstrap | topshiriq, yig'ilish, 500 tagacha xodim, audit, Telegram holati | Bitta og'ir so'rov |

---

## P0 — Birinchi navbatda (tezlikka katta ta'sir, xavfi kam)

### 1. SQL filtrlarini indeksga mos qilish
- **Muammo:** `datetime(expires_at) > datetime('now')` kabi filtrlarda SQLite indeksdan foydalana olmaydi. Masalan, `lib/auth.ts` sessiyani tekshirishda **har bir so'rovda** `app_sessions` jadvalini to'liq skanerlaydi.
- **Tuzatish:** sanalarni bitta formatda (ISO UTC) saqlash va solishtirishni `expires_at > ?` ko'rinishiga keltirish. Hozirgi vaqt JS da `new Date().toISOString()` bilan hisoblanadi. 45 ta joy bor. Ikki xil sana formatini bittaga keltiradigan migratsiya kerak (`CURRENT_TIMESTAMP` → ISO).
- **Samara:** har bir API so'rovi tezlashadi, jadvallar kattalashgan sari farq sezilarli bo'ladi.
- **Hajm:** 1–2 kun.

### 2. Yetishmayotgan indekslar
Bitta migratsiya bilan qo'shiladi:

| Indeks | Nima uchun kerak |
|---|---|
| `app_audit_logs(actor_employee_id, created_at)` | AI limiti va audit filtri har so'rovda shu ustunlardan foydalanadi |
| `app_task_assignments(parent_assignment_id)` | Yo'naltirish daraxti uchun |
| `app_information_records(organization_id)` | Ma'lumotlar markazi ro'yxati uchun |
| `app_employees(lower(email))` (ifoda indeksi) | Email bo'yicha qidirish uchun |
| `app_position_occupancies(staff_position_id) WHERE ends_at IS NULL` (qisman, unique) | "Bitta faol lavozim" qoidasi hozir ishlamaydi (NULL'lar teng hisoblanmaydi) |

- **Qanday tekshiriladi:** har bir og'ir so'rov uchun `EXPLAIN QUERY PLAN` natijasida `SCAN` o'rniga `SEARCH ... USING INDEX` chiqishi kerak.
- **Hajm:** 0.5 kun.

### 3. SQLite sozlamalari
- `PRAGMA cache_size=-65536` (64 MB kesh), `PRAGMA temp_store=MEMORY`, `PRAGMA mmap_size=268435456` ni `db/sqlite-d1.ts` ga qo'shish.
- Kuniga bir marta `PRAGMA optimize`. Scheduler ichida chaqirilsa bo'ladi.
- Prepared statement keshi: hozir har `.bind()` da `database.prepare(sql)` qayta kompilyatsiya qilinadi. SQL matni bo'yicha `Map` kesh qo'yish kerak.
- **Samara:** so'rovlar 20–40% tezlashadi (taxminan).
- **Hajm:** 0.5 kun.

### 4. Chat polling ni kamaytirish
- **Muammo:** `app/chat-page.tsx:267` har 6 soniyada so'rov yuboradi. Har bir so'rovda `ensureDefaultChatChannels` (`app/api/chat/route.ts:26`) va har kanal uchun ~5 ta ichki so'rov bajariladi.
- **Tuzatish (bosqichma-bosqich):**
  1. `ensureDefaultChatChannels` ni har so'rovda emas, xodim yaratilganda yoki bo'limi o'zgarganda chaqirish.
  2. Kanal ro'yxatidagi N+1 so'rovni bitta `GROUP BY` so'rovga birlashtirish.
  3. `since=<oxirgi xabar id>` parametri bilan faqat yangi xabarlarni qaytarish. Yangi xabar bo'lmasa, javob `204` bo'ladi.
  4. Keyinchalik polling o'rniga **SSE** (`text/event-stream`). Bitta Node jarayonida buni xotiradagi `EventEmitter` bilan qilish oson.
- **Samara:** chat yuklamasi 10–50 barobar kamayadi.
- **Hajm:** 1–3 bandlar 1 kun, SSE 2 kun.

### 5. Bootstrap ni yengillashtirish
- **Muammo:** `/api/bootstrap` bitta so'rovda topshiriqlar, yig'ilishlar, 500 tagacha xodim, audit va Telegram holatini qaytaradi.
- **Tuzatish:**
  - Bootstrap faqat `actor`, hisoblagichlar (badge'lar) va birinchi sahifadagi topshiriqlarni qaytaradi.
  - Xodimlar ro'yxati kerak bo'lganda `/api/directory?q=` qidiruvi orqali olinadi. Endpoint allaqachon bor.
  - Audit faqat audit sahifasi ochilganda yuklanadi.
  - Javobga `ETag` qo'shish: 5 daqiqalik yangilashda ma'lumot o'zgarmagan bo'lsa, `304` qaytadi.
- **Samara:** birinchi ochilish va har 5 daqiqalik yangilash sezilarli yengillashadi.
- **Hajm:** 1–2 kun.

### 6. Frontend: katta JSON va kutubxonalarni ajratish
- `app/information-dashboard.tsx:32` 67 KB lik `data/information-source-samples.json` ni statik import qiladi, shuning uchun u asosiy bundle ga tushadi. Uni `import()` bilan faqat kerak bo'lganda yuklash kerak.
- `data/information-center-catalog-v2.json` (105 KB) ham client bundle ga tushmasligi kerak. Tekshirib, serverdan olish.
- `xlsx-js-style` (884 KB) allaqachon `import()` orqali yuklanadi, bu to'g'ri. Uni bitta `lib/excel-client.ts` modulga yig'ish kerak: hozir 9 joyda alohida import qilinadi.
- `lucide-react`: ikonalar bittalab import qilinganini tekshirish kerak (tree-shaking ishlashi uchun).
- **Qanday tekshiriladi:** `ANALYZE=true` bilan `@next/bundle-analyzer`. Maqsad: birinchi yuklanishdagi JS < 300 KB (gzip).
- **Hajm:** 1 kun.

---

## P1 — Kod sifatini tuzatish (keyingi o'zgarishlarni xavfsiz qiladi)

### 7. Yagona vakolat (policy) qatlami
- **Muammo:** huquq tekshiruvi har bir marshrutda qo'lda yozilgan. Auditdagi K2 va Y3 xatolari shundan chiqdi: bir joyda cheklov bor, boshqasida unutilgan.
- **Tuzatish:** `lib/policy.ts` yaratish:
  ```ts
  can(actor, "task.accept", task)
  can(actor, "employee.resetPassword", target)
  can(actor, "chat.post", channel)
  ```
  Marshrutlar faqat `authorize(actor, action, resource)` ni chaqiradi. Har bir amal uchun jadval ko'rinishidagi test yoziladi.
- **Hajm:** 4–6 kun (modul-modul).

### 8. Service qatlami
- **Muammo:** biznes qoidalar marshrutlarda yashaydi. Masalan, "topshiriqni yopish" web marshrutida va Telegram tugmasida alohida yozilgan edi.
- **Tuzatish:** `services/tasks.ts` (`submit`, `accept`, `return`, `forward`), `services/reports.ts`, `services/chat.ts`. Marshrut va Telegram webhook bir xil funksiyani chaqiradi.
- **Hajm:** 5–7 kun.

### 9. God-file'larni bo'lish

| Fayl | Qanday bo'linadi |
|---|---|
| `app/dashboard.tsx` (1693) | Navigatsiya, holat (store) va sahifalarga. `activeNav.includes("Topshiriq")` ni o'zbekcha yorliq matni o'rniga route yoki enum ga o'tkazish |
| `app/reports-page.tsx` (1692) | Jadval muharriri, ro'yxat, modal oynalar va eksport |
| `app/information-center.tsx` (1636) | Katalog, yozuv formasi, fayllar va navbat |
| `app/api/research/route.ts` (1354) | `services/research/*` va kichik marshrutlar |
| `lib/telegram.ts` (908) | `telegram/api.ts`, `telegram/outbox.ts`, `telegram/commands.ts`, `telegram/webhook.ts` |

- **Hajm:** 4–5 kun.

### 10. Tur xavfsiz ma'lumotlar qatlami
- **Muammo:** ~540 ta so'rov `Record<string, unknown>` qaytaradi va natijaga `Number(row.x)` qilinadi. `schema.ts` migratsiyalardan uzoqlashgan: journal da 32 tadan faqat 5 tasi bor.
- **Tuzatish:**
  - Qisqa muddatda: har bir jadval uchun `Row` turlari va `mapTask(row)` kabi mapper'lar.
  - Uzoq muddatda: Postgres ga o'tganda Kysely yoki Drizzle query builder.
  - Hozircha foydalanilmayotgan `drizzle-orm` va `drizzle-kit` ni olib tashlash yoki sxemani qayta generatsiya qilib sinxronlash.
- **Hajm:** mapper'lar 2–3 kun.

### 11. Takrorlanuvchi kodni birlashtirish
Audit topgan takrorlar:
- hisobot qatorlarini jamlash (2 joyda);
- tahrirlanadigan statuslar ro'yxati (4 joyda);
- tasodifiy ID generatori (3 joyda);
- `Task`, `Meeting`, `Actor` turlari (3 faylda);
- JSON bo'lmagan xato javobini qayta ishlaydigan helper (4 joyda). Shu sababli foydalanuvchi "Unexpected token '<'" xabarini ko'radi.

Bularning hammasini `lib/shared/*` ga yig'ish kerak. **Hajm:** 1 kun.

### 12. O'lik kod va eskirgan jadvallar
- `globals.css` dagi `.executive-*` stillarini olib tashlash (komponent allaqachon o'chirilgan).
- `app/api/auth/sso` (VPS da kerak emas), `research/files/[id]` (doim 404) va 4 ta bir qatorli qayta-eksport marshrutni o'chirish.
- 6 ta legacy jadvalni (`departments`, `employees`, `tasks`…) migratsiya bilan o'chirish.
- **Hajm:** 0.5 kun.

---

## P2 — Barqarorlik va masshtab

### 13. Seed ma'lumotni migratsiyadan ajratish
- 0011 (850 KB) va katalog migratsiyalari sxema bilan aralashgan. Toza bazada birinchi ishga tushirish sekin, migratsiyalarni o'qish esa qiyin.
- **Tuzatish:** `drizzle/` da faqat sxema qoladi. Katalog `scripts/seed-catalog.mjs` orqali, bir marta yuklanadi.

### 14. Katta so'rovlar uchun cheklovlar
- Hisobot va Ma'lumotlar markazi JSON so'rovlariga hajm chegarasi qo'yish (masalan 2 MB). `Content-Length` tekshiriladi, keyin oqim bilan o'qiladi.
- `app/api/files/route.ts` faylni xotiraga to'liq o'qiydi. Uni oqim orqali diskka yozish kerak (`LocalBucket.put` buni allaqachon qo'llab-quvvatlaydi).
- Tadqiqot paneli (`lib/research-server.ts`) butun jadvallarni o'qiydi. Unga sahifalash va agregatsiya SQL ni qo'shish kerak.

### 15. Ro'yxatlar tartibi
- Hisobot va Ma'lumotlar markazi yozuvlarining ID lari tasodifiy 48-bit son, lekin tartiblash `ORDER BY id DESC` bilan qilinadi. Natijada "eng yangisi" aslida tasodifiy tartibda chiqadi.
- **Tuzatish:** `ORDER BY created_at DESC, id DESC` va shu ustunlarga indeks.

### 16. Kuzatuv (monitoring) va zaxira nusxa
- Sekin so'rovlarni log ga yozish: SQLite adapterida 100 ms dan uzoq ishlagan so'rov log ga tushadi.
- `/api/health` endpointi qo'shib, Docker healthcheck ni unga ulash.
- Kunlik `VACUUM INTO` zaxira nusxasini scheduler ga qo'shish, 14 kundan eskilarini avtomatik o'chirish.
- Xatolarni markaziy yig'ish (Sentry yoki o'zingizda GlitchTip).

### 17. Masshtab chegarasi (qaror kerak)
Hozirgi SQLite + bitta jarayon bir necha yuz faol foydalanuvchigacha yetadi. Undan oshsa:
- PostgreSQL (`MIGRATSIYA_REJASI.md`);
- scheduler alohida worker konteynerga ko'chiriladi (`SKIP LOCKED` bilan);
- chat SSE yoki WebSocket + Postgres `LISTEN/NOTIFY` ga o'tadi.

---

## Tavsiya etilgan tartib

| Bosqich | Bandlar | Taxminiy hajm | Natija |
|---|---|---|---|
| 1-hafta | 1, 2, 3, 4 (1–3), 6, 12 | ~5 kun | Server va brauzer yuklamasi sezilarli kamayadi |
| 2-hafta | 5, 4 (SSE), 11, 14 | ~5 kun | Bootstrap yengil, chat real vaqtda ishlaydi |
| 3–4-hafta | 7, 8 | ~10 kun | Vakolat xatolari tizimli ravishda yopiladi |
| 5-hafta | 9, 10, 13, 15, 16 | ~7 kun | Kodni saqlash oson, kuzatuv bor |
| Keyin | 17 | qarorga bog'liq | Katta masshtab |

## O'lchash (har bosqichdan oldin va keyin)
- **Backend:** har bir asosiy endpoint uchun p50/p95 javob vaqti. Oddiy skript bilan 50 ta parallel foydalanuvchi simulyatsiya qilinadi.
- **Frontend:** Lighthouse (LCP, TBT) va birinchi yuklanishdagi JS hajmi.
- **Baza:** asosiy so'rovlar uchun `EXPLAIN QUERY PLAN` va sekin so'rovlar logi.
- **Testlar:** har bir refaktordan keyin 148 ta mavjud test yashil bo'lishi shart. Yangi policy va service qatlamlari uchun yangi testlar yoziladi.
