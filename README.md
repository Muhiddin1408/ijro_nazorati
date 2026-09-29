# Ichki hisobotlarni boshqarish tizimi

Ichki hisobotlar, rahbariyat topshiriqlari, ijro ierarxiyasi, yig‘ilishlar va Telegram
eslatmalarini boshqaruvchi to‘liq veb-ilova.

Tizimni ochish: o'z serveringizdagi domen orqali, login va parol bilan (qarang `DEPLOY.md`).
Egasi shu ChatGPT akkaunti ochiq bo‘lgan brauzerdan kiradi; alohida tizim
login-paroli talab qilinmaydi. ZIP nusxasi uchun [BOSHLASH.md](BOSHLASH.md) va
`TIZIMNI_OCHISH.html` fayllaridan foydalaning.

## Asosiy imkoniyatlar

- administrator orqali bo‘lim, xodim va rollarni yaratish hamda tahrirlash;
- xodimni emailsiz yaratish, login/parolni darhol berish yoki 72 soatlik
  bir martalik xavfsiz faollashtirish havolasini Excel paketi orqali chiqarish;
- login/parol orqali xavfsiz kirish, urinishlarni vaqtincha bloklash va
  12 soatlik yoki 30 kunlik sessiya;
- rol, bo‘lim va bevosita rahbarlik zanjiriga asoslangan server vakolatlari;
- bitta topshiriqni bir nechta xodimga berish;
- topshiriq va yig‘ilish auditoriyasini tashkilot, bo‘lim yoki alohida xodim
  sifatida ierarxik belgilash, zarur bo‘lsa barcha quyi tashkilotlarni qo‘shish;
- rahbar → o‘rinbosar → boshqarma boshlig‘i → xodim yo‘nalish tarixini ko‘rish;
- xodimga faqat vakolati doirasidagi topshiriqlarni ko‘rsatish;
- administrator boshqaradigan topshiriq tematikalari va tematika bo‘yicha
  qidirish;
- topshiriq muddati, ustuvorligi, jarayoni, fayllari va shaxsiy pinlar;
- standart bir martalik topshiriqlar hamda alohida yoqiladigan kunlik,
  haftalik, oylik va choraklik davomiy topshiriqlar;
- bajarilgan davomiy topshiriqning keyingi davrini avtomatik yaratish;
- yig‘ilishlar taqvimi, tahrirlash, bekor qilish va ishtirokchilar;
- Telegram bot orqali ijrochi va topshiriq beruvchiga xabar, muddatdan
  3 kun, 24 soat, 3 soat, 1 soat va 15 daqiqa oldin takroriy eslatmalar;
- umumiy e’lonlar, bo‘lim, guruh va shaxsiy suhbatlar uchun korporativ chat;
- chat orqali PDF, PPTX, rasm, video, audio, Office hujjatlari va boshqa
  fayllarni 500 MB gacha bo‘lakli, uzilganda qayta urinadigan usulda yuborish
  hamda qabul qilish;
- chatdagi yangi xabarlarni botga ulangan qabul qiluvchilarga Telegram orqali
  avtomatik yetkazish;
- Enter orqali tezkor yuborish, Shift+Enter orqali yangi qator va katta fayl
  yuklanish foizini ko‘rsatish;
- butun interfeysni Lotin yoki Кирилл alifbosida ko‘rsatish va tanlovni saqlash;
- uch varaqli, rangli va filtrlanuvchi professional Excel hisoboti;
- audit jurnali va bo‘limlar kesimidagi hisobotlar;
- 8 strategik yo‘nalishli rahbar paneli, hududdan birlamchi yozuvgacha
  chuqurlashish, mamlakat bayroqlari bilan xorijiy safarlar tahlili;
- yuklangan `ma’lumotlar.xlsx` fayliga bog‘langan 16 bo‘linmali
  **Ma’lumotlar markazi**: 49 ta manba jadvali, 5 ta aniq belgilangan qo‘shimcha
  jadval, 811 ta ustun va 100 ta rahbar ko‘rsatkichi;
- boshqarma → shakl → yozuv → mas’ul/manba/tarixgacha drill-down, qoralama,
  ko‘rib chiqish, qaytarish, tasdiqlash va arxivlash jarayoni;
- hudud va yo‘nalish bitta ixcham paneldan tanlanadigan AI-tahlil hamda
  haqiqiy `.docx` eksport;
- yagona shtatlar faylidan 241 yuridik tashkilot, 536 shtat qatori va 920,75
  shtat birligini manba holati bilan import qilish;
- KPI va integratsiyalar uchun ERP modullari;
- SKUD, GPS, transport, yo‘l aktivlari, soliq va ijro.gov.uz bilan kelajak
  integratsiyalari uchun navbatli, qayta urinishli ma’lumot almashish qatlami;
- iOS va Android uchun pastki navigatsiyali moslashuvchan mobil interfeys.

## Ilmiy tadqiqot va AI qidiruv

Ilmiy tadqiqotlar **Ma’lumotlar markazi → Sohani raqamlashtirish va ilg‘or
xorijiy tajribalarni tatbiq etish boshqarmasi → Ilmiy tadqiqotlar va
innovatsiyalar** ichida ochiladi. Loyihalar, bosqichlar, tekshiruvlar va
fayllar o‘z joyida saqlanadi; oddiy “Ilmiy ishlar” jadvali ham mavjud.

**AI qidiruv** menyusi barcha ruxsat berilgan boshqarmalardagi jadval
shakllari, kiritilgan ma’lumotlar va ilmiy loyihalarni bir joydan topadi.
Lotin/kirill, apostrof variantlari, keng tarqalgan sinonimlar va tasdiqlangan
holat filtri qo‘llanadi. Natijadan bevosita manba ochiladi. To‘liq bazada
qidiriladi, natijalar 20 tadan sahifalanadi; o‘zgarishlar indeksga avtomatik
tushadi. Fayllarning ichki matni, chat va topshiriqlar bu qidiruvga kirmaydi.

Kalitsiz rejim — serverdagi FTS5 manba qidiruvi, generativ AI javobi emas.
Matnli AI javobi uchun serverda `OPENAI_API_KEY` maxfiy qiymati zarur;
`OPENAI_SEARCH_MODEL` ixtiyoriy (standart: `gpt-4.1-mini`). Sites’da kalitni
OpenAI Developers integratsiyasi orqali ulang. Kalitni kodga, ZIPga yoki
brauzerga kiritmang. Ulanmagan holat interfeysda aniq ko‘rsatiladi.

AI javobi faqat alohida tugma bosilganda, topilgan va ruxsat berilgan 8 tagacha
manbaning cheklangan parchalaridan tayyorlanadi. Cheklangan manbalar va
`sensitive` ustunlar tashqi AIga yuborilmaydi. So‘rov serverdan yuboriladi,
`store:false` ishlatiladi; har foydalanuvchi uchun daqiqasiga 6, sutkasiga
100 urinish chegarasi bor. Noto‘g‘ri manba havolasi, uzilish yoki AI xatosida
oddiy qidiruv natijalari saqlanadi. Tashqi AI ishlatilganda foydalanuvchining
savoli va ko‘rsatilgan manba parchalari OpenAI xizmatiga yuboriladi.

Texnik asos: [D1 FTS5](https://developers.cloudflare.com/d1/sql-api/sql-statements/)
va [Responses structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

## Katta yuklamaga tayyorgarlik

Tizim 30 ming ro‘yxatdan o‘tgan foydalanuvchili keyingi bosqich uchun
sahifalangan ierarxik katalog, inkremental chat tarixi, oqimli R2 fayl yuklash,
SQL asosidagi Telegram outbox-navbati, rekursiv tashkiliy so‘rovlar va yirik
jadvallar indekslari bilan tayyorlangan. 30 ming foydalanuvchining bir vaqtda
real-time chatda ishlashi uchun production’da Cloudflare Durable Objects +
WebSocket va Queues qatlami alohida yoqilishi, so‘ng yuklama sinovidan
o‘tkazilishi shart; oddiy polling rejimi bunday parallel yuklama uchun emas.

## Yagona shtatlar importi

`drizzle/0011_unified_staff_seed.sql` foydalanuvchi taqdim etgan
`avtoyol_yagona_shtatlar.xlsx` faylining tekshirilgan snapshotidan yaratilgan.
Faylda F.I.Sh. yo‘q, shu sababli 536 ta lavozim avval vakant shtat sifatida
ochiladi. Xodim lavozimga biriktirilgachgina uning shaxsiy akkaunti xavfsiz
faollashtiriladi. Hududiy bo‘ysunish manbada alohida ID bilan berilmagani uchun
taxmin qilingan bog‘lanishlar administrator tasdig‘igacha `hierarchy_verified=0`
holatida saqlanadi.

`drizzle/0012_central_apparatus_staff.sql` 2026-yil 30-apreldagi 25-son
buyruqning 2-ilovasiga asosan markaziy apparatning 2026-yil 1-maydan amaldagi
tuzilmasini alohida import qiladi: 19 ta tarkibiy blok, 57 ta lavozim satri va
76 ta shtat birligi. Manbada xodimlarning F.I.Sh. ma’lumoti yo‘qligi sababli
ular vakant pozitsiya sifatida ochiladi. `Транспорт вазирлиги` varag‘i hamda
hujjat imzolovchilari xodim sifatida import qilinmaydi.

`drizzle/0016_central_apparatus_employees.sql` foydalanuvchi taqdim etgan
`Тел рақамлар 3.xlsx` faylidagi 77 ta noyob xodimni markaziy apparat
tuzilmasiga biriktiradi: 69 tasi tasdiqlangan 76 birlikli shtat jadvalini
band qiladi, 7 birlik vakant qoladi, shtat jadvalida bo‘lmagan 8 texnik xodim
esa kadrlar xizmati tasdig‘igacha alohida qo‘shimcha katalogda saqlanadi.
Import F.I.Sh., lavozim, bo‘lim, rahbarlik zanjiri, tug‘ilgan sana, ichki va
mobil telefonni manba satri hamda checksum bilan audit qiladi. Tug‘ilgan sana
va mobil telefon oddiy xodimlar uchun API javobidan olib tashlanadi. Import
hech kimga login yoki parol yaratmaydi; mavjud administrator akkaunti va uning
kirish ma’lumotlari o‘zgartirilmaydi.

`drizzle/0013_information_center.sql`, `0014_information_catalog.sql` va
`0015_information_center_hardening.sql`
Ma’lumotlar markazining versiyalangan yozuvlari, son/sana bo‘yicha indekslangan
qiymatlari, bo‘lim vakolatlari, ishtirokchilar, keyingi qadamlar va fayl
metama’lumotlari uchun bazani yaratadi. Katalog hech qanday uydirma amaldagi
qiymat yoki maqsad ko‘rsatkichini kiritmaydi; demo yozuvlar real ma’lumotdan
`is_demo` belgisi bilan qat’iy ajratiladi.

Tashqi API, telemetriya yoki Excel konnektori ma’lumotni
`POST /api/information/ingest` manziliga 1–100 tadan paket qilib yuboradi.
So‘rov `Authorization: Bearer ...` orqali `INFORMATION_INGEST_SECRET` bilan
himoyalanadi; `templateCode + sourceMode + sourceRecordKey` takroriy yuborishni
xavfsiz yangilash kalitidir. Integratsiyadan kelgan to‘liq yozuv ham avval
ko‘rib chiqish holatiga tushadi. Ma’lumot kartochkasidagi fayllar R2 omboriga
100 MB gacha oqim tarzida yuklanadi va yozuv vakolati bilan himoyalanadi.

## Texnologiyalar

- TypeScript, React 19, Next.js/Vinext
- Cloudflare Workers
- Cloudflare D1 (ma’lumotlar bazasi)
- Cloudflare R2 (biriktirilgan fayllar)
- Telegram Bot API

## Kompyuterda ishga tushirish

Talab: Node.js 24, npm va Linux yoki Windows ichidagi WSL (Ubuntu).
Skriptlar Bash, `flock` va GNU `timeout` dan foydalanadi.
CI muhiti Node.js 24.14.0 bilan tekshiriladi.

```bash
git clone <yangi-repozitoriy-url> ijro-nazorati
cd ijro-nazorati
npm ci
npm run db:local:migrate
npm run dev
```

Brauzerda `http://localhost:5173` manzilini oching. Mahalliy ishlab chiqish
rejimida tizim namunaviy administrator sifatida ochiladi:

- email: `admin@ijro.local`
- rol: `Administrator`

Mahalliy D1 va R2 ma’lumotlari `.wrangler/` papkasida saqlanadi. Bu papka
GitHub’ga yuborilmaydi.

## Telegram botini ulash

1. `.env.example` faylidan nusxa olib `.env.local` yarating.
2. BotFather bergan yangi tokenni `TELEGRAM_BOT_TOKEN` qiymatiga kiriting.
3. `TELEGRAM_WEBHOOK_SECRET` va `REMINDER_JOB_SECRET` uchun uzun, tasodifiy
   qiymatlar yarating.
4. Ommaviy HTTPS manzilni `SITE_BASE_URL` sifatida kiriting.
5. Dasturdagi **Telegram → Webhookni faollashtirish** tugmasini bosing.
6. Administrator har bir xodim uchun bir martalik ulash havolasini yaratadi.

Telegram webhook mahalliy `localhost` manziliga kira olmaydi. Mahalliy sinovda
HTTPS tunnel yoki ommaviy test domeni kerak bo‘ladi.

> Bot tokeni, webhook siri va boshqa maxfiy qiymatlarni `.env.example`,
> dastur kodi yoki GitHub’ga hech qachon yozmang.

## Production’ga chiqarish

Production muhiti quyidagilarni ta’minlashi kerak:

1. `DB` nomli Cloudflare D1 binding;
2. `BUCKET` nomli Cloudflare R2 binding;
3. `drizzle/` ichidagi barcha migratsiyalarni D1 bazaga qo‘llash;
4. quyidagi maxfiy muhit qiymatlari:
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`,
   `REMINDER_JOB_SECRET`;
5. oddiy muhit qiymatlari:
   `TELEGRAM_BOT_USERNAME`, `SITE_BASE_URL`,
   `APP_TIMEZONE=Asia/Tashkent`;
6. mavjud administratorning login/paroli yoki shaxsiy Sites SSO kirishi.
   SSO uchun `TRUST_OAI_AUTHENTICATED_USER_HEADER=true` va
   `OWNER_SSO_EMAIL` server muhitida belgilanadi. Bu faqat tashqi
   identifikatsiya headerlarini olib tashlab, tekshirilgan foydalanuvchining
   ID va emailini qayta qo‘shadigan ishonchli Sites dispatcher ortida yoqiladi.
   Ochiq internetdan kelgan headerlar autentifikatsiya hisoblanmaydi.

Joriy production nusxasi OpenAI Sites autentifikatsiyasi, D1 va R2
resurslaridan foydalanadi.

### Production’dagi birinchi administrator kirishi

Birinchi administrator credentiali production bazaga faqat deployment vaqtida
Git’dan tashqarida saqlanadigan bir martalik maxfiy seed orqali kiritiladi.
Administrator login va vaqtinchalik parolni maxfiy credential reestridan oladi,
kiradi va birinchi kirishdayoq shaxsiy parolga almashtiradi. Vaqtinchalik parol
30 kun ichida ishlatilmasa muddati tugaydi. Shundan keyin administrator boshqa
xodim va vakant shtat hisoblarini dasturdagi **Rollar va vakolatlar** bo‘limidan
yaratadi yoki qayta chiqaradi.

Maxfiy seed SQL va login-parollar Excel fayli repozitoriyga commit qilinmaydi.
Production’ga qo‘llangach seed deployment artefaktidan ham olib tashlanadi.
Joriy Sites nusxasida tizim egasi `/api/auth/sso` orqali alohida ERP
login-parolisiz kiradi. Birinchi kirishda server sozlamasidagi egasining
tasdiqlangan emaili mavjud faol xodimga bog‘lanadi; keyin ruxsat Sites bergan
barqaror foydalanuvchi ID orqali tekshiriladi. Bitta xodim ikkinchi ID ga
avtomatik qayta bog‘lanmaydi. Xodim yoki uning roli faolsizlantirilsa, kirish
yopiladi. Oddiy login orqali kirishdagi parol almashtirish qoidasi saqlanadi.
SSO tugmasi avvalgi xodim sessiyasini tozalab, tizim egasi sifatida kirishni
boshlaydi. Chiqish tugmasi qayta SSO tanlanguncha avtomatik kirishni to‘xtatadi.

Egasi akkaunti almashtirilsa, vakolatli administrator serverdagi
`OWNER_SSO_EMAIL` va `app_owner_identities` bog‘lanishini nazoratli tartibda
yangilashi kerak. Faqat email o‘zgargani uchun tizim boshqa shaxsga ruxsat bermaydi.

## Tekshirish

```bash
npm run lint
npx tsc --noEmit --incremental false
npm test
npm audit --omit=dev --audit-level=high
```

Yoki barcha tekshiruvlarni birgalikda:

```bash
npm run check
```

## Muhim xavfsizlik qoidalari

- GitHub repozitoriysi ichki tizim uchun imkon qadar private bo‘lsin.
- Ommaviy doimiy parollar yaratilmaydi; faollashtirish tokenining faqat SHA-256
  xeshi saqlanadi, havola bir marta ishlaydi va 72 soatda tugaydi.
- Parollar ochiq matnda emas, Cloudflare Workers bilan mos PBKDF2-SHA256
  (100 000 iteratsiya) va alohida salt orqali xeshlanib saqlanadi. Boshqa
  iteratsiya qiymatidagi eski credential hisoblanmaydi: kirish yopiq qoladi va
  administrator parolni qayta chiqarishi kerak.
- Oxirgi faol administratorni faolsizlantirish bloklanadi.
- Xodim, bo‘lim va rahbarlik ierarxiyasidagi aylana serverda bloklanadi.
- Fayl va topshiriqlarga kirish har bir API so‘rovida qayta tekshiriladi.
- Maxsus bo‘lim, ichki audit va korrupsiyaga qarshi ma’lumotlar yopiq ACL
  orqali ko‘rsatiladi; axborot xavfsizligi tasdig‘isiz real maxsus ma’lumot
  ommaviy cloud bazaga kiritilmasligi kerak.
- Barcha muhim o‘zgarishlar audit jurnaliga yoziladi.

Batafsil siyosat va amaldagi dependency audit istisnosi [SECURITY.md](SECURITY.md)
faylida qayd etilgan.

## Zaxira nusxa

Production’da D1 bazasi va R2 bucket uchun muntazam zaxira siyosatini yoqing.
GitHub faqat dastur kodini saqlaydi; amaldagi topshiriqlar, xodimlar va fayllar
GitHub’ga kirmaydi.
