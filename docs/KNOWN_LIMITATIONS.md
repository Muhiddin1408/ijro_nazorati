# Ma’lum cheklovlar va prioritlashtirilgan backlog

## 1. Frontend monolit (yuqori prioritet)

**Muammo:** `app/dashboard.tsx` (~380 KB) barcha sahifalar, modallar, helper’lar va business UI’ni o‘z ichiga oladi.

**Ideal holat:**
- `app/components/tasks/`
- `app/components/meetings/`
- `app/components/chat/`
- `app/components/admin/`
- `app/components/reports/`
- `app/components/staff/`
- `app/components/shared/` (ThemePicker, OrganizationCascadePicker, alphabet, formatters)
- Dashboard faqat shell + nav + bootstrap orchestration

**Hozirgi ish (Phase A + B wiring + Faza C sahifalar):**
- ✅ Pure helper’lar `app/ui-helpers.tsx` ga ajratildi (alphabet, date, BrandMark, ThemePicker, ColorMode, labels)
- ✅ Dashboard additive mounts: `AuditJournalPage`, `ThemeModeToggle`, `NotificationPrefsPanel`
- ✅ ChatPage `app/chat-page.tsx` ga ajratildi (lazy import + `dashboard-kit`)
- ✅ TasksPage `app/tasks-page.tsx` ga ajratildi (lazy import)
- ✅ MeetingsPage `app/meetings-page.tsx` ga ajratildi (lazy import)
- ✅ Dashboard local alphabet/date/BrandMark/ThemePicker/humanSize dublikatlari olib tashlandi — `ui-helpers` import
- ✅ TaskModal / TaskEditModal / MeetingModal / TaskDetail / PeoplePicker `app/task-meeting-modals.tsx` ga ajratildi
- ✅ ReportsPage `app/reports-page.tsx` ga ajratildi (lazy + New/Fill/Delegate)
- ✅ Staff/Admin `app/admin-pages.tsx` ga ajratildi (shtatlar, xodimlar, rollar, tashkilotlar, xavfsizlik)
- ✅ Employee/Role/Org/Topic/Telegram modallar `app/admin-modals.tsx` ga ajratildi
- ✅ Quiet hours `app_telegram_accounts` da saqlanadi; worker tinch soatda yubormaydi
- ✅ Login / Home / Excel export ajratildi
- ⚠️ `function OrganizationCascadePicker` regression testi uchun dashboard.tsx da qoladi

## 2. Real-time chat scale

Polling (6–15 s) joriy yuklama uchun yetarli. 30k concurrent uchun:
- Cloudflare Durable Objects
- WebSocket / Hibernation API
- Queues for fan-out

## 3. Legacy schema

`departments`, `employees`, `tasks`, `meetings`, `attachments`, `reminder_logs` hali mavjud. Faqat `app_*` jadvallar ishlatiladi. Migratsiya xavfsizligi uchun saqlangan. Keyingi major versiyada tozalash mumkin.

## 4. Integratsiyalar (planned)

- SKUD
- GPS / transport
- Yo‘l aktivlari
- Soliq
- ijro.gov.uz

Connector jadvali va outbox allaqachon bor; real adapterlar keyingi bosqich.

## 5. Qo‘shimcha funksiyalar backlog

| Prioritet | Funksiya | Holat |
|-----------|----------|-------|
| Yuqori | Dashboard modularizatsiya | Sahifalar + CRUD + login/home/excel ajratildi · shell + provisioning qoladi |
| Yuqori | Dark mode | ✅ CSS + toggle + login/topbar mount |
| O‘rta | Audit Excel/CSV export | ✅ `audit-export.ts` + AuditPage tugmasi |
| O‘rta | Notification preferences (Telegram mute, quiet hours) | ✅ D1 + GET/PATCH + worker hurmati (Toshkent vaqti) |
| O‘rta | Bundle analysis + code-splitting | Chat + Tasks + Meetings + Reports lazy-load qilindi |
| Past | PWA / offline task view | Reja |
| Past | Real connector (bitta) | Reja |
| Past | Global advanced search | Reja |
| Past | Bulk task actions | Reja |

## Phase A/B fayllar (branch tip)

| Fayl | Holat |
|------|-------|
| `app/ui-helpers.tsx` | ✅ ColorMode + BrandMark/ThemePicker |
| `app/dark-theme.css` | ✅ + login toolbar / security spacing |
| `app/theme-mode-toggle.tsx` | ✅ dashboard + login mount |
| `app/layout.tsx` | ✅ dark-theme + FOUC script |
| `app/audit-export.ts` | ✅ |
| `app/audit-page.tsx` | ✅ dashboard `AuditJournalPage` |
| `app/notification-prefs.tsx` | ✅ SecurityPage + `/api/telegram/preferences` |
| `app/chat-page.tsx` | ✅ lazy `ChatPage` + GroupChatModal |
| `app/tasks-page.tsx` | ✅ lazy `TasksPage` |
| `app/meetings-page.tsx` | ✅ lazy `MeetingsPage` |
| `app/dashboard-kit.tsx` | ✅ readJson, PageIntro, ModalFrame, OrganizationCascadePicker |
| `app/task-meeting-modals.tsx` | ✅ TaskModal, TaskEditModal, MeetingModal, TaskDetail, PeoplePicker |
| `app/reports-page.tsx` | ✅ lazy ReportsPage + New/Fill/Delegate |
| `app/admin-pages.tsx` | ✅ Staff, Employees, Roles, Orgs, Security, Telegram, KPI |
| `app/admin-modals.tsx` | ✅ Employee/Role/Department/Organization/Topic/Telegram modallar |
| `app/login-screen.tsx` | ✅ kirish + aktivatsiya |
| `app/dashboard-home.tsx` | ✅ bosh sahifa |
| `app/task-meeting-export.ts` | ✅ topshiriq/yig‘ilish Excel |
| `app/dashboard.tsx` | ✅ shell + nav + bootstrap + provisioning |

## Xavfsizlik eslatmalari

- Repo private bo‘lishi shart.
- Credential Excel bir martalik; ochiq parol saqlanmaydi.
- `TRUST_OAI_AUTHENTICATED_USER_HEADER` faqat ishonchli reverse-proxy ortida.
- Maxsus/yopiq ma’lumotlar uchun ACL + visibility=restricted.

---

Oxirgi yangilanish: 2026-08-16 02:10 +05 (improvements/review-modularize-enhance)
