# Serverni yangilash yo'riqnomasi

> **Server:** finance.liberator.uz (`169.58.79.138`), foydalanuvchi `deploy`
> **Loyiha papkasi:** `/home/backend/ijro_nazorati`
> **Ilova:** Docker, `127.0.0.1:3100`; HTTPS ni serverdagi umumiy (host) Caddy beradi
> **Vaqt:** ~10–15 daqiqa; ilova yig'ish paytida ishlab turadi, faqat almashtirishda ~10 soniya uziladi.

> ⚠️ **Server umumiy (boshqa loyihalar ham bor).** Barcha `docker compose` buyruqlarini faqat
> `/home/backend/ijro_nazorati` papkasida bajaring. `docker system prune`, `docker image prune -a`,
> `docker compose down` (boshqa papkada), `systemctl restart docker` ishlatmang.

---

## Bu yangilanishda nima bor (2026-10-02, commit `4a624a5`)

| O'zgarish | Bazaga ta'siri |
|---|---|
| Tug'ilgan kun tabrigi: egasiga tabrik sahifasi, hamkasblarga bosh sahifada lavha | Yo'q, yangi migratsiya yoki maydon yo'q |
| Qorong'i mavzuda parol almashtirish sahifasi sarlavhasi tuzatildi | Yo'q |
| Hujjatlar: `XODIMLARNI_SERVERGA_YUKLASH.md`, `VPS_GA_JOYLASH.md` | Yo'q |

Tug'ilgan kunlar chiqishi uchun serverda xodimlar yuklangan bo'lishi kerak (`XODIMLARNI_SERVERGA_YUKLASH.md`),
chunki tug'ilgan sanalar o'sha seed bilan keladi. Tartib muhim emas: avval yangilash, keyin xodimlar ham bo'ladi.

---

## 1. Kod GitHub'da ekanini tekshirish (o'z kompyuteringizda)

```bash
cd "/home/user01/Downloads/Telegram Desktop/Ichki_hisobotlar_yakuniy_kod_2026-09-28/ijro-nazorati"
git status -sb          # "## main...origin/main" — oldinda/orqada belgisi bo'lmasligi kerak
git log --oneline -3
```

`[ahead 1]` kabi yozuv chiqsa, avval `git push` qiling.

## 2. Serverga kirish va hozirgi holat

```bash
ssh deploy@169.58.79.138
cd /home/backend/ijro_nazorati
docker compose ps                 # app — running (healthy)
git log --oneline -1              # hozir serverdagi versiya (keyin orqaga qaytish uchun yozib qo'ying)
git status --short                # bo'sh bo'lishi kerak (.env va docker-compose.override.yml git'da kuzatilmaydi)
```

`git status` da o'zgartirilgan (`M`) fayllar chiqsa — to'xtang va avval kimdir serverda nimani
o'zgartirganini aniqlang. `git pull` ularni bosib keta olmaydi va xato beradi.

## 3. Zaxira nusxa

```bash
docker compose exec -T app node --input-type=module <<'EOF'
import { DatabaseSync } from "node:sqlite";
const file = `/data/backups/ijro-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}-yangilashdan-oldin.sqlite`;
new DatabaseSync("/data/ijro.sqlite").exec(`VACUUM INTO '${file}'`);
console.log("Zaxira:", file);
EOF
ls -lh runtime-data/backups/ | tail -3
```

> Oddiy `cp runtime-data/ijro.sqlite ...` ishlatmang: `runtime-data/` egasi `ubuntu`, `deploy` u yerga
> yoza olmaydi, ilova ishlab turganda `cp` WAL faylidagi so'nggi o'zgarishlarni ham tashlab ketishi mumkin.
> `VACUUM INTO` konteyner ichida to'liq va izchil nusxa oladi.

## 4. Yangi kodni olish

**A) Git orqali (asosiy usul):**

```bash
git pull
git log --oneline -1              # 4a624a5 commit (yoki undan yangi) bo'lishi kerak
```

`Permission denied (publickey)` yoki parol so'rasa — serverda GitHub kaliti sozlanmagan.
`VPS_GA_JOYLASH.md` dagi "Keyinchalik yangilash uchun GitHub kaliti" bo'limini bajaring yoki B) usulni ishlating.

**B) Rsync orqali (GitHub'siz, o'z kompyuteringizdan):**

```bash
cd "/home/user01/Downloads/Telegram Desktop/Ichki_hisobotlar_yakuniy_kod_2026-09-28/ijro-nazorati"
rsync -av --exclude node_modules --exclude .next --exclude .git --exclude .idea \
  --exclude runtime-data --exclude private-seed --exclude .sites-runtime \
  --exclude deploy/.env --exclude .env --exclude docker-compose.override.yml \
  ./ deploy@169.58.79.138:/home/backend/ijro_nazorati/
```

> `runtime-data/`, `private-seed/`, `.env` fayllarni **hech qachon** ko'chirmang: server bazasi va
> maxfiy sozlamalar ustidan yozib yuboriladi.

## 5. Yig'ish va ishga tushirish (serverda)

```bash
cd /home/backend/ijro_nazorati
docker compose build              # 3–8 daqiqa; ilova shu paytda eski versiyada ishlab turadi
docker compose up -d              # yangi konteyner; migratsiyalar avtomatik (bu safar yangisi yo'q)
docker compose ps                 # app — running, ~30 soniyadan keyin (healthy)
docker compose logs --tail=50 app # xato (Error) bo'lmasligi kerak
```

## 6. Tekshirish

```bash
curl -s http://127.0.0.1:3100/api/health; echo
curl -s https://finance.liberator.uz/api/health; echo
```

Ikkalasi ham `{"ok":true}` qaytarishi kerak.

Tug'ilgan kunlar ma'lumoti (bugun va yaqin 7 kun):

```bash
docker compose exec -T app node --input-type=module <<'EOF'
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("/data/ijro.sqlite", { readOnly: true });
const today = new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);
const week = Array.from({ length: 7 }, (_, i) => new Date(Date.now() + 5 * 3600e3 + i * 864e5).toISOString().slice(5, 10));
const rows = db.prepare(`SELECT substr(p.birth_date,6,5) AS kun, e.full_name AS ism FROM app_employee_profiles p JOIN app_employees e ON e.id=p.employee_id
  WHERE e.active=1 AND substr(p.birth_date,6,5) IN (${week.map(() => "?").join(",")})`).all(...week);
rows.sort((a, b) => week.indexOf(a.kun) - week.indexOf(b.kun));
console.log("Bugun (Toshkent):", today);
console.log("Profilida tug'ilgan sanasi bor xodimlar:", Object.values(db.prepare("SELECT count(*) FROM app_employee_profiles WHERE birth_date IS NOT NULL").get())[0]);
console.log("Yaqin 7 kundagi tug'ilgan kunlar:");
for (const row of rows) console.log(`  ${row.kun}  ${row.ism}`);
EOF
```

`Profilida tug'ilgan sanasi bor xodimlar: 0` chiqsa — xodimlar hali yuklanmagan (`XODIMLARNI_SERVERGA_YUKLASH.md`).

Brauzerda (https://finance.liberator.uz, sahifani `Ctrl+Shift+R` bilan yangilang):

- [ ] Kirish va bosh sahifa odatdagidek ochiladi
- [ ] Bugun kimningdir tug'ilgan kuni bo'lsa — bosh sahifa yuqorisida sariq "Bugun hamkasbingizning tug'ilgan kuni" lavhasi
- [ ] Tug'ilgan kuni bugun bo'lgan xodim o'z logini bilan kirsa — tabrik sahifasi, "Ish stoliga o'tish" dan keyin shu kuni qayta chiqmaydi

## 7. Eski image'larni tozalash (ixtiyoriy)

```bash
docker image prune -f --filter "label=com.docker.compose.project=ijro"   # faqat shu loyihaning osilib qolgan image'lari
```

---

## Muammo bo'lsa: orqaga qaytish

Bu yangilanishda migratsiya yo'q, shuning uchun bazani tiklash shart emas, kodni qaytarish yetarli.
`<OLDINGI_COMMIT>` — 2-qadamda yozib olgan qiymat (masalan `e4b6a20`):

```bash
cd /home/backend/ijro_nazorati
git checkout <OLDINGI_COMMIT>
docker compose build && docker compose up -d
docker compose ps
```

Muammo hal bo'lgach, yana asosiy tarmoqqa qaytish: `git checkout main && git pull`, so'ng 5-qadam.

Baza buzilgan bo'lsa (bu yangilanishda kutilmaydi) — 3-qadamdagi zaxiradan tiklash
`XODIMLARNI_SERVERGA_YUKLASH.md` oxiridagi "Zaxiradan tiklash" bo'limidagidek.

## Tekshiruv ro'yxati

- [ ] 1. Lokal `main` = `origin/main`
- [ ] 2. Serverda `git status` toza, eski commit yozib olindi
- [ ] 3. Zaxira `runtime-data/backups/` da paydo bo'ldi
- [ ] 4. `git pull` (yoki rsync) bajarildi, `git log` da `4a624a5`
- [ ] 5. `docker compose ps` — app healthy, loglarda xato yo'q
- [ ] 6. `/api/health` ok; brauzerda bosh sahifa va tug'ilgan kun lavhasi ishlaydi
