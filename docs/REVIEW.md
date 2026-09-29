# Ijro Nazorati ERP — To‘liq tizim ko‘rib chiqish (2026-08-15)

**Repo:** `<tashkilot>/ijro-nazorati`  
**Asosiy commit:** `d6d1746b0af767943b224264ea9a99837ab98797` (nanoid GHSA yopilgan)  
**Branch:** `improvements/review-modularize-enhance`  
**Ko‘rib chiqish jamoasi:** Grok (lead) + Harper (frontend) + Lucas (backend) + Benjamin (docs/security)

## Umumiy baho

Tizim **yuqori sifatli**, domain-specific (Uzavtoyul / Avtomobil yo‘llari qo‘mitasi ijro nazorati + ma’lumotlar markazi) va production-ready asosiy funksiyalar bo‘yicha. Kritikal xavfsizlik yoki mantiqiy bug topilmadi.

Asosiy kuchli tomonlar:
- Ierarxik RBAC + access profiles + title-heuristic (haydovchi/kotibga rahbar huquqi bermaydi)
- PBKDF2-SHA256 (qat’iy 100k iteratsiya), session hash, lockout, one-time activation, mustChangePassword
- Hierarchical audiences (org/dept + descendants)
- Staff import fidelity (241 org, 536 pozitsiya, markaziy apparat, checksum, F.I.Sh.siz vakantlar)
- Information Center: 16 domain, 49+ template, workflow (draft→review→approve), validation, R2
- Tasks + recurrence + routes + pins + Telegram reminders (3 kun…15 daqiqa)
- Chat: guruh, shaxsiy, 500 MB multipart, read markers, Telegram nusxa
- Dual alphabet (Lotin/Кирилл) live switcher
- Regression testlar juda qattiq (migration count, UI string, checksum, DOCX, limitlar)

## Arxitektura qisqacha

| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | React 19 + Next.js 16 / Vinext, `app/dashboard.tsx` shell |
| Backend | Cloudflare Workers + D1 (SQLite) + R2 |
| ORM | Drizzle (`db/schema.ts`, `app_*` jadvallar) |
| Auth | Custom sessions (`app_sessions`), PBKDF2 credentials |
| Jobs | Telegram outbox (`app_notification_jobs`), scheduled reminders |
| CI | GitHub Actions, Node ≥22.15, `npm run check` |

Asosiy ish oqimi: browser → `/api/*` route handlers → Drizzle → D1; fayllar R2’da; audit `app_audit_logs` ga yoziladi; bootstrap bitta so‘rovda actor + tasks + meetings + audit snapshot qaytaradi.

## Xavfsizlik holati

**Yaxshi amaliyotlar (saqlanishi shart):**
- Parol ochiq saqlanmaydi; PBKDF2-SHA256, 100 000 iteratsiya, alohida salt
- Session token hash sifatida saqlanadi (HttpOnly cookie)
- Login lockout (`failedAttempts`, `lockedUntil`)
- One-time activation tokenlar hash + muddat + revoke
- Provisioning workbook bir martalik; ochiq parol keyin qayta ko‘rsatilmaydi
- Same-origin / CSRF ehtiyotlari worker headerlari orqali
- `canViewAudit`, `canManageRoles`, scope checks serverda

**Eslatmalar:**
- Repo private bo‘lishi shart
- `TRUST_OAI_AUTHENTICATED_USER_HEADER` faqat ishonchli reverse-proxy ortida
- Audit `detailJson` hech qachon passwordHash / activation token chiqarmasligi kerak
- Kelajakdagi `GET /api/admin/audit-logs` faqat `canViewAudit` + pagination + rate limit

## Kamchiliklar

1. **Frontend monolit** — `app/dashboard.tsx` ~380 KB, `globals.css` ~267 KB. Saqlash, test, parallel ishlash va Workers bundle uchun eng katta xavf.
2. **Real-time scale** — 30k concurrent uchun polling yetarli emas; Durable Objects + WebSocket + Queues kerak (README o‘zi qayd etgan).
3. **Legacy jadvallar** — un-prefixed `departments`/`employees`/`tasks` hali schema’da (migratsiya xavfsizligi uchun).
4. **Integratsiyalar** — SKUD, GPS, transport, soliq, ijro.gov.uz faqat `planned`.
5. **Qisman qolgan** — KPI “BPR kutilmoqda”; `OrganizationCascadePicker` regression testi uchun dashboardda qoladi.

## Amalga oshirilayotgan ishlar (ushbu branch)

### 1. Hujjatlashtirish
- `docs/REVIEW.md` (shu fayl)
- `docs/KNOWN_LIMITATIONS.md` (prioritlashtirilgan backlog)

### 2. Modularizatsiya (xavfsiz, incremental)
**Faza A (past xavf):** pure helper’lar → `app/ui-helpers.ts`
- `latinToCyrillic`, `alphabetText`, `searchMatches`
- date helpers (`localDateKey`, `formatDateTime`, `deadlineLabel`, …)
- `initials`, `avatarColor`, `usernameStem`, `humanSize`
- `colorThemes`, `monthNames`, `weekdayNames`
- `BrandMark`, `ThemePicker` (kichik React komponentlar)

**Faza B:** React komponentlar → `app/components/shared/`
- `OrganizationCascadePicker`, `PeoplePicker`, `PageIntro`, `ModalFrame`

**Faza C:** sahifa modullari (birma-bir, regression string’larni buzmasdan)
- ✅ AuditPage (`app/audit-page.tsx`) dashboardga ulandi
- ✅ ChatPage (`app/chat-page.tsx`) lazy-load + `dashboard-kit`
- ✅ TasksPage (`app/tasks-page.tsx`) lazy-load
- ✅ MeetingsPage (`app/meetings-page.tsx`) lazy-load
- ✅ Dashboard helper dublikatlari `ui-helpers.ts` importiga almashtirildi (`OrganizationCascadePicker` dashboardda qoldi)
- ✅ TaskModal / TaskEditModal / MeetingModal / TaskDetail / PeoplePicker → `app/task-meeting-modals.tsx`
- ✅ ReportsPage (`app/reports-page.tsx`) lazy-load + NewReport/Fill/Delegate modallar
- ✅ Staff/Admin (`app/admin-pages.tsx`) — shtatlar, xodimlar, rollar, tashkilotlar, xavfsizlik
- ✅ Employee/Role/Org/Topic/Telegram modallar (`app/admin-modals.tsx`)
- ✅ Quiet hours serverda saqlanadi va Telegram navbatida hurmat qilinadi
- ✅ Login / Home / Excel export shelldan ajratildi

**Cheklov:** `tests/erp-regression.test.mjs` UI string va checksum assert qiladi — matnlar o‘zgarmasligi, faqat joylashuv o‘zgarishi kerak.

### 3. Konkret enhancements
| Funksiya | Holat |
|----------|-------|
| **Dark mode** | ✅ `dark-theme.css` + `ThemeModeToggle` login, parol eshigi va asosiy topbarda |
| **Audit Excel export** | ✅ `audit-page.tsx` + `audit-export.ts`; dashboard `AuditJournalPage` |
| **Notification prefs** | ✅ Security sahifasi + GET/PATCH; tinch soatlar D1 da saqlanadi va worker kechiktiradi |

## Keyingi qadamlar

1. PR #1 ni `main` ga merge — faqat aniq “merge qil” bilan.
2. KPI moduli (BPR).
3. `OrganizationCascadePicker` dublikatini testdan keyin olib tashlash.

Qarang: [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md)

---

Oxirgi yangilanish: 2026-08-16 02:10 +05 · jamoa: Grok / Harper / Lucas / Benjamin
