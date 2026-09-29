# Frontend uslubi va tuzilishi

## Uslub (CSS)

### Fayllar tuzilishi

| Fayl | Nima bor | Qayerda import qilinadi |
|---|---|---|
| `app/globals.css` | Tailwind, dizayn tokenlari (`:root`), reset, qobiq (sidebar, topbar, pastki navigatsiya), umumiy komponentlar (tugmalar, formalar, modal, toast, kartalar, jadvallar, pickerlar) va bir nechta soha ishlatadigan qoidalar | `app/layout.tsx` |
| `app/dark-theme.css` | Qorong'i tema (`html[data-theme="dark"] ...`) | `app/layout.tsx` |
| `app/styles/tasks.css`, `meetings.css`, `chat.css`, `reports.css`, `research.css`, `information.css` | Faqat shu lazy sahifada ishlatiladigan qoidalar — sahifa ochilganda yuklanadi | Mos entry fayl: `app/tasks-page.tsx`, `meetings-page.tsx`, `chat-page.tsx`, `reports-page.tsx`, `research-reports.tsx`, `information-center.tsx` |
| `app/styles/admin.css`, `audit.css`, `dashboard-home.css` | Shu sohalarga xos qoidalar (sahifalar boshidan yuklanadi, faqat tartib uchun ajratilgan) | `app/admin-pages.tsx`, `audit-page.tsx`, `dashboard-home.tsx` |

Qoida qayerga yoziladi:
- Klass **faqat bitta** soha fayllarida ishlatilsa → `app/styles/<soha>.css`.
- Bir nechta sohada yoki qobiqda ishlatilsa → `app/globals.css`.
- Soha fayllari `globals.css` dan **keyin** yuklanadi. Shuning uchun soha qoidasi umumiy qoidani
  bir xil specifiklik bilan "yutib" qo'ymasligi kerak: umumiy komponentni sohada o'zgartirish uchun
  soha klassi bilan aniqlashtiring (`.chat-composer .primary-button`), `!important` qo'shmang.
- Qorong'i tema variantlari `dark-theme.css` da (`html[data-theme="dark"] .klass`) — specifikligi
  yuqori, soha fayllari tartibidan qat'i nazar ishlaydi.

### Ranglar

- **Semantik o'zgaruvchilar** (`--blue`, `--ink`, `--muted`, `--border`, `--card`, …) — rang mavzusi
  (`data-color-theme`) va qorong'i tema ularni qayta aniqlaydi. **Yangi kod shularni ishlatadi.**
- **Palitra tokenlari** `--c-*` (`globals.css` dagi ikkinchi `:root`) — eski kodda eng ko'p
  takrorlangan 40 ta aniq rang (`--c-white`, `--c-blue-46` = `#1957d2`, `--c-slate-90`, …).
  Qiymatlari qat'iy, mavzu bo'yicha o'zgarmaydi (ko'rinish avvalgidek qolishi uchun). Nom:
  `--c-<oila>-<yorug'lik %>[-a<shaffoflik>]`.
- Yangi xom hex qiymat qo'shmang: mos semantik o'zgaruvchi yoki `--c-*` token ishlating.

### Boshqa qoidalar

- **Tailwind + `components/ui/*` (shadcn)** faqat Ilmiy tadqiqotlar moduli va Ma'lumotlar
  markazi qidiruvida qoldi. Yangi kodda ishlatilmaydi; modul qayta ishlanganda semantik
  klasslarga o'tkaziladi.
- Inline `style={{}}` faqat dinamik qiymatlar uchun (progress kengligi va h.k.).
- `!important` faqat: `prefers-reduced-motion` blokida, `.amber-text`/`.red-text` kabi utility
  klasslarda va umumiy `input`/`select`/`button` stillarini picker ichida bosib o'tishda
  (mavjudlari). Yangi qo'shilmaydi.

## Bildirishnomalar va dialoglar

- **Toast:** faqat dashboard toast'i. Komponentlar `useNotify()` (yoki `useDashboard().notify`)
  ni chaqiradi — `sonner` olib tashlangan.
- **Tasdiqlash / matn so'rash:** `confirmDialog()` / `promptDialog()`
  (`app/_components/ui/confirm-dialog.tsx`). `window.confirm/prompt` ishlatilmaydi.
- **Modal:** `ModalFrame` + `ModalHeader` (`app/dashboard-kit.tsx`) — fokus tuzog'i, Escape,
  `aria-labelledby` avtomatik.

## Holat va tuzilish

- Qobiq qiymatlari (`actor`, `alphabet`, `notify`, `refresh`, `run`) —
  `app/_components/dashboard/dashboard-context.tsx`. Chuqur komponentlarga prop orqali
  uzatilmaydi.
- Katta ekranlar: `app/<sahifa>.tsx` — yupqa kirish nuqtasi (lazy import shu faylga);
  implementatsiya `app/_components/<soha>/` da: ma'lumot/qoidalar `use-*.ts` hook'larida,
  ko'rinish kichik komponentlarda.
- Serverga so'rovlar `readJson()` (`lib/shared/http.ts`) orqali; 401 → `SessionExpiredError`.
- Matnlar `useI18n()` (`lib/i18n`): UI matni `t()`, ma'lumot `tx()`; identifikatorlar (login,
  email, token, URL) xom holda chiqariladi.
