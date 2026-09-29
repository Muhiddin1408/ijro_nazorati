# "Ijro nazorati" — to'liq kod auditi

> **Manba:** `Ichki_hisobotlar_yakuniy_kod_2026-09-28.zip` (~70 ming qator: 12.5k server TS, 15k React TSX, 11.8k SQL, 20 ta test fayli).
> **Usul:** kod modullar bo'yicha qatorma-qator o'qildi (auth va admin, topshiriq/yig'ilish/chat/fayllar, hisobotlar va Ma'lumotlar markazi, Telegram va fon ishlari, frontend, sxema/migratsiya/testlar/infratuzilma). Eng muhim topilmalar kodda qayta tekshirilib tasdiqlandi.
> **Sana:** 2026-09-28.
> **Eslatma:** "tekshirish kerak" belgisi — kodga qarab xavf aniq, lekin production sozlamasi (repoda yo'q) yoki ish tartibi bilan tasdiqlash kerak.

---

## ✅ Tuzatish holati (2026-09-29)

Kritik va Yuqori darajadagi barcha bandlar tuzatildi, har biri uchun xatti-harakat testi yozildi (jami 148 test, hammasi o'tadi).

| Band | Holat | Qisqacha |
|---|---|---|
| K1 | ✅ | 0016 faqat sxema; xodimlar `private-seed/` (git'ga kirmaydi), testlar sintetik fixture bilan; egasi emaili `admin@ijro.local`. **Qoldi:** eski ZIP va git tarixini tozalash (egasi tomonidan) |
| K2 | ✅ | Faollashtirish: `xodim` bo'lmaganlar uchun `canManageRoles`; owner-SSO chiqarib tashlangan |
| K3 | ✅ | Avtomatik admin yo'q, faqat `DEV_IMPERSONATE_EMAIL` (dev), dev server `127.0.0.1` |
| Y1, Y2 | ✅ | Atomar hisoblagich, IP+login / IP / akkaunt limitlari (`0032`), qattiq bloklash yo'q |
| Y3 | ✅ | Parol tiklash va lavozim orqali imtiyoz oshirish yopildi; reissue admin/owner'ni chetlaydi, har akkaunt auditga |
| Y4 | ✅ | Ijrochi → "Ko'rib chiqilmoqda"; "Bajarildi" faqat topshiriq beruvchi (qabul/qaytarish), Telegram ham |
| Y5 | ✅ | Topshiriq/yig'ilish/audit uchun server sahifalash, "yana yuklash" |
| Y6, Y7 | ✅ | E'lonlarga yozish huquqi + limit; o'qish holati alohida jadvalda (`0034`) |
| Y8 | ✅ | Hisobot va Ma'lumotlar markazida o'zini o'zi tasdiqlash yopildi |
| Y9, Y10 | ✅ | Maxfiy maydonlar API'da yashiriladi; navbat faqat o'sha yozuvni ochadi |
| Y11 | ✅ | Ilova ichidagi har daqiqalik scheduler (`instrumentation.ts`) |
| Y12, Y14 | ✅ | Faqat ulangan xodimlarga ish, `waiting_link` TTL; Telegram/AI'ga minimal ma'lumot, AI kunlik limiti (`0035`) |
| Y13 | ✅ | Boshqa xodim uchun Telegram havolasi — `canManageRoles` + audit |
| Y15 | ⚠️ qisman | Yaratish atomar (`db.batch`); FK'lar Postgres migratsiyasiga qoldirildi |
| Y16 | ✅ | Nonce'li to'liq CSP (`proxy.ts`), HSTS |
| Y17 | ✅ | Handler darajasidagi yangi testlar (auth, topshiriq, chat/hisobot, Telegram, platforma) |

**O'rta darajadagi bandlar (2026-09-29):**

| Bo'lim | Band | Holat |
|---|---|---|
| Topshiriqlar | Davriy muddat siljishi (31-yan → 28-fev → 28-mar), UTC hisob | ✅ asl kun (`recurrence_anchor_day`) + Toshkent vaqti (0039) |
| | Muddati o'tgan topshiriqni tahrirlab bo'lmaydi | ✅ muddat faqat o'zgartirilganda tekshiriladi |
| | Arxivlangan topshiriq o'zgartiriladi | ✅ policy: 409 |
| | Isbot fayllari yopilgandan keyin o'chiriladi; R2 obyekti qatordan oldin o'chadi | ✅ 409; avval qator, keyin obyekt |
| | Fayl xotiraga to'liq o'qiladi; kvota yo'q | ✅ oqim + `Content-Length`; topshiriqqa 200 MB, xodimga kuniga 1 GB |
| | Chat multipart qismlar soni cheklanmagan | ✅ qismlar soni va jami hajm e'lon qilinganidan oshmaydi |
| | Chat polling qimmat | ✅ SSE |
| | Tahrirdan keyin auditoriya eslatmalari yo'qoladi | ✅ qayta faollashtiriladi |
| | O'tgan yig'ilish: tahrir yo'q, o'chirish bor | ✅ ikkalasi ham 409 (`canConfigure` bundan mustasno) |
| Telegram | Eskirgan eslatmalar, webhook takrori, 400 bloklash, 4096 belgi, 429, arxivlanganlar | ✅ hammasi |
| Hisobotlar / MM | Tasodifiy ID tartibi | ✅ `created_at DESC` |
| | JSON hajmi cheklanmagan | ✅ 2 MB, 413 |
| | Tadqiqot paneli butun jadvallarni o'qiydi | ✅ sahifalash |
| | Navbat va tekshiruvchi sharti farqli | ✅ bitta qoida |
| | Hisobot muddatlari qo'llanmaydi, `status` yozilmaydi | ✅ open → overdue → closed (0040) |
| | Qoralama qaytarish sababini o'chiradi | ✅ alohida `review_comment` |
| | Ingest >100 yozuvni tashlaydi, yangilamaydi | ✅ 413; yangilash (himoyalangan yozuvlar `locked`) |
| Frontend | Kirill rejimi, fon xatolari, dialoglar, a11y, god-file | ✅ `FRONTEND_TAHLILI.md` |
| Baza | "Bitta faol lavozim" qoidasi | ✅ qisman unique indeks |
| | Yetishmayotgan indekslar, `datetime()` filtrlari | ✅ 0036 + qolgan 8 tasi |
| | `schema.ts` va migratsiyalar farqi | ✅ Drizzle olib tashlandi, migratsiyalar oddiy SQL |
| | Audit jurnali append-only emas, retention yo'q | ✅ trigger + nazoratli retention (0041) |
| | CHECK cheklovlari yo'q | ✅ tekshiruv triggerlari (0041) |

Platforma: Cloudflare Workers/D1/R2 → Next.js standalone + SQLite (`node:sqlite`) + disk ombori, Docker + Caddy. Qarang: `DEPLOY.md`.

---

## Umumiy xulosa

| Daraja | Soni | Asosiy mavzular |
|---|---|---|
| 🔴 Kritik | 3 | Repoda real xodimlar shaxsiy ma'lumoti; boshqa rahbar akkauntini egallash yo'li; dev rejimda avtomatik admin |
| 🟠 Yuqori | 17 | Login bloklashini chetlab o'tish, ijrochi o'zi yopadigan topshiriqlar, hammaga ochiq e'lonlar kanali, 300 tadan keyin yo'qoladigan ro'yxatlar, cron yo'qligi, FK va CSP yo'qligi, o'zini o'zi tasdiqlash |
| 🟡 O'rta | 30+ | Telegram navbati, takrorlanuvchi topshiriq muddati siljishi, kirill rejimi xatolari, indekslar, testlar sifati |
| ⚪ Past | 25+ | O'lik kod, hujjatlar va kod mos kelmasligi, kichik UX/a11y kamchiliklar |

**SQL injection topilmadi** — barcha so'rovlar parametrlangan. **XSS topilmadi.** **Excel formula injection yo'q.** CSRF himoyasi (`assertSameOrigin`) barcha o'zgartiruvchi so'rovlarda bor. Ya'ni "klassik" zaifliklar yaxshi yopilgan. Asosiy muammolar **vakolat mantiqida** (kim nimani qila oladi), **ish jarayonida** (kim tasdiqlaydi) va **ma'lumot himoyasida**.

---

## 🔴 KRITIK

### K1. Repoda 77 nafar real xodimning shaxsiy ma'lumoti bor
**Fayl:** `drizzle/0016_central_apparatus_employees.sql`

- Markaziy apparatning 77 xodimi: F.I.Sh. (lotin + kirill), lavozim, **tug'ilgan sana (77 ta)**, **mobil telefon (72 ta, +998)**, ichki raqam (~65 ta). Manba sifatida kadrlar bo'limining Excel fayli nomi ko'rsatilgan.
- Bu fayl:
  - Git tarixida va tarqatilgan har bir ZIP'da bor (`BOSHLASH.md` "ZIP ni oching" deydi);
  - `build/sites-vite-plugin.ts` orqali **har bir build ichiga** (`dist/.openai/drizzle`) nusxalanadi;
  - har bir dasturchining lokal bazasiga va testlarga (`tests/table-edit-safety.test.mjs:54`) yuklanadi.
- Tizim egasining shaxsiy Gmail manzili migratsiyalar, testlar va README'da 80 dan ortiq joyda uchraydi.
- `SECURITY.md` himoyani faqat "repo yopiq bo'lishi"ga bog'laydi — lekin ma'lumot build va ZIP'lar orqali repodan tashqariga chiqib ketgan.

**Tuzatish:** 0016 ni faqat sxema migratsiyasiga almashtirish; xodimlar ma'lumotini alohida, git'ga kirmaydigan import orqali yuklash (bunday `*_private_*.sql` mexanizmi allaqachon bor); Git tarixidan tozalash; tarqatilgan ZIP'larni bekor qilish; testlar uchun soxta (sintetik) ma'lumot.

### K2. Hududiy administrator istalgan rahbar akkauntini egallay oladi
**Fayl:** `app/api/admin/accounts/activate-bulk/route.ts:11, 20-29` ✅ tasdiqlandi

```ts
requirePermission(actor, "canManageOrganization");
... WHERE e.active=1 AND c.employee_id IS NULL AND e.id IN (...)
```

- Marshrut faqat nishon xodim foydalanuvchining tashkiloti doirasida ekanini tekshiradi, **uning rolini tekshirmaydi**. Xodimlarni tahrirlash marshruti (`employees/route.ts:149, 257, 310`) esa aynan shu cheklovni qo'yadi — bu yerda u unutilgan.
- **Ssenariy:** `canManageOrganization` huquqi bor, lekin `canManageRoles` yo'q "hududiy administrator" hali paroli bo'lmagan `hudud_rahbari` yoki `rahbar` uchun faollashtirish havolasini oladi, uni o'zi ochadi, login/parol qo'yadi va rahbar sifatida kiradi. Agar uning ko'lami "hammasi" bo'lsa — SSO orqali kiradigan (paroli yo'q) tizim adminini ham shu yo'l bilan egallaydi.

**Tuzatish:** so'rovga `r.code='xodim' OR actorCanManageRoles` shartini qo'shish; owner-SSO bog'langan va yuqori profilga ega xodimlarni chiqarib tashlash.

### K3. Dev rejimda har bir so'rov — administrator; dev server tarmoqqa ochiq
**Fayllar:** `lib/auth.ts:88-96`, `vite.config.ts:73` ✅ tasdiqlandi

```ts
if (development) { const forwarded = requestHeaders.get("oai-authenticated-user-email")...; if (forwarded) return forwarded; }
return development ? "<egasining shaxsiy gmail>" : null;
```
```ts
host: "0.0.0.0",
```

- `NODE_ENV=development` bo'lsa, sessiyasiz so'rov avtomatik ravishda admin sifatida qabul qilinadi; header orqali istalgan xodim bo'lib kirish ham mumkin.
- Dev server barcha tarmoq interfeyslarida tinglaydi. Dasturchi bilan bir Wi-Fi/VPN'dagi har kim `http://<ip>:5173/api/bootstrap` orqali admin bo'ladi — va K1 tufayli bu bazada real shaxsiy ma'lumotlar bor.
- Docker'ga o'tishda bitta noto'g'ri `.env` production'ni to'liq ochib qo'yadi.

**Tuzatish:** avtomatik emailni olib tashlash, faqat aniq `DEV_IMPERSONATE_EMAIL` o'zgaruvchisi bilan yoqish; `host: "127.0.0.1"`; production build'da bu kod yo'qligini tekshiruvchi test.

---

## 🟠 YUQORI

### Autentifikatsiya va akkauntlar

**Y1. Parallel so'rovlar bilan login bloklashini chetlab o'tish** — `app/api/auth/login/route.ts:21, 42-49` ✅
- Bloklash parol tekshiruvidan **oldin** o'qilgan qiymat bo'yicha tekshiriladi. 5-xatoda hisoblagich 0 ga tushadi, 6-xato esa `ELSE NULL` tarmog'iga tushib **bloklashni o'chiradi**.
- 50 ta parallel so'rov yuborilsa, bloklash amalda ishlamaydi; IP bo'yicha cheklov ham yo'q → cheklanmagan parol tanlash.
- **Tuzatish:** `ELSE locked_until`; bloklashni atomar `UPDATE ... WHERE locked_until IS NULL OR locked_until<=now RETURNING` bilan tekshirish; `/api/auth/login` uchun IP bo'yicha rate limit.

**Y2. Istalgan rahbarni doimiy bloklab qo'yish mumkin (DoS)** — `login/route.ts:42-51`, `provision/route.ts:55-57`
- Loginlar `u<id>.<ism>` shaklida — katalogdan osongina taxmin qilinadi. Har 15 daqiqada 5 ta xato urinish kerakli rahbarni tizimdan butunlay chetlatadi.
- **Tuzatish:** IP + login juftligi bo'yicha cheklash, progressiv kechiktirish, qattiq bloklash o'rniga qo'shimcha tekshiruv.

**Y3. Adminlar ichida imtiyozni oshirish yo'llari** — `app/api/admin/employees/route.ts`, `accounts/provision/route.ts`
- **(a)** `canManageOrganization` foydalanuvchisi yopiq domenga ruxsati bor `xodim`ning parolini o'zgartirib, uning huquqlarini egallaydi (tekshiruv faqat rol kodiga qaraydi, profil va domen ruxsatlariga emas) — `:257, 276-278`.
- **(b)** U lavozim nomini ("Direktor", "Bosh boshqarma boshlig'i") erkin saqlay oladi. Keyinchalik tizim admini shu xodimni boshqa sababga tahrirlasa, lavozim nomidan avtomatik ravishda `territorial_leadership` (tasdiqlash huquqi) beriladi — `:196, 328, 334-344`.
- **(c)** `reissue:true` bilan **barcha** faol xodimlar, jumladan boshqa adminlar parollari qayta yaratiladi va ochiq holda qaytariladi; auditda faqat son yoziladi, kimlar ekanligi emas — `provision/route.ts:149-161, 385-388`.
- **Tuzatish:** parolni tiklash uchun `canManageRoles` talab qilish; `canManageRoles`siz foydalanuvchi o'zgartirgan lavozimni saqlamaslik; reissue'dan admin/owner'larni chiqarish va har bir akkauntni alohida auditga yozish.

### Topshiriqlar — ijro nazorati mantiqi

**Y4. Ijrochi topshiriqni o'zi "Bajarildi" qiladi; auditoriyadagi bitta xodim butun topshiriqni yopadi** — `app/api/tasks/route.ts:148-178` ✅
```ts
if (progress === 100) status = "Bajarildi";
if (!assignment && await employeeMatchesTaskAudience(...)) { INSERT OR IGNORE INTO app_task_assignments ... }
completed = Number(average?.min_progress ?? progress) === 100;
```
- Nazoratchi qabul qilish bosqichi yo'q: `progress:100` → darhol "Bajarildi", eslatmalar bekor, keyingi davriy topshiriq yaratiladi.
- Faqat tashkilotga (auditoriyaga) yuborilgan topshiriqda **birinchi bosgan xodim** yagona ijrochiga aylanadi va 100% qo'yib **butun tashkilot uchun** yopadi.
- Topshiriq bergan kishi ham o'z bo'limi auditoriyada bo'lsa, shu yo'l bilan o'z topshirig'ini "qabul qilib" yopishi mumkin (57-qatordagi taqiqni chetlab o'tadi).
- Ijrochi istalgan statusni (masalan "Kechikkan", "Davomiy") butun topshiriq uchun qo'ya oladi.
- Telegram "Bajarildi" tugmasi (`lib/telegram.ts:703-714`) ham xuddi shunday, va arxivlangan/yopilgan topshiriqni tekshirmaydi.
- **Tuzatish:** ijrochi faqat "Ko'rib chiqilmoqda"gacha o'tkazadi; "Bajarildi"ni faqat topshiriq beruvchi yoki `canUpdateAnyTask` qo'yadi; auditoriya topshirig'ida bajarilish kutilgan auditoriyaga nisbatan hisoblanadi.

**Y5. Ro'yxatlar 300 tadan keyin jimgina kesiladi — yangi topshiriqlar ko'rinmay qoladi** — `lib/data.ts:170-173, 338` ✅
- Topshiriqlar muddat bo'yicha **eng eskisidan** tartiblanadi va bajarilganlari chiqarib tashlanmaydi. ~300 ta topshiriqdan keyin eski yopilganlar barcha o'rinlarni egallaydi — **yangi va muddatsiz topshiriqlar ko'rinmaydi**.
- Yig'ilishlar sana chegarasiz, `ORDER BY starts_at LIMIT 300` — 300 ta o'tgan yig'ilishdan keyin kelgusi yig'ilishlar chiqmaydi.
- Xodimlar 500 ta (bootstrap), admin sahifasida 250 ta, audit jurnali **60 ta** bilan cheklangan (`bootstrap/route.ts:69, 83`); Excel eksporti ham shu 60 tani chiqaradi. Hech qayerda "ro'yxat to'liq emas" degan belgi yo'q.
- **Tuzatish:** server tomonda sahifalash; faol va bajarilganlarni ajratish; audit uchun alohida endpoint va filtrlar.

### Chat

**Y6. "Umumiy e'lonlar"ga istalgan xodim yozadi va hammaga Telegram xabar ketadi** — `lib/chat.ts:10`, `app/api/chat/route.ts:156-192` ✅
- `broadcast` kanaliga yozish uchun hech qanday huquq tekshirilmaydi; har xabar Telegram'ga ulangan **barcha** xodimlarga yuboriladi; rate limit yo'q.
- Oddiy xodim yoki buzilgan akkaunt butun tashkilotga soxta "rasmiy e'lon" yoki spam tarqatadi.
- **Tuzatish:** `canBroadcast` huquqi; foydalanuvchi bo'yicha yuborish limiti.

**Y7. Bo'limdan ketgan xodim eski bo'lim chatiga kirishda davom etadi** — `app/api/chat/route.ts:162-166` ✅
- "O'qildi" belgisi `app_chat_members`ga doimiy a'zolik qatorini yozadi, `canAccessChatChannel` esa shu qatorni kirish huquqi deb hisoblaydi.
- Xodim boshqa bo'limga o'tkazilgandan keyin ham eski bo'lim xabarlari, fayllari va Telegram bildirishnomalarini oladi.
- **Tuzatish:** o'qish holatini alohida jadvalda saqlash; bo'lim kanallari uchun faqat `department_id` bo'yicha tekshirish.

### Hisobotlar va Ma'lumotlar markazi

**Y8. O'zini o'zi tasdiqlash** ✅
- **Hisobotlar:** `lib/mutation-authority.ts:18-28` — tekshiruvchi va topshiruvchi bir odam bo'lishi mumkin. Shablon yaratgan rahbar o'zini mas'ul qilib, hisobotni o'zi topshirib, o'zi tasdiqlaydi.
- **Ma'lumotlar markazi:** `lib/information-workflow.ts:397-398` — `if (actor.roleCode === "admin") return true;` o'z-o'zini tasdiqlash tekshiruvidan **oldin** turadi. Admin yozuvni yaratib, barcha bosqichlarni yolg'iz tasdiqlaydi.
- Ilmiy tadqiqotlar modulida bu to'g'ri qilingan — hisobotlar undan orqada qolgan.
- **Tuzatish:** tartibni almashtirish; hisobotlarda `responsible_employee_id` va `submitted_by_employee_id` bilan solishtirish.

**Y9. "Maxfiy maydon" belgisi amalda hech narsani himoya qilmaydi** — `app/api/information/route.ts:108, 334`, `information/files/route.ts:64-66`
- `sensitive` bayrog'i faqat qidiruv va AI'dan chiqaradi. Yozuv tafsilotlari va ro'yxati barcha qiymatlarni ochiq qaytaradi, maxfiy maydondagi fayllar yozuvni ko'ra oladigan har kimga yuklanadi, `q` filtri esa maxfiy qiymatlar bo'yicha ham `LIKE` qidiradi.
- UI'da "🔒 Himoyalangan maydon" belgisi ko'rsatiladi — foydalanuvchi himoya bor deb o'ylaydi.
- **Tuzatish:** `canViewRestrictedInformation`siz javobdan maxfiy maydonlar va fayllarni olib tashlash.

**Y10. Tasdiqlash navbatidagi bitta yozuv butun domenga kirish beradi** (tekshirish kerak) — `lib/information.ts:273-331`
- Kutilayotgan tasdiqlash bosqichi bo'lsa, tekshiruvchiga butun domen (jumladan yopiq shablonlar va boshqalarning qoralamalari) ochiladi — faqat shu yozuv emas.
- **Tuzatish:** ruxsatni domen bo'yicha emas, yozuv bo'yicha berish.

### Telegram va fon ishlari

**Y11. Cron sozlanmagan — eslatmalar kechikadi yoki umuman ketmaydi** (tekshirish kerak) ✅
- `worker/index.ts:84` da `scheduled()` bor, lekin repoda hech qayerda `triggers.crons` yo'q; README ham buni aytmaydi.
- Navbat faqat admin sahifani ochganda, webhook kelganda yoki web harakatlarda ishlaydi. Tungi soat 02:00 ga belgilangan "15 daqiqa qoldi" eslatmasi admin ertalab kirgandagina ketadi.
- **Tuzatish:** `"triggers": {"crons": ["* * * * *"]}` yoki tashqi scheduler; production sozlamasini tekshirish.

**Y12. Telegram ulanmagan xodimlar uchun ishlar navbatni to'ldirib yuboradi** — `lib/telegram.ts:223-234, 479-481` ✅
- Auditoriya bildirishnomalari Telegram ulanganmi-yo'qmi, **har bir** xodim uchun yaratiladi (bir topshiriqqa 6 tagacha). Ulanmaganlar `waiting_link` holatida har soatda qaytadi, **hech qachon muddati tugamaydi**.
- 3000 kishilik tashkilotga bitta topshiriq → ~15 000 ta "abadiy" ish; ular har doim yangi eslatmalardan oldin navbatga turadi. Xodim keyinroq ulansa, barcha eski "3 kun qoldi" xabarlarini birdaniga oladi.
- **Tuzatish:** faqat ulangan va yoqilgan xodimlar uchun yaratish; `waiting_link` uchun TTL.

**Y13. Admin o'z Telegramini boshqa xodim nomiga ulay oladi** — `app/api/telegram/link/route.ts:11` ✅
- `canManageOrganization` egasi boshqa xodim uchun havola yaratib, **o'zi** ochadi → o'sha xodimning barcha bildirishnomalari va topshiriqlari unga keladi, "Bajarildi" tugmasini uning nomidan bosadi. Audit jabrlanuvchi nomiga yoziladi.
- **Tuzatish:** xodim o'z sessiyasida tasdiqlashi; ulanish haqida xodimni xabardor qilish; auditga havolani kim yaratganini yozish.

**Y14. Maxfiy mazmun Telegram serverlariga ochiq matnda ketadi** — `lib/telegram.ts:121-123, 174-175, 324, 656`
- Shaxsiy chat xabarlari (1200 belgigacha), fayl nomlari, topshiriq sarlavhalari, yig'ilish joylari. Bot chatlari end-to-end shifrlanmagan.
- Shunga o'xshab, Ma'lumotlar markazi AI qidiruvida `sensitive` belgilanmagan **har bir** matn maydoni (standart holat) va yozuv sarlavhalari OpenAI'ga yuboriladi (`lib/information-ai.ts:3-26`); umumiy kunlik byudjet cheklovi ham yo'q.
- **Tuzatish:** Telegram'ga faqat "Yangi xabar: #kanal" + havola; AI'ga yuborishni maydon/shablon bo'yicha opt-in qilish.

### Ma'lumotlar bazasi va infratuzilma

**Y15. Asosiy jadvallarda birorta ham foreign key yo'q**
- Butun bazada atigi 22 ta FK bor (deyarli hammasi tadqiqot modulida). `app_tasks`, topshiriq biriktirishlari, yig'ilishlar, fayllar, sessiyalar, hisobotlar, Ma'lumotlar markazi, `app_employees` (`role_id`, `department_id`, `manager_id`) — FK'siz.
- Topshiriq yaratishdagi xato bo'lsa "orqaga qaytarish" alohida batch bilan va `.catch(() => undefined)` bilan qilinadi (`tasks/route.ts:103-111`) — xato jimgina yetim yozuvlar qoldiradi.
- **Tuzatish:** FK'lar va `ON DELETE` qoidalari; yaratish + bog'liq yozuvlarni bitta `db.batch` qilish.

**Y16. Content-Security-Policy amalda yo'q, HSTS yo'q** — `worker/index.ts:42` ✅
- Faqat `base-uri 'self'; object-src 'none'; frame-ancestors 'none'`. `default-src`, `script-src`, `connect-src` yo'q — kelajakda XSS paydo bo'lsa, hech narsa to'xtatmaydi.
- **Tuzatish:** nonce bilan to'liq CSP va `Strict-Transport-Security`.

**Y17. Testlar xavfsizlikning eng muhim joylarini sinamaydi**
- ~600 ta tekshiruv **xatti-harakatni emas, manba matnini** tekshiradi (`assert.match(source, /requirePermission\(actor, "canManageRoles"\)/)` kabi). `dashboard-modular-wiring` va `erp-regression` testlari to'liq shunday.
- Umuman xatti-harakat testi yo'q: login/bloklash, Telegram webhook, fayllarni yuklash/o'chirish huquqi, admin marshrutlaridagi vakolat, `/api/reminders/process`.
- Yuqoridagi K2, Y1, Y4, Y6, Y8 xatolarining hech biri testlar bilan ushlanmagan — bu shuning oqibati.
- **Tuzatish:** matn tekshiruvlarini handler darajasidagi testlarga almashtirish (`table-edit-safety.test.mjs`da tayyor harness bor).

---

## 🟡 O'RTA

### Topshiriqlar va yig'ilishlar
- **Davriy topshiriq muddati siljiydi** — `lib/recurrence.ts:5-13`: 31-yanvar → 28-fevral → 28-mart → 28-aprel… oy oxiri yo'qoladi. Hisob UTC'da, Toshkent vaqtida emas (tekshirish kerak).
- **Muddati o'tgan topshiriqni tahrirlab bo'lmaydi** — `tasks/route.ts:217-223`: sarlavhani o'zgartirish ham "muddat kelajakda bo'lsin" xatosini beradi.
- **Arxivlangan topshiriqlar o'zgartirilaveradi** — `lib/auth.ts:388-457`: `canAccessTask` `archived=0` ni tekshirmaydi.
- **Isbot fayllarini topshiriq yopilgandan keyin ham butunlay o'chirish mumkin** — `app/api/files/route.ts:86-88`; R2 obyekti bazadagi qatordan oldin o'chiriladi.
- **Fayl hajmi butun fayl xotiraga o'qilgandan keyin tekshiriladi** — `files/route.ts:40, 46`; topshiriq fayllari uchun kvota yo'q.
- **Chat multipart yuklashda qismlar soni cheklanmagan** — `chat/files/route.ts:188-195`: 13 MB e'lon qilib, ~160 GB yuklash mumkin (24 soatgacha R2'da turadi).
- **Chat polling qimmat** — har 6 soniyada so'rov + har safar `ensureDefaultChatChannels`; kanal ro'yxatida har kanal uchun 5 ta ichki so'rov.
- Yig'ilish tahrirlanganda auditoriya eslatmalari yo'qoladi (`meetings/route.ts:154-165` + `ON CONFLICT DO NOTHING`); topshiriq tahririda ham auditoriya eslatmalari qayta yaratilmaydi (`tasks/route.ts:245-257`).
- O'tgan yig'ilishni tahrirlab bo'lmaydi, lekin butunlay o'chirish mumkin.

### Telegram
- **Kechikkan eslatmalar ma'nosiz yuboriladi** — sokin soatlar tugagach 07:00 da "Muddatgacha 15 daqiqa" (muddat 02:00 da o'tib ketgan), va uchala eslatma birdaniga.
- **Webhook qayta urinishda buyruqni ikki marta bajaradi** — `lib/telegram.ts:573-579`: navbatni tozalash `try` ichida; xato bo'lsa update `failed` bo'ladi va Telegram qayta yuboradi.
- **Har qanday HTTP 400 xodimning Telegramini butunlay bloklaydi** — `:60, 509-512` (faqat 403 da bloklash kerak).
- `/yigilishlar` javobi Telegram'ning 4096 belgilik chegarasidan oshishi mumkin → javob kelmaydi.
- 429 (rate limit)da butun partiya to'xtamaydi.
- `/vazifalar` va `/kechikkan` arxivlangan topshiriqlarni ham ko'rsatadi.

### Hisobotlar va Ma'lumotlar markazi
- **Yozuvlar tasodifiy tartibda chiqadi** — ID'lar tasodifiy 48-bit, lekin `ORDER BY r.id DESC` "eng yangisi" deb ishlatiladi. Yangi saqlangan yozuv 7-sahifaga tushib qolishi mumkin.
- **Hisobot so'rovlarida JSON hajmi cheklanmagan** — `reports/route.ts:95, 174`: o'nlab MB'li so'rov Worker xotirasini (128 MB) to'ldiradi.
- **Tadqiqot paneli butun jadvallarni o'qiydi** va voqealar tarixi global `LIMIT 1000` bilan kesiladi — `lib/research-server.ts:388-438`.
- Navbat va tekshiruvchi huquqi turli SQL shartlari bilan hisoblanadi — biri ko'rsatadi, ikkinchisi 403 beradi (`information.ts:310-314` vs `information-workflow.ts:230-239`).
- Hisobot muddatlari hech qachon qo'llanmaydi; `app_report_cycles.status` ustuniga hech kim yozmaydi.
- Qoralamani saqlash tekshiruvchining qaytarish sababini o'chirib yuboradi (`reports/route.ts:201, 208`).
- Ingest 100 dan ortiq yozuvni jimgina tashlab yuboradi; mavjud yozuvni yangilamaydi.

### Frontend
- **Kirill rejimi identifikatorlarni buzadi** — loginlar (`@a.karimov` → `@а.каримов`) va Telegram ulash kodi (`/start aB3x…` → `/старт аБ3х…`) kirillga o'giriladi (`admin-modals.tsx:857`, `admin-pages.tsx:625, 690`). Admin xodimga noto'g'ri kod beradi.
- **Bitta fon yangilash xatosi kirill rejimini o'chiradi va sessiya tugaganini yashiradi** — `dashboard.tsx:593-634`: foydalanuvchi eskirgan ma'lumot bilan ishlashda davom etadi, har harakat xato beradi, login sahifasiga qaytish yo'li yo'q.
- Dialoglar va `confirm()` matnlari kirillga o'girilmaydi — interfeys aralash.
- JSON bo'lmagan xato javoblarida foydalanuvchi "Unexpected token '<'" ko'radi (helper 4 joyda takrorlangan).
- Bildirishnoma qo'ng'irog'idagi nuqta doim yonib turadi (`dashboard.tsx:1013`).
- Modal oynalarda fokus boshqaruvi yo'q (a11y); toast'lar ekran o'quvchiga e'lon qilinmaydi, taymerlar bir-birini bosib ketadi.
- `dashboard.tsx` — "god file": navigatsiya holati o'zbekcha yorliq matni bilan bog'langan (`activeNav.includes("Topshiriq")`) — yorliq o'zgarsa mantiq buziladi.

### Ma'lumotlar bazasi
- **"Bitta faol lavozim" qoidasi ishlamaydi** — `(staff_position_id, employee_id, ends_at)` unique indeksi `ends_at IS NULL` bo'lganda ishlamaydi (SQLite'da NULL'lar teng emas). Partial index kerak.
- **Yetishmayotgan indekslar:** `app_audit_logs.actor_employee_id` (AI limiti har so'rovda ishlatadi), `app_notification_jobs(entity_type, entity_id)`, `app_task_assignments.parent_assignment_id`, `app_information_records.organization_id`, `lower(email)`.
- `datetime(col) <= datetime('now')` shaklidagi filtrlar indeksdan foydalana olmaydi — har login'da sessiyalar jadvali to'liq skanerlanadi.
- **`schema.ts` va SQL migratsiyalar bir-biridan uzoqlashgan:** journal'da 32 migratsiyadan faqat 5 tasi bor; CHECK'lar, FK'lar va FTS jadvali `schema.ts`da yo'q. `npm run db:generate` ularni **o'chiradigan** migratsiya yaratadi. Drizzle ORM runtime'da umuman ishlatilmaydi.
- Audit jurnali append-only emas (UPDATE/DELETE'ni to'suvchi trigger yo'q); jadvallar uchun saqlash muddati (retention) yo'q.
- Status, progress, priority ustunlarida CHECK cheklovlari yo'q (tadqiqot modulidan tashqari).

---

## ⚪ PAST

**Xavfsizlik:**
- Login javob vaqti mavjud loginlarni oshkor qiladi (mavjud bo'lmasa — darhol, mavjud bo'lsa — PBKDF2 dan keyin).
- Joriy parol tekshiruvida urinishlar soni cheklanmagan (`change-password/route.ts:37-56`).
- Sessiyalarda harakatsizlik taymauti yo'q (`last_seen_at` yoziladi, lekin tekshirilmaydi); "eslab qolish" 30 kun.
- `GET /api/auth/sso` istalgan saytdan chaqirilib, foydalanuvchini tizimdan chiqaradi; sessiya qatori bazada qoladi.
- Rol huquqlari o'zgarishi auditga yozilmaydi (`roles/route.ts:54, 85`).
- Xodim o'zini o'ziga rahbar qilib qo'yishi mumkin (`employees/route.ts:144`) → rekursiv so'rovlar cheksiz aylanadi.
- Chat qidiruvi har bir xodimga butun tizimdagi barcha xodimlar ro'yxatini ko'rsatadi (`lib/directory.ts:16`) — ataylabmi, tekshirish kerak.
- Chat fayllari brauzer keshida 1 soat qoladi (ruxsat olib qo'yilgandan keyin ham).
- Owner-SSO headerlari Worker'da tozalanmaydi — agar Worker'ga to'g'ridan-to'g'ri kirish mumkin bo'lsa, xavfli (tekshirish kerak).
- PBKDF2 100 000 iteratsiya (Workers platforma chegarasi; OWASP ~600 000 tavsiya qiladi).

**O'lik kod va gigiyena:**
- `app/executive-reports.tsx` (790 qator, "DEMO", soxta raqamlar) — hech qayerda import qilinmaydi, CSS'i esa yuklanadi.
- `app/chatgpt-auth.ts`, `examples/d1/` (buzilgan import bilan), `app/api/research/files/[id]` (doim 404), 4 ta bir qatorli qayta-eksport marshrutlar (bir handler uchun bir necha URL → vakolat yuzasi ikki barobar).
- `/_vinext/image` handleri mavjud bo'lmagan `IMAGES` binding'ini chaqiradi.
- 6 ta legacy jadval (`departments`, `employees`, `tasks`…) — kodda ishlatilmaydi.
- Production metadata'da `codex-preview: development`.
- Kod takrorlanishi: hisobot qatorlarini jamlash 2 marta, tahrirlanadigan statuslar ro'yxati 4 marta, tasodifiy ID generator 3 marta, `Task`/`Meeting`/`Actor` turlari 3 faylda.
- Hosting project ID, production URL va egasining GitHub nomi repoda.

**Hujjatlar va kod mos kelmaydi:**
- `REVIEW.md`: "Kritik xavfsizlik muammosi topilmadi" — K1–K3 buni rad etadi.
- `REVIEW.md`: "route → Drizzle → D1" — Drizzle ishlatilmaydi.
- `REVIEW.md`: CSRF "worker headerlari" orqali — aslida `assertSameOrigin` orqali.
- `KNOWN_LIMITATIONS.md`: `dashboard.tsx` ~380 KB — hozir 64 KB (eskirgan).

**Build:**
- `vinext 0.0.50` — 1.0 gacha bo'lgan eksperimental freymvork; `next` va `drizzle-orm` runtime bog'liqlik sifatida o'rnatilgan, lekin deyarli ishlatilmaydi.
- `npm test` har safar to'liq build qiladi — unit testlarni alohida ishga tushirib bo'lmaydi.
- `engines: >=22.15` — testlar aslida Node ≥22.18 talab qiladi.

---

## ✅ Yaxshi qilingan narsalar

Adolatli baho uchun — kodda juda yaxshi yechimlar ko'p:

- **SQL injection yo'q:** barcha so'rovlar parametrlangan, dinamik `IN (...)` ro'yxatlari bo'laklarga bo'lingan.
- **Parol va tokenlar:** PBKDF2 + tasodifiy salt, doimiy vaqtli solishtirish; sessiya, faollashtirish va Telegram tokenlari 256-bit va faqat SHA-256 xesh ko'rinishida saqlanadi; bir martalik va muddatli.
- **Oxirgi admin himoyasi** baza triggerlari bilan — poyga holatini yopadi.
- **Optimistik qulf** (hisobotlar, Ma'lumotlar markazi, tadqiqotlar) — puxta, `mutation_key` bilan.
- **Telegram outbox:** idempotentlik kaliti, atomar olish, 10 daqiqalik ijara, eksponensial qayta urinish; webhook siri doimiy vaqtda tekshiriladi; `parse_mode` yo'q → injection yo'q.
- **Fayllarni berish:** HTML/SVG/JS `octet-stream` sifatida, `nosniff`, fayl nomlari tozalanadi, Range to'g'ri ishlaydi.
- **AI integratsiyasi:** qat'iy JSON sxema, `store:false`, foydalanuvchi kvotasi atomar, 15 s taymaut.
- **Tadqiqot moduli** — boshqa modullar uchun namuna: CHECK, FK, ON DELETE, vazifalarni ajratish (o'zini tekshira olmaydi).
- **Frontend:** so'rovlar poygasi AbortController bilan hal qilingan; hisobot jadvali faqat ko'rinadigan qatorlarni chizadi; polling yashirin tabda to'xtaydi.
- TypeScript `strict`, `any` deyarli yo'q, bog'liqliklar aniq versiyada, CI'da `npm audit`.

---

## Tuzatish tartibi (tavsiya)

| # | Nima | Taxminiy hajm* |
|---|---|---|
| 1 | **K1:** 0016 dan shaxsiy ma'lumotni olib tashlash, git tarixini tozalash, ZIP'larni bekor qilish | 1 kun |
| 2 | **K3:** dev-bypass'ni olib tashlash, `127.0.0.1` | 0.5 kun |
| 3 | **K2, Y3:** faollashtirish va parol tiklashda rol/profil tekshiruvi; reissue auditi | 1–2 kun |
| 4 | **Y1, Y2:** atomar bloklash, IP rate limit | 1 kun |
| 5 | **Y6, Y7, Y8, Y13:** e'lonlar huquqi, chat a'zoligi, o'z-o'zini tasdiqlash, Telegram ulash | 2–3 kun |
| 6 | **Y11, Y12:** cron, `waiting_link` TTL, eskirgan eslatmalarni bekor qilish | 1–2 kun |
| 7 | **Y4:** "Bajarildi → nazoratchi qabul qiladi" jarayoni (Telegram bilan birga) | 3–5 kun |
| 8 | **Y5:** server tomonda sahifalash (topshiriq, yig'ilish, xodim, audit) | 4–6 kun |
| 9 | **Y9, Y14:** maxfiy maydonlarni API'da yashirish; Telegram/AI'ga yuboriladigan ma'lumotni kamaytirish | 2–3 kun |
| 10 | **Y17:** yuqoridagi har bir tuzatish uchun handler darajasidagi test | tuzatishlar bilan parallel |
| 11 | **Y15, Y16** va O'rta darajadagilar | Postgres migratsiyasi bilan birga qilish qulay |

\* 1 tajribali dasturchi + Claude Code uchun taxminiy baho. 1–6 bandlar (~1.5–2 hafta) **Postgres migratsiyasidan oldin** qilinishi kerak — ular kichik va migratsiyaga bog'liq emas.

---

*Huquqiy masalalar (shaxsiy ma'lumotlar) bo'yicha fikrlar yuridik maslahat emas — yurist bilan tasdiqlash tavsiya etiladi.*
