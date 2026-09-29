# Ichki hisobotlar tizimi — boshlash

Tizim o'z serveringizda (VPS) Docker + Caddy orqali ishlaydi. Kirish — login va parol.

## Lokal ishga tushirish (Docker)

```bash
cp .env.example deploy/.env      # DOMAIN=localhost, SITE_BASE_URL=https://localhost, maxfiy qiymatlar
mkdir -p runtime-data
docker compose up -d --build
docker compose exec app node scripts/db.mjs admin tizim.admin   # vaqtinchalik parol chiqadi
```

Brauzerda https://localhost ni oching (lokal sertifikat ogohlantirishini o'tkazib yuboring).

## Ishlab chiqish rejimi (Node 24)

```bash
npm ci
npm run db:migrate
npm run db:admin -- tizim.admin
npm run dev          # http://127.0.0.1:3000
```

## Hujjatlar

- `DEPLOY.md` — serverga joylash, zaxira nusxa, yangilash
- `docs/E2E.md` — brauzer smoke testi
- `BAJARILGAN_ISHLAR_HISOBOTI.md` — bajarilgan ishlar
- `XAVFSIZLIK_HISOBOTI.md`, `FRONTEND_TAHLILI.md`, `KOD_VA_TEZLIK_REJASI.md` — tahlil va holat

Tekshirish: `npm run check`. Haqiqiy xodimlar ro'yxati git'da saqlanmaydi (`private-seed/`, qarang `DEPLOY.md`).
