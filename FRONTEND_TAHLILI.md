# Frontend tahlili: kamchiliklar, xatolar va baho

> **Sana:** 2026-09-29
> **Holat:** barcha refaktor va tuzatishlardan keyingi kod (`app/`, `app/_components/`, `components/`, CSS).
> **Usul:** kod qatorma-qator ko'rib chiqildi, miqdoriy ko'rsatkichlar `grep`/`wc` bilan o'lchandi.
> **Cheklov:** brauzerda qo'lda sinov o'tkazilmagan. "Tekshirish kerak" belgisi bor bandlarni jonli tasdiqlash kerak. **✅ tasdiqlandi** belgisi bor bandlar kodda qayta tekshirilgan.

## Umumiy baho: **10 dan 5**

| Yo'nalish | Baho | Qisqacha |
|---|---|---|
| To'g'rilik (xatolar) | **4/10** | To'xtovsiz yuklanish sikli, sessiya tugaganda chiqish yo'li yo'q, kirill rejimida kodlar buziladi |
| UX | **5/10** | Yangi oqimlar qo'shilgan, lekin brauzer `confirm`/`prompt` oynalari ishlatiladi, fon xatolari ko'rinmaydi |
| Accessibility (a11y) | **4/10** | Modal oynalarda fokus boshqaruvi yo'q, toast xabarlarini ekran o'quvchi e'lon qilmaydi |
| Tezlik | **5/10** | SSE va lazy yuklash yaxshi, lekin to'liq client SPA, 246 KB CSS va yuklanish sikli bor |
| Arxitektura | **5/10** | Fayllar bo'lingan, lekin JSX bir qatorga siqilgan, uslublar aralash, alifbo almashtirish mo'rt |
| Mobil, i18n, client xavfsizligi | **6/10** | Client xavfsizligi toza, i18n mo'rt |

## ✅ Tuzatish holati (2026-09-29)

| Band | Holat | Nima qilindi |
|---|---|---|
| 1 | ✅ | `lastBootstrapAt` → `useRef`; bootstrap sikli yo'q (regressiya testi) |
| 2 | ✅ | `SessionExpiredError` (401) → ma'lumot tozalanadi, login sahifasi chiqadi |
| 3 | ✅ | Kirill rejimi `loadError` ga bog'liq emas |
| 4 | ✅ | Telegram kodi, login, email, `@username` — `data-alphabet-static` |
| 5 | ✅ | Refresh joriy filtr va yuklangan sahifalarni saqlaydi |
| 6 | ✅ | Yig'ilishlar sahifasida "Yana yuklash" |
| 7, 8 | ✅ | Yopilgan/arxivlangan topshiriqda fayl o'chirish va yo'naltirish yashirin |
| 9 | ✅ | Topshiriqlar cursor bo'yicha sahifalanadi (`nextCursor`), offset ham ishlaydi |
| 10 | ✅ | `etagMatches`: `W/`, `-gzip` qo'shimchalariga chidamli; gzip bilan 304 jonli tasdiqlandi |
| 11, 18 | ✅ | Chat fon xatolari ko'rinadi, sessiya tugasa login; "Qayta ulanmoqda…" indikatori |
| 12, 13 | ✅ | Toast taymeri tozalanadi; logout xatosi tekshiriladi |
| 14 | ✅ | Barqaror `rowKey` |
| 15 | ✅ | 14 ta `confirm`/`prompt` → `ConfirmDialog`/`promptDialog` |
| 16 | ✅ | "Aloqa uzildi — Qayta urinish" banneri |
| 17 | ✅ | "Tekshiruvda" tabi va "Qabulingizni kutmoqda" belgisi |
| 19 | ✅ | Topshiriq va audit uchun skeletonlar |
| 20, 21 | ✅ | Focus trap, Escape, fokusni qaytarish, `aria-labelledby` |
| 22 | ✅ | Toast `role="status"/"alert"` + `aria-live` |
| 24 | ✅ | Bosiladigan qator va kartalar klaviatura bilan ishlaydi, `:focus-visible` |
| 28 | ✅ | Tashkilot/bo'limlar `/api/bootstrap/structure` ga; bootstrap 104 KB → 7.4 KB (gzip bilan 1.5 KB) |
| 33 | ✅ | Bitta toast tizimi; CSS tuzilmasi va qoidalari `docs/FRONTEND_STYLE.md` da; 89 ta `!important` sababi bilan hujjatlangan |
| 35 | ✅ | `admin-modals` 858→13, `chat-page` 797→11, `report-fill-modal` 700→222 |
| 36, 38 | ✅ | `DashboardContext`; hisobot mantig'i `useReportSheet`/`useReportDraft` hook'larida |
| 37, 39 | ✅ | `docx` olib tashlandi; `localStorage` try/catch bilan |
| 32 | ✅ | Prettier (120 belgi), `npm run format` / `format:check`; testlar bo'shliqlarga chidamli |
| 23, 30, 34 | ✅ | DOM-mutatsiyali renderer (MutationObserver) olib tashlandi; render vaqtidagi `lib/i18n` (`t()` UI matni, `tx()` ma'lumot, identifikatorlar xom) |
| 40 | ✅ | Uchinchi til — rus (~1 950 kalit); har bir `t()` kaliti tarjimasi borligini test tekshiradi |
| 27 | ✅ | `app/page.tsx` Server Component: sessiya va birinchi ekran ma'lumoti serverda (HTML bilan), `/api/bootstrap` birinchi so'rovi yo'q; til cookie orqali `<html lang>` |
| 29 | ✅ | `globals.css` 249 KB → 171 KB; soha CSS'lari (`app/styles/*`) sahifa bilan yuklanadi; 40 ta rang tokeni (literal ishlatilishi −30%) |
| 31 | ✅ | `useVirtualList`: xodimlar, shtat va ijrochi tanlash ro'yxatlari (jadval semantikasi va `aria-rowindex` saqlangan) |
| 25 | ✅ | axe-core (WCAG 2 A/AA): serious/critical buzilishlar 0 — 17 ta kam kontrastli matn tuzatildi (yorug' mavzu) |
| 41 | ✅ | Playwright: 390×844 va 1440×900 da gorizontal siljish 0 — topbar va bosh sahifa grid'i tuzatildi |

Tekshiruv: 217/217 test, `tsc`, `eslint`, Prettier, `next build` toza; Docker + Caddy stekida API smoke va **brauzer E2E (Playwright + axe): 34/34** (desktop va mobil, 3 til). Qayta ishga tushirish: `docs/E2E.md`.

---

## O'lchovlar

| Ko'rsatkich | Qiymat |
|---|---|
| `"use client"` fayllar | 54 |
| `useState` / `useEffect` | 161 / 41 |
| `window.confirm` / `prompt` | 12 / 1 |
| 300 belgidan uzun qatorlar | 170 ta (ulardan 23 tasi 1000 belgidan uzun) |
| Global CSS | 246 KB, 885 xil rang kodi, 32 ta `!important` |
| JS chunk'lar | ~2.4 MB (eng kattasi 884 KB — Excel kutubxonasi, talab bo'yicha yuklanadi) |
| `any` turi | 0 |
| `dangerouslySetInnerHTML` | 1 (faqat nonce'li tema skripti) |
| Toast'da `aria-live` | yo'q |

---

## 1. To'g'rilik (xatolar) — 4/10

| # | Daraja | Joy | Muammo | Tuzatish |
|---|---|---|---|---|
| 1 | 🔴 **Yuqori** ✅ tasdiqlandi | `app/dashboard.tsx:134-150` | Effekt `[lastBootstrapAt, refresh]` ga bog'liq, `refresh()` esa har safar `lastBootstrapAt` ni yangilaydi. Natijada effekt qayta ishlaydi va `setTimeout(0)` orqali yana `refresh()` chaqiriladi. Bu **to'xtovsiz bootstrap so'rovlari sikli**: 304 bo'lsa ham server va tarmoq doim band | `lastBootstrapAt` ni `useRef` ga o'tkazish; effekt faqat `[refresh]` ga bog'liq bo'lsin |
| 2 | 🔴 Yuqori | `dashboard.tsx:108-124`, `236` | Endi 8 soatlik harakatsizlik taymauti bor. Ma'lumot yuklangandan keyin 401 kelsa, `loadError` qo'yiladi, lekin `data` joyida qoladi. Foydalanuvchi eskirgan ekranda qoladi, har amal xato beradi, login sahifasiga yo'l yo'q | `readJson` 401 da maxsus xato tashlasin; dashboard `data=null` qilib `LoginScreen` ni ko'rsatsin |
| 3 | 🔴 Yuqori | `dashboard.tsx:63-66`, `use-alphabet-renderer.ts` | Bitta fon xatosi (`loadError`) alifbo tayyorligini o'chiradi va kirill rejimi o'chib qoladi. Auditdagi eski xato hali tuzatilmagan | Alifbo holatini `loadError` ga bog'lamaslik |
| 4 | 🔴 Yuqori | `app/admin-modals.tsx:857` (Telegram `/start ${token}`), `employees-page.tsx:165,230` (`@username`) | Kirill rejimida Telegram kodi va loginlar kirillga o'giriladi. Admin xodimga noto'g'ri kod yoki login beradi | Token, login, email va URL larni `data-alphabet-static` bilan o'rash |
| 5 | 🟡 O'rta | `dashboard.tsx:108-116` | Har `refresh` topshiriqlar ro'yxatini 1-sahifaga va "current" filtriga qaytaradi. "Yana yuklash" va "Eski bajarilganlar" natijalari yo'qoladi (1-xato bilan birga deyarli darhol) | Refresh joriy filtr va yuklangan sahifalarni saqlasin |
| 6 | 🟡 O'rta | `meetings-page.tsx`, `dashboard-types.ts:33` | Server `meetingsHasMore` qaytaradi, lekin yig'ilishlar sahifasida "Yana yuklash" tugmasi yo'q. 1-sahifadan keyingi yig'ilishlar ko'rinmaydi | Topshiriqlardagi kabi "Yana yuklash" qo'shish |
| 7 | 🟡 O'rta | `task-detail.tsx:51` | Fayl o'chirish tugmasi yopilgan yoki arxivlangan topshiriqda ham ko'rinadi, server esa 409 qaytaradi | Tugmani yopilgan va arxivlangan topshiriqda yashirish |
| 8 | 🟡 O'rta | `task-detail.tsx:55` | "Keyingi ijrochiga yo'naltirish" yopilgan topshiriqda ham ko'rinadi | `!closed` sharti qo'shish |
| 9 | 🟡 O'rta | `dashboard.tsx:187-200` | Offset bo'yicha sahifalash: ro'yxat o'zgarsa, ba'zi elementlar o'tkazib yuborilishi mumkin | Cursor bo'yicha sahifalash |
| 10 | 🟡 O'rta (tekshirish kerak) | `bootstrap-client.ts:8-17` | Caddy javobni siqqanda ETag ga `-gzip` qo'shimchasi qo'shiladi. Brauzerda 304 ishlamasligi mumkin (siqilmagan so'rov bilan sinovda 304 ishladi) | Brauzerda tekshirish; kerak bo'lsa ETag ni yumshoq (weak) solishtirish |
| 11 | ⚪ Past | `chat-page.tsx:255-358` (9 joy) | Fondagi yangilash xatolari `.catch(() => undefined)` bilan yutiladi, 401/403 foydalanuvchiga ko'rinmaydi | 401 ni umumiy sessiya xatosiga uzatish |
| 12 | ⚪ Past | `dashboard.tsx:183` | Toast taymeri avvalgisini tozalamaydi, shuning uchun yangi toast erta yopiladi | Taymerni `ref` da saqlab tozalash |
| 13 | ⚪ Past | `dashboard.tsx:280,401` | Chiqish (logout) so'rovi xatosi tekshirilmaydi, sahifa darhol qayta yuklanadi | Xato bo'lsa xabar berish |
| 14 | ⚪ Past | `new-report-modal.tsx:212,347` | Tahrirlanadigan ro'yxatda `key={index}` ishlatilgan. Qator o'chirilganda inputlar holati siljiydi | Barqaror id ishlatish |

## 2. UX — 5/10

| # | Daraja | Joy | Muammo | Tuzatish |
|---|---|---|---|---|
| 15 | 🟡 O'rta | 12 ta `window.confirm` (masalan, `employees-page.tsx:62`, `roles-page.tsx:82`, `report-fill-modal.tsx:53,219`), `staff-directory-page.tsx:92` (`prompt`) | Brauzer oynalari kirillga o'girilmaydi, stili yo'q, telefonda noqulay. Parolni qayta berish tasdig'i `prompt` bilan so'raladi | Yagona `ConfirmDialog` komponenti |
| 16 | 🟡 O'rta (tekshirish kerak) | `dashboard.tsx:108-124` | Fondagi xato faqat holatda saqlanadi, ko'rinadigan ogohlantirish yo'q | "Aloqa uzildi — qayta urinish" banneri |
| 17 | 🟡 O'rta (tekshirish kerak) | `task-detail.tsx` | "Ko'rib chiqilmoqda" holatidagi topshiriqlar ro'yxatda alohida filtr yoki belgi bilan ajralib turmaydi | "Tekshiruvda" filtri va hisoblagichi |
| 18 | ⚪ Past | chat | SSE uzilganda foydalanuvchiga hech narsa ko'rsatilmaydi, jimgina polling ga o'tiladi | "Qayta ulanmoqda" belgisi |
| 19 | ⚪ Past | audit, topshiriqlar | Yuklanish vaqtida skelet ko'rsatilmaydi, katta ro'yxatlarda ekran sakraydi | Skeleton |

## 3. Accessibility (a11y) — 4/10

| # | Daraja | Joy | Muammo | Tuzatish |
|---|---|---|---|---|
| 20 | 🔴 Yuqori | `dashboard-kit.tsx:196-208` (`ModalFrame`, barcha asosiy modallar) | Fokus modal ichida ushlanmaydi. Modal ochilganda fokus unga o'tmaydi, yopilganda joyiga qaytmaydi. Tab tugmasi fondagi elementlarga chiqib ketadi | Radix `Dialog` (loyihada allaqachon o'rnatilgan) yoki focus-trap |
| 21 | 🟡 O'rta | `dashboard-kit.tsx:207` | Har bir modalda bir xil `aria-label="Boshqaruv oynasi"`. Ekran o'quvchi modal sarlavhasini aytmaydi | `aria-labelledby` ni sarlavha id siga bog'lash |
| 22 | 🟡 O'rta | `dashboard.tsx:287,587` | Toast `role="status"` va `aria-live` siz, xabarlar e'lon qilinmaydi | `role="status" aria-live="polite"`, xatolar uchun `role="alert"` |
| 23 | 🟡 O'rta (tekshirish kerak) | `use-alphabet-renderer.ts` | Matn to'g'ridan-to'g'ri DOM da o'zgartiriladi. Input `value` va `option` lar bilan to'qnashishi mumkin | i18n qatlami (35-bandga qarang) |
| 24 | ⚪ Past (tekshirish kerak) | ro'yxatlar va jadvallar | `onKeyDown` atigi 6 joyda. Bosiladigan `div`/`article` elementlar bo'lishi mumkin | Semantik `button`/`a` ishlatish |
| 25 | ⚪ Past (tekshirish kerak) | CSS | 885 xil rang kodi, kontrast tizimli tekshirilmagan | Rang tokenlari va axe/Lighthouse tekshiruvi |

## 4. Tezlik — 5/10

| # | Daraja | Joy | Muammo | Tuzatish |
|---|---|---|---|---|
| 26 | 🔴 Yuqori | 1-band | Yuklanish sikli boshqa barcha optimizatsiyalarni bekor qiladi | 1-bandni tuzatish |
| 27 | 🟡 O'rta | `app/page.tsx` va 54 ta client fayl | To'liq client SPA: avval JS yuklanadi, keyin bootstrap so'rovi ketadi. Server Components ishlatilmaydi | Bosh sahifa va ro'yxatlarni server komponentga o'tkazish |
| 28 | 🟡 O'rta | bootstrap | Birinchi ochilishda tashkilotlar (185 KB) va bo'limlar (85 KB) JSON yuboriladi | Talab bo'yicha yuklash yoki keshlash |
| 29 | 🟡 O'rta | `app/globals.css` (246 KB) | Butun CSS har sahifada yuklanadi, eski va takror qoidalar ko'p | Bosqichma-bosqich CSS modullari yoki Tailwind ga o'tish |
| 30 | ⚪ Past | `use-alphabet-renderer.ts` | Kirill rejimida butun sahifaga MutationObserver qo'yiladi, katta ro'yxatlarda qimmat | i18n qatlami |
| 31 | ⚪ Past | xodimlar va shtat ro'yxatlari | Virtualizatsiya yo'q ("Yana 60 ta" tugmasi qisman yechim) | Kerak bo'lsa virtual ro'yxat |

## 5. Arxitektura va kodni saqlash — 5/10

| # | Daraja | Joy | Muammo | Tuzatish |
|---|---|---|---|---|
| 32 | 🟡 O'rta | 170 ta uzun qator (masalan, `task-detail.tsx:44-55`, `admin-modals.tsx:857`) | JSX bitta qatorga siqilgan: o'qish, review va diff juda qiyin | Prettier + `max-len` qoidasi |
| 33 | 🟡 O'rta | uslublar | Uch yondashuv aralash: qo'lda yozilgan 246 KB CSS, Tailwind, shadcn `components/ui`. Toast ham ikkita: o'zimizniki va `sonner` | Bittasini tanlab, qolganini bosqichma-bosqich olib tashlash |
| 34 | 🟡 O'rta | `use-alphabet-renderer.ts` | Lotin/kirill almashtirish DOM ni o'zgartirish orqali qilingan, React ga begona usul. 3 va 4-xatolar shundan kelib chiqadi | Matnlarni `t()` yoki `alphabetText()` orqali render qilish |
| 35 | 🟡 O'rta | `admin-modals.tsx` (858), `chat-page.tsx` (773), `report-fill-modal.tsx` (688) | Hali ham katta fayllar | Keyingi bosqichda bo'lish |
| 36 | ⚪ Past | holat boshqaruvi | Global store yo'q. `data` va ko'p `useState` prop orqali uzatiladi (`TaskDetail` 11 ta prop oladi) | Context yoki kichik store |
| 37 | ⚪ Past | `package.json` | `docx` paketi endi hech qayerda import qilinmaydi | Olib tashlash |
| 38 | ⚪ Past | `new-report-modal`, `report-fill-modal` | Tasdiqlash va validatsiya mantig'i komponent ichida | Hook'larga ajratish |

## 6. Mobil, i18n va client xavfsizligi — 6/10

| # | Daraja | Joy | Muammo | Tuzatish |
|---|---|---|---|---|
| 39 | ⚪ Past | `dashboard.tsx:70-90,160,173`, `theme-mode-toggle.tsx:19,34` | `localStorage` try/catch siz ishlatiladi. Brauzer saqlashni bloklagan bo'lsa, xato chiqadi | try/catch li yordamchi funksiya |
| 40 | ⚪ Past | i18n | Faqat lotindan kirillga o'girish bor. Rus yoki ingliz tili yo'q, matnlar kodga qattiq yozilgan | Lug'at fayllari |
| 41 | ⚪ Past (tekshirish kerak) | mobil | 41 ta `@media` qoidasi va pastki navigatsiya bor, bu yaxshi. Lekin modallar va keng jadvallar telefonda sinalmagan | Haqiqiy qurilmada sinash |
| — | ✅ | xavfsizlik | `dangerouslySetInnerHTML` faqat nonce'li tema skriptida. Barcha `target=_blank` havolalarda `rel` bor. `any` va `innerHTML` yo'q | — |

---

## Kuchli tomonlar

- Chat SSE, `since=`/204 va AbortController bilan so'rovlar poygasi to'g'ri hal qilingan.
- Yagona `readJson`: tushunarli o'zbekcha xato xabarlari. TypeScript strict rejimda, `any` umuman yo'q.
- Hisobot jadvali faqat ekranda ko'rinadigan qatorlarni chizadi. Excel kutubxonasi faqat kerak bo'lganda yuklanadi.
- Katta fayllar bo'lingan, navigatsiya `NavKey` bilan ishlaydi, sahifalar lazy yuklanadi.
- Mobil pastki navigatsiya, qorong'i tema va `data-alphabet-static` mexanizmi bor.

---

## Tuzatish tartibi (tavsiya)

| Navbat | Bandlar | Taxminiy hajm | Natija |
|---|---|---|---|
| 1 — deploydan oldin | **1**, 2, 5 | 0.5 kun | Yuklanish sikli yo'qoladi, sessiya tugasa login sahifasi chiqadi |
| 2 | 3, 4, 6, 7, 8 | 1 kun | Kirill rejimi va topshiriq/yig'ilish oqimlari to'g'ri ishlaydi |
| 3 | 20, 21, 22, 15 | 1–2 kun | Modallar va xabarlar accessible bo'ladi, `confirm` o'rniga o'z dialogimiz |
| 4 | 32, 37, 39, 11, 12, 13, 14 | 1 kun | Kod o'qiladigan, kichik xatolar yopiladi |
| 5 | 27, 28, 29, 33, 34 | 1–2 hafta | Server Components, yagona uslub tizimi, to'g'ri i18n. Shu bosqichdan keyin frontend 7–8/10 ga chiqadi |

**Muhim:** 1-band (to'xtovsiz bootstrap sikli) kodda tasdiqlangan. Uni deploydan oldin albatta tuzatish kerak, aks holda har bir ochiq brauzer oynasi serverga to'xtovsiz so'rov yuboradi.
