# Xavfsizlik tuzatishlari hisoboti

> **Sana:** 2026-09-29
> **Asos:** `ijro-nazorati-kod-auditi.md` (2026-09-28)
> **Qamrov:** Kritik (K1–K3) va Yuqori (Y1–Y17) darajadagi barcha bandlar. O'rta va past darajadagilar deploydan keyinga qoldirildi.
> **Tekshiruv:** 148 ta avtomatik test (0 ta yiqilgan), TypeScript, lint va Next.js build xatosiz. Docker + Caddy stekida `localhost` da smoke test o'tkazildi.

## Qisqa javob: hammasi qilindimi?

**Yo'q.** Holat bunday:

| Daraja | Jami | Tuzatildi | Qisman | Ochiq |
|---|---|---|---|---|
| 🔴 Kritik | 3 | 3 | — | K1 ning tashqi qismi (git tarixi va eski ZIP'lar) |
| 🟠 Yuqori | 17 | 16 | 1 (Y15) | — |
| 🟡 O'rta | 30+ | bir nechtasi | — | ko'pchiligi (pastdagi ro'yxat) |
| ⚪ Past | 25+ | bir nechtasi | — | ko'pchiligi (pastdagi ro'yxat) |

---

## 🔴 Kritik — tuzatildi

### K1. Repoda real xodimlarning shaxsiy ma'lumotlari
- **Muammo:** `drizzle/0016` migratsiyasida 77 xodimning F.I.Sh., tug'ilgan sanasi va mobil telefoni bor edi. Bu fayl har bir ZIP, build va dasturchi bazasiga tushardi. Egasining shaxsiy Gmail manzili kodda 80 dan ortiq joyda uchrardi.
- **Nima qilindi:**
  - `drizzle/0016` endi faqat jadval tuzilmasidan iborat.
  - Haqiqiy ro'yxat `private-seed/0016_private_central_apparatus_employees.sql` ga ko'chirildi. U `.gitignore` va `.dockerignore` da, shuning uchun git'ga ham, Docker image'ga ham kirmaydi.
  - Serverga bir martalik buyruq bilan yuklanadi: `node scripts/db.mjs seed-private`.
  - Testlar uchun xuddi shu tuzilishdagi soxta ma'lumot tayyorlandi (`tests/fixtures/0016_synthetic_employees.sql`): ismlar, sanalar va telefonlar to'qima.
  - Egasining emaili `admin@ijro.local` bilan almashtirildi. Demo ro'yxatdagi haqiqiy ism ham to'qima ismga almashtirildi.
  - Regressiya testi migratsiyada shaxsiy ma'lumot yo'qligini tekshiradi.
- **⚠️ Qoldi (faqat siz qila olasiz):** GitHub dagi git tarixini tozalash (`git filter-repo`) va avval tarqatilgan ZIP'larni bekor qilish.

### K2. Hududiy admin rahbar akkauntini egallay olardi
- **Muammo:** `canManageOrganization` huquqi bor admin paroli hali yo'q rahbar yoki tizim admini uchun faollashtirish havolasini olib, uni o'zi ochib, shu akkauntga kira olardi.
- **Nima qilindi** (`app/api/admin/accounts/activate-bulk/route.ts`):
  - Havola faqat `xodim` roli uchun beriladi. Boshqa rollar uchun `canManageRoles` kerak.
  - Owner-SSO ga bog'langan akkauntlar ro'yxatdan chiqarib tashlandi.
- **Test:** `tests/auth-hardening.test.mjs`

### K3. Dev rejimda har kim administrator
- **Muammo:** `NODE_ENV=development` bo'lsa, sessiyasiz so'rov avtomatik admin hisoblanardi. `oai-authenticated-user-email` headeri orqali istalgan xodim bo'lib kirish mumkin edi. Dev server `0.0.0.0` da, ya'ni butun tarmoqqa ochiq tinglardi.
- **Nima qilindi:**
  - `lib/auth.ts`: headerlarga ishonilmaydi, avtomatik email yo'q. Faqat dev rejimda aniq berilgan `DEV_IMPERSONATE_EMAIL` ishlaydi.
  - `npm run dev` endi `127.0.0.1` da tinglaydi.
  - `proxy.ts` va Caddy `oai-*` headerlarini so'rovdan olib tashlaydi.
  - Production'da owner-SSO majburan o'chirilgan.
- **Test:** `tests/dev-identity.test.mjs`. Smoke testda soxta header bilan kelgan so'rov 401 oldi.

---

## 🟠 Yuqori

### Autentifikatsiya va akkauntlar

**Y1. Parallel so'rovlar bilan login bloklashini chetlab o'tish** — ✅
- **Muammo:** Bloklash parol tekshiruvidan oldin o'qilgan qiymat bo'yicha tekshirilardi, 6-xato esa bloklashni o'chirib yuborardi. Natijada parolni cheksiz tanlash mumkin edi.
- **Nima qilindi:**
  - Har bir urinish parol tekshirilishidan oldin bitta atomar SQL bilan hisoblanadi (`drizzle/0032_login_rate_limits.sql`).
  - 15 daqiqalik limitlar: bitta IP va login juftligiga 5 ta, bitta IP ga 100 ta, bitta akkauntga 50 ta.
  - Mijoz IP manzilini Caddy `X-Real-IP` headerida uzatadi.
- **Test:** 20 ta parallel xato so'rovdan aynan 5 tasi 401, qolganlari 423 oladi.

**Y2. Istalgan rahbarni tizimdan chetlatish (DoS)** — ✅
- **Muammo:** Loginni taxmin qilib, 5 ta xato urinish bilan rahbarni tizimga kirolmaydigan qilib qo'yish mumkin edi.
- **Nima qilindi:** Akkauntni qattiq bloklash olib tashlandi. Endi faqat hujumchining IP va login juftligi bloklanadi, egasi boshqa tarmoqdan kira oladi.

**Y3. Adminlar ichida imtiyozni oshirish** — ✅
- **(a) Muammo:** Admin huquqli xodimning parolini almashtirib, uning huquqlarini egallay olardi.
  **Nima qilindi:** Qo'shimcha huquqlari bor xodimning login yoki parolini faqat `canManageRoles` egasi o'zgartiradi. Qo'shimcha huquqlarga profil, domen ruxsatlari, shtat lavozimi va owner-SSO kiradi.
- **(b) Muammo:** Admin lavozim nomini "Direktor" deb yozsa, xodim avtomatik tasdiqlash huquqini olardi.
  **Nima qilindi:** Rahbarlik yoki tasdiqlash huquqini beradigan lavozim nomini faqat `canManageRoles` egasi saqlay oladi.
- **(c) Muammo:** `reissue` barcha adminlarning parollarini qayta yaratib, ochiq holda qaytarardi.
  **Nima qilindi:** Admin, owner va amalni bajarayotganning o'zi chetlab o'tiladi. Har bir akkaunt auditga alohida yoziladi.

**Y13. Admin o'z Telegramini boshqa xodim nomiga ulay olardi** — ✅
- **Muammo:** Admin boshqa xodimning barcha bildirishnomalarini o'ziga yo'naltirib, uning nomidan "Bajarildi" tugmasini bosa olardi.
- **Nima qilindi:** Boshqa xodim uchun havola yaratishga `canManageRoles` kerak. Auditga havolani kim yaratgani yoziladi (`telegram.link_created_for_employee`).

### Ijro nazorati mantiqi

**Y4. Ijrochi topshiriqni o'zi yopardi** — ✅
- **Muammo:** Ijrochi 100% qo'ysa, topshiriq darhol "Bajarildi" bo'lardi. Auditoriyadagi birinchi xodim butun tashkilot uchun topshiriqni yopa olardi. Topshiriq beruvchi ham shu yo'l bilan o'z topshirig'ini yopa olardi.
- **Nima qilindi:**
  - Ijrochi faqat "Tekshiruvga yuborish" qila oladi (status "Ko'rib chiqilmoqda").
  - "Bajarildi"ni faqat topshiriq beruvchi yoki `canUpdateAnyTask` egasi qo'yadi. Unda "Qabul qilish" va sabab bilan "Qaytarish" amallari bor.
  - Auditoriya a'zolari faqat o'z ulushini yopadi. Topshiriq beruvchi auditoriya orqali o'ziga ijrochi bo'la olmaydi.
  - Telegram tugmasi ham shu qoidaga o'tkazildi. Arxivlangan yoki yopilgan topshiriqlarda u rad etiladi.
  - Keyingi davriy topshiriq faqat qabul qilinganda yaratiladi.
- **Test:** `tests/task-workflow.test.mjs`, `tests/telegram-hardening.test.mjs`

**Y5. 300 tadan keyin ro'yxatlar jimgina kesilardi** — ✅
- **Muammo:** Yangi va muddatsiz topshiriqlar, kelgusi yig'ilishlar va audit yozuvlari ko'rinmay qolardi.
- **Nima qilindi:**
  - Topshiriq, yig'ilish va audit uchun server tomonda sahifalash qilindi (`hasMore`, `nextOffset`).
  - Faol topshiriqlar birinchi chiqadi.
  - Audit uchun alohida endpoint bor. Excel eksporti 10 000 tagacha yozuv chiqaradi va kesilgan bo'lsa ogohlantiradi.
  - UI da "Yana yuklash" tugmasi qo'shildi.

### Chat

**Y6. "Umumiy e'lonlar"ga istalgan xodim yozardi va hammaga Telegram xabar ketardi** — ✅
- **Nima qilindi:**
  - E'lonlar kanaliga faqat admin, rahbar, `canManageOrganization` yoki `canConfigure` egasi yoza oladi.
  - Yuborish limiti: xodim daqiqasiga 30 ta xabar, e'lonlar kanaliga soatiga 5 ta.
  - Yozish huquqi bo'lmaganlar uchun UI da yozish maydoni yashiriladi.

**Y7. Bo'limdan ketgan xodim eski bo'lim chatini o'qishda davom etardi** — ✅
- **Muammo:** "O'qildi" belgisi xodimni kanalga doimiy a'zo qilib qo'yardi.
- **Nima qilindi:**
  - O'qish holati alohida jadvalda saqlanadi (`app_chat_read_state`, migratsiya `0034`).
  - Bo'lim kanaliga kirish faqat xodimning hozirgi `department_id` si bo'yicha tekshiriladi.
  - Eski "soxta a'zolik" qatorlari o'chirildi.

### Hisobotlar va Ma'lumotlar markazi

**Y8. O'zini o'zi tasdiqlash** — ✅
- **Nima qilindi:**
  - Hisobotni mas'ul xodim yoki uni topshirgan kishi tasdiqlay olmaydi.
  - Ma'lumotlar markazida adminga berilgan istisno o'zini tasdiqlash tekshiruvidan keyinga ko'chirildi.

**Y9. "Maxfiy maydon" belgisi hech narsani himoya qilmasdi** — ✅
- **Nima qilindi:** `canViewRestrictedInformation` huquqi bo'lmasa:
  - maxfiy qiymatlar javobdan olib tashlanadi;
  - shu maydonlarga biriktirilgan fayllarni yuklab olish 404 qaytaradi;
  - `q` qidiruvi maxfiy qiymatlar bo'yicha qidirmaydi;
  - bunday foydalanuvchi yozuvni saqlaganda maxfiy qiymatlar o'zgarmaydi.

**Y10. Navbatdagi bitta yozuv butun domenga kirish berardi** — ✅
- **Nima qilindi:** Tasdiqlash navbati endi faqat o'sha yozuvni ochadi. Navbat, tafsilot, fayllar va qidiruv bitta kirish shartidan foydalanadi.

### Telegram va fon ishlari

**Y11. Cron yo'q edi, eslatmalar ketmasdi** — ✅
- **Nima qilindi:** `instrumentation.ts` ilova ichida har daqiqada Telegram navbatini, hisobot davrlarini va chat yuklamalarini tozalashni ishga tushiradi. Smoke testda bu tasdiqlandi.

**Y12. Telegram ulanmagan xodimlar uchun ishlar navbatni to'ldirardi** — ✅
- **Nima qilindi:**
  - Bildirishnoma ishlari faqat Telegram ulangan va yoqilgan xodimlar uchun yaratiladi.
  - `waiting_link` holatidagi ishlar 24 soatdan keyin bekor qilinadi.
  - Muddati o'tgan eslatmalar yuborilmaydi.
- **Yo'l-yo'lakay topilgan xato:** auditoriya bildirishnomalarini yaratadigan SQL da sintaksis xatosi bor edi, shuning uchun ular hech qachon ishlamagan. Tuzatildi.

**Y14. Maxfiy mazmun Telegram va OpenAI ga ochiq ketardi** — ✅
- **Nima qilindi:**
  - Chat bildirishnomasida faqat "Yangi xabar: #kanal" va havola bor: xabar matni ham, fayl nomi ham yo'q.
  - Yig'ilish joyi xabarlardan olib tashlandi.
  - AI ga faqat `aiAllowed` deb belgilangan maydonlar qiymati yuboriladi.
  - AI so'rovlarining kunlik umumiy limiti qo'shildi (`OPENAI_DAILY_REQUEST_LIMIT`, standart qiymati 200).

### Ma'lumotlar bazasi va infratuzilma

**Y15. Foreign key yo'q, yetim yozuvlar qolardi** — ⚠️ qisman
- **Qilindi:** Topshiriq va yig'ilishni bog'liq yozuvlari bilan yaratish bitta tranzaksiyaga (`db.batch`) o'tkazildi. Xato bo'lganda yetim yozuv qolmaydi, bu test bilan tekshirilgan. Xatoni jim yutib yuboradigan `.catch(() => undefined)` olib tashlandi.
- **Qilinmadi:** Asosiy jadvallarga FK qo'shish. SQLite da buning uchun jadvallarni qayta qurish kerak, shuning uchun bu Postgres migratsiyasiga qoldirildi.

**Y16. CSP va HSTS yo'q edi** — ✅
- **Nima qilindi:**
  - `proxy.ts` har bir so'rov uchun yangi nonce bilan to'liq CSP beradi (`default-src 'self'`, `script-src 'nonce-…' 'strict-dynamic'`, `connect-src 'self'` va boshqalar).
  - HSTS, `X-Frame-Options`, `nosniff` va `Referrer-Policy` headerlari qo'shildi.
  - Smoke testda 11 ta inline script'ning hammasi nonce bilan chiqdi, nonce'siz inline script yo'q.

**Y17. Testlar xatti-harakatni emas, kod matnini tekshirardi** — ✅
- **Nima qilindi:** Yangi handler darajasidagi test fayllari qo'shildi: `auth-hardening`, `dev-identity`, `task-workflow`, `chat-report-info-hardening`, `telegram-hardening`, `platform-adapters`. Ular haqiqiy route kodini SQLite bazada ishga tushiradi.

---

## Platforma o'tishida qo'shimcha qilingan xavfsizlik ishlari

- **Proksi ortidagi Origin tekshiruvi:** `assertSameOrigin` endi ichki `http://…:3000` manzili bilan emas, `SITE_BASE_URL` bilan solishtiradi. Sessiya cookie'lari HTTPS da `Secure` bayrog'i bilan yoziladi.
- **API javoblari keshlanmaydi:** barcha `/api` javoblari `Cache-Control: private, no-store` bilan qaytadi.
- **Fayl ombori:** obyekt kalitlari saqlash papkasidan tashqariga chiqolmaydi (`../` bilan kirish bloklangan, test bilan tekshirilgan).
- **Docker:** ilova root emas, `node` foydalanuvchisi nomidan ishlaydi. Maxfiy qiymatlar faqat serverdagi `deploy/.env` da turadi. Ilova porti tashqariga ochilmaydi, faqat Caddy (80/443) ochiq.
- **Olib tashlangan o'lik kod:** `app/chatgpt-auth.ts`, `app/executive-reports.tsx`, `examples/`, Cloudflare/Vinext skriptlari va `/_vinext/image` handler.

---

## 🟡 O'rta va ⚪ past darajadagi ochiq xavfsizlik bandlari

Quyidagilar hali **tuzatilmagan** (deploydan keyingi bosqich uchun):

| Band | Xavf | Tavsiya |
|---|---|---|
| ✅ Joriy parolni tekshirishda urinishlar soni cheklanmagan (`change-password`) | Yopildi | Xodim bo‘yicha 15 daqiqada 5 ta urinish (`app_login_attempts`, `password:<id>`), keyin 429; muvaffaqiyatda hisoblagich tozalanadi (`services/accounts.ts`) |
| ✅ Login javob vaqti mavjud loginlarni oshkor qiladi | Yopildi | Mavjud bo‘lmagan yoki faolsiz login uchun ham bir xil PBKDF2 (`dummyVerifyPassword`) |
| ✅ Sessiyada harakatsizlik taymauti yo'q, "eslab qolish" 30 kun | Yopildi | Oddiy sessiya 8 soat harakatsizlikdan keyin (`SESSION_IDLE_HOURS`), "eslab qolish" 7 kun (`SESSION_REMEMBER_IDLE_DAYS`); mutlaq muddat 12 soat / 30 kun saqlanadi (`lib/session.ts`) |
| ✅ `GET /api/auth/sso` boshqa saytdan chaqirilib, foydalanuvchini tizimdan chiqaradi | — | Yopildi: marshrut o'chirildi (VPS'da SSO yo'q) |
| ✅ Rol huquqlari o'zgarishi auditga to'liq yozilmaydi (faqat nom va holat) | Yopildi | `role.updated` endi har bir o‘zgargan huquq, daraja, nom va holat uchun oldin/keyin qiymatini yozadi |
| ✅ PBKDF2 100 000 iteratsiya | Yopildi | Yangi xeshlar 600 000; eski 100 000 lik xesh keyingi muvaffaqiyatli kirishda avtomatik qayta xeshlanadi |
| ✅ Isbot fayllarini topshiriq yopilgandan keyin ham o'chirish mumkin | — | Yopildi: `fileDelete` policy — yopilgan/arxivlangan topshiriqda 409 |
| ✅ Fayl hajmi butun fayl xotiraga o'qilgandan keyin tekshiriladi | — | Yopildi: `Content-Length` majburiy, oqim bilan saqlash, 25 MB chegara, topshiriq/kunlik kvota |
| ✅ Hisobot so'rovlarida JSON hajmi cheklanmagan | — | Yopildi: `readJsonBody` 2 MB, 413 |
| ✅ Audit jurnali append-only emas | — | Yopildi: UPDATE/DELETE trigger bilan rad etiladi, faqat nazoratli retention (1 yildan eski) — migratsiya 0041 |
| Chat qidiruvi barcha xodimlar ro'yxatini ko'rsatadi | Ma'lumot oshkorligi (ataylab qilingan bo'lishi mumkin) | Siyosatni tasdiqlash |
| ✅ Xodim o'zini o'ziga rahbar qilish | — | Yopildi: servisda to'g'ridan-to'g'ri va bilvosita sikl tekshiruvi (tiklanadigan yaratish yo'lidagi xato ham), baza triggeri, rekursiv so'rovlar `UNION` |
| FK yo'qligi (Y15 qoldig'i) | Butunlik buzilishi | Postgres migratsiyasi bilan |
| Git tarixi va eski ZIP'lar (K1 qoldig'i) | Shaxsiy ma'lumot tarqalgan | Siz tomondan tozalash |

---

## Qayerdan tekshirish mumkin

- **Testlar:** Node 24 bilan `npm test` (hozir 148/148 o'tadi).
- **Har bir bandning qisqa holati:** `ijro-nazorati-kod-auditi.md` boshidagi "Tuzatish holati" jadvali.
- **Serverga joylash:** `DEPLOY.md`.

*Shaxsiy ma'lumotlar bo'yicha huquqiy masalalar yuridik maslahat emas, ularni yurist bilan tasdiqlash tavsiya etiladi.*
