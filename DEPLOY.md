# VPS ga joylash (Docker + Caddy + SQLite)

Arxitektura: `app` (Next.js standalone, Node 24, SQLite fayli va fayllar `/data` da) +
`caddy` (HTTPS sertifikatini avtomatik oladi, reverse proxy). Eslatmalar va hisobot
davrlari ilova ichida har daqiqada ishlaydi (`instrumentation.ts`).

## 1. Server tayyorlash (Ubuntu 22.04/24.04)

```bash
curl -fsSL https://get.docker.com | sh
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```

Domenning **A yozuvi** VPS IP manziliga yo'naltirilgan bo'lishi kerak (Caddy sertifikat
olishi uchun).

## 2. Kodni joylash

```bash
mkdir -p /opt/ijro && cd /opt/ijro
# kodni git yoki rsync bilan ko'chiring (node_modules, .next, private-seed dan tashqari)
cp .env.example deploy/.env && nano deploy/.env   # DOMAIN, SITE_BASE_URL, maxfiy qiymatlar
mkdir -p runtime-data && chown 1000:1000 runtime-data
docker compose up -d --build
docker compose logs -f app      # "N migration(s) applied" va "Ready" chiqishi kerak
```

Maxfiy qiymatlarni yaratish: `openssl rand -hex 32`.

## 3. Administrator

```bash
docker compose exec app node scripts/db.mjs admin tizim.admin
```

Vaqtinchalik parol chiqadi — birinchi kirishda almashtiriladi.

## 4. Xodimlar ro'yxati (ixtiyoriy, maxfiy)

Haqiqiy xodimlar ro'yxati git'da saqlanmaydi. Uni serverga alohida ko'chirib, bir marta
yuklang:

Fayl nomlarini o'zgartirmang: seed qayta qo'llanmasligi fayl nomi bo'yicha tekshiriladi.
Tartib muhim: avval 0016, keyin 0017 (`Ходимлар.xlsx` bo'yicha kontakt tuzatishlari).

```bash
scp private-seed/0016_private_*.sql private-seed/0017_private_*.sql root@SERVER:/opt/ijro/runtime-data/
docker compose exec app node scripts/db.mjs seed-private /data/0016_private_central_apparatus_employees.sql
docker compose exec app node scripts/db.mjs seed-private /data/0017_private_employees_xodimlar_update.sql
rm /opt/ijro/runtime-data/00*_private_*.sql
```

## 5. Telegram bot

`deploy/.env` ga `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`
qo'shing, `docker compose up -d`, so'ng admin panelidagi **Telegram → Webhook o'rnatish**.

## 6. Zaxira nusxa

Ilova har kuni bazaning izchil nusxasini avtomatik oladi (`VACUUM INTO`):
`runtime-data/backups/ijro-YYYY-MM-DD.sqlite`, oxirgi 14 kuni saqlanadi
(`BACKUP_KEEP_DAYS` bilan o'zgartiriladi). Ularni va `runtime-data/storage/` ni
boshqa serverga ko'chirib turing:

```bash
0 3 * * * rsync -a /opt/ijro/runtime-data/backups /opt/ijro/runtime-data/storage backup@BOSHQA_SERVER:/zaxira/ijro/
```

Tiklash: `docker compose down`, kerakli nusxani `runtime-data/ijro.sqlite` ga ko'chirib,
`-wal`/`-shm` fayllarini o'chirib, `docker compose up -d`.

Sog'liq tekshiruvi: `https://DOMEN/api/health` → `{"ok":true}`.

## 7. Yangilash

```bash
cd /opt/ijro && git pull   # yoki rsync
docker compose up -d --build   # migratsiyalar avtomatik qo'llanadi
```
