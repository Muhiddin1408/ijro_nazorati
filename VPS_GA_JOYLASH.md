# VPS serverga joylash — to'liq qo'llanma

"Ijro nazorati" tizimini **mavjud** VPS serverga o'rnatish bo'yicha qo'llanma. Serverda:

- Docker allaqachon o'rnatilgan;
- RAM — 8 GB;
- **boshqa loyiha ham ishlab turibdi** — unga zarar yetkazmaslik kerak.

Qisqa ma'lumotnoma uchun `DEPLOY.md` ham bor; bu fayl undan batafsilroq.

> 📁 **Serverdagi loyiha papkasi:** `/home/backend/ijro_nazorati`
> 👤 **Serverdagi foydalanuvchi:** `deploy` (server nomi: `vmi3620729`)
>
> Qo'llanmadagi barcha buyruqlar shu papka uchun yozilgan — nusxalab ishlatavering.
> Kod ichidagi `deploy/` **papkasi** (`deploy/.env`, `deploy/Caddyfile`) bilan `deploy`
> **foydalanuvchisini** adashtirmang.

**Arxitektura:**

```
Internet ──443/80──▶ reverse proxy (HTTPS)       ← yoki bizning caddy, yoki serverdagi mavjud nginx/caddy/traefik
                         │
                         ▼
                     app:3000 (Next.js standalone, Node 24)
                         │
                         ▼
                /home/backend/ijro_nazorati/runtime-data  (serverdagi papka)
                  ├── ijro.sqlite        ← baza
                  ├── storage/           ← yuklangan fayllar
                  └── backups/           ← kunlik zaxira nusxalar
```

- Baza — SQLite (Node'ning o'zidagi `node:sqlite`), alohida DB server kerak emas —
  boshqa loyihaning bazasi bilan to'qnashmaydi.
- Migratsiyalar konteyner har ishga tushganda avtomatik qo'llanadi (`deploy/entrypoint.sh`).
- Eslatmalar, hisobot davrlari va kunlik zaxira nusxa ilova ichida o'zi ishlaydi
  (`instrumentation.ts`) — alohida cron kerak emas.
- Ilova ishlaganda ~300–500 MB RAM oladi; `next build` paytida vaqtincha 1.5–2 GB gacha.
  8 GB yetarli, swap shart emas.

> ⚠️ **Asosiy qoida:** boshqa loyihaga tegmaslik. Quyidagi buyruqlarni serverda **ishlatmang**:
> `docker system prune`, `docker volume prune`, `docker compose down` (boshqa loyiha papkasida),
> `systemctl restart docker`, `ufw reset`. Barcha `docker compose` buyruqlarini faqat
> `/home/backend/ijro_nazorati` papkasida bajaring.

---

## 0. Oldindan tayyorlab qo'yiladiganlar

| Nima | Izoh |
|---|---|
| VPS'ga SSH kirish | IP, foydalanuvchi, kalit yoki parol. |
| Domen yoki subdomen | Masalan `finance.liberator.uz`. Boshqa loyiha domenidan **farqli** bo'lishi kerak. |
| Kod | GitHub: `github.com/Muhiddin1408/ijro_nazorati` (yoki lokal papka). |
| Xodimlar ro'yxati (ixtiyoriy) | `private-seed/0016_…sql` va `0017_…sql` — faqat sizning kompyuteringizda, git'da yo'q. |
| Telegram bot (ixtiyoriy) | @BotFather'dan token va bot username. **Boshqa loyiha botidan alohida bot** oling — bitta tokenga faqat bitta webhook ulanadi. |
| OpenAI kaliti (ixtiyoriy) | Ma'lumotlar markazidagi AI qidiruv uchun. |

---

## 1. DNS sozlash (birinchi qiling — tarqalishiga vaqt kerak)

Domen provayderingiz panelida:

```
Turi: A     Nomi: finance   Qiymati: <VPS_IP>     TTL: 300
```

Tekshirish (o'z kompyuteringizda):

```bash
dig +short finance.liberator.uz      # VPS IP chiqishi kerak
```

---

## 2. Serverni tekshirish — boshqa loyiha nimani egallagan?

Bu bosqich eng muhimi: natijasiga qarab 6-bosqichda **A** yoki **B** yoki **C** variantni tanlaysiz.

```bash
ssh deploy@<VPS_IP>

free -h                                   # bo'sh RAM (kamida 2 GB bo'sh bo'lsin)
df -h /                                   # bo'sh disk (kamida 10 GB)
docker version && docker compose version  # compose v2 bo'lishi kerak ("docker compose", tire'siz)
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
sudo ss -tlnp | grep -E ':(80|443|3000|3100)\b'
systemctl is-active nginx apache2 caddy 2>/dev/null
ls -ld /home/backend/ijro_nazorati      # papka egasi kim?
sudo ufw status
```

Natijani shunday o'qing:

| Ko'rganingiz | Variant |
|---|---|
| 80 va 443 portlar **bo'sh** | **A** — loyihadagi caddy ishlatiladi (eng oson) |
| 80/443 ni **host'dagi nginx** egallagan (`systemctl is-active nginx` → `active`) | **B** — mavjud nginx'ga yangi sayt qo'shiladi |
| 80/443 ni **host'dagi caddy** egallagan (`ss` da `"caddy"`, `systemctl is-active caddy` → `active`) — **bizning serverda shu holat** | **D** — mavjud caddy'ga yangi sayt qo'shiladi |
| 80/443 ni **Docker konteyner** egallagan (`docker ps` da nginx/caddy/traefik ko'rinadi) | **C** — o'sha konteynerli proxy'ga ulanadi |

Shuningdek tekshiring:
- Boshqa loyiha ham `/home/backend/` ichida bo'lsa — uning papkasiga tegmang, faqat
  `/home/backend/ijro_nazorati` ichida ishlang.
- `3100` porti bo'shmi (B/C variantda ilova shu portda ochiladi; band bo'lsa boshqasini oling).

---

## 3. Xavfsizlik (mavjud sozlamalarni buzmasdan)

Server allaqachon ishlab turgani uchun faqat **yetishmayotganini** qo'shing.

### 3.1 Firewall

```bash
sudo ufw status
```

- ufw **faol** bo'lsa — 80/443 ochiqligini tekshiring, yo'q bo'lsa qo'shing:
  ```bash
  sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 443/udp
  ```
- ufw **o'chiq** bo'lsa — yoqishdan oldin boshqa loyihaga kerakli **barcha** portlarni
  (SSH, 80, 443 va boshqalar) ochib oling, aks holda uni yoki SSH'ni uzib qo'yasiz.
  Ishonchingiz komil bo'lmasa — hozircha tegmang.

> Docker e'lon qilgan portlar ufw'dan chetlab ochiladi. Shuning uchun B/C variantda ilova
> porti faqat `127.0.0.1` ga bog'lanadi (tashqaridan ko'rinmaydi).

### 3.2 Kerakli dasturlar va vaqt zonasi

```bash
sudo apt update
sudo apt install -y git rsync sqlite3
timedatectl            # vaqt zonasi — ilova APP_TIMEZONE bilan o'zi ishlaydi, host'nikini o'zgartirish shart emas
```

### 3.3 Docker log hajmi

Loyihamizning loglari `docker-compose.override.yml` (6-bosqich) ichida cheklanadi —
`/etc/docker/daemon.json` ni o'zgartirish va Docker'ni qayta ishga tushirish **shart emas**
(bu boshqa loyihani ham to'xtatib qo'yardi).

---

## 4. Kod serverda — papka huquqlari

Kod allaqachon `/home/backend/ijro_nazorati` da turibdi. Lekin papka `backend`
foydalanuvchisiniki, siz esa `deploy` bo'lib ishlayapsiz — shuning uchun
`cp: cannot create regular file 'deploy/.env': Permission denied` xatosi chiqadi.

Egasini tekshiring:

```bash
id
ls -ld /home/backend/ijro_nazorati /home/backend/ijro_nazorati/deploy
```

Papkani `deploy` foydalanuvchisiga o'tkazing (bir marta):

```bash
sudo chown -R deploy:deploy /home/backend/ijro_nazorati
cd /home/backend/ijro_nazorati
git status        # ishlashini tekshirish
```

> Agar `git status` `detected dubious ownership` desa:
> `git config --global --add safe.directory /home/backend/ijro_nazorati`

### Keyinchalik yangilash uchun GitHub kaliti (repo private bo'lsa)

`git pull` ishlashi uchun `deploy` foydalanuvchisiga alohida kalit (boshqa loyihaning
kalitlariga tegmaydi):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/ijro_deploy -N ""
cat ~/.ssh/ijro_deploy.pub
```

Chiqqan kalitni GitHub → repo → **Settings → Deploy keys → Add deploy key** ga qo'shing
(faqat o'qish). So'ng:

```bash
cd /home/backend/ijro_nazorati
git remote set-url origin git@github.com:Muhiddin1408/ijro_nazorati.git
git config core.sshCommand "ssh -i ~/.ssh/ijro_deploy -o IdentitiesOnly=yes"
git pull          # ishlashini tekshirish
```

### Kodni rsync bilan yangilash (GitHub'siz)

```bash
# o'z kompyuteringizda, loyiha papkasida:
rsync -av --exclude node_modules --exclude .next --exclude .git --exclude .idea \
  --exclude runtime-data --exclude private-seed --exclude .sites-runtime \
  --exclude deploy/.env --exclude .env --exclude docker-compose.override.yml \
  ./ deploy@<VPS_IP>:/home/backend/ijro_nazorati/
```

> ⚠️ `runtime-data/` ni ko'chirmang — serverda **toza baza** bilan boshlanadi.
> `private-seed/` 7.2-bosqichda alohida yuklanadi.

---

## 5. Sozlamalar (`deploy/.env`)

```bash
cd /home/backend/ijro_nazorati
cp .env.example deploy/.env
chmod 600 deploy/.env
```

Maxfiy qiymatlarni yarating (har biri uchun alohida, **boshqa loyihanikini qayta ishlatmang**):

```bash
openssl rand -hex 32   # REMINDER_JOB_SECRET
openssl rand -hex 32   # TELEGRAM_WEBHOOK_SECRET
openssl rand -hex 32   # INFORMATION_INGEST_SECRET
```

`nano deploy/.env`:

```ini
DOMAIN=finance.liberator.uz
SITE_BASE_URL=https://finance.liberator.uz
APP_TIMEZONE=Asia/Tashkent

REMINDER_JOB_SECRET=<64 belgili qiymat>
TELEGRAM_WEBHOOK_SECRET=<64 belgili qiymat>
INFORMATION_INGEST_SECRET=<64 belgili qiymat>

# Telegram (ixtiyoriy, keyin ham qo'shsa bo'ladi)
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=

# AI qidiruv (ixtiyoriy)
OPENAI_API_KEY=
OPENAI_SEARCH_MODEL=gpt-4.1-mini
OPENAI_DAILY_REQUEST_LIMIT=200

# Zaxira nusxalar necha kun saqlanadi (standart 14)
# BACKUP_KEEP_DAYS=14
```

Muhim:
- `SITE_BASE_URL` albatta `https://...` bo'lsin — ilova cookie xavfsizligi va so'rov manbasi
  tekshiruvini shunga qarab qiladi (proxy qaysi bo'lishidan qat'i nazar).
- `REMINDER_JOB_SECRET` bo'sh bo'lsa — eslatmalar, hisobot davrlari va **kunlik zaxira
  nusxa ishlamaydi**.
- `DEV_IMPERSONATE_EMAIL` ni serverda **yozmang**.
- `deploy/.env` git'ga tushmaydi, nusxasini xavfsiz joyda saqlang.

---

## 6. Reverse proxy'ni tanlash va `docker-compose.override.yml`

Barcha variantlarda `/home/backend/ijro_nazorati/.env` faylini yarating — u Docker loyiha nomini aniq belgilaydi,
shunda konteyner/volume nomlari boshqa loyihaniki bilan hech qachon to'qnashmaydi:

```bash
echo "COMPOSE_PROJECT_NAME=ijro" > /home/backend/ijro_nazorati/.env
```

`docker-compose.override.yml` — `docker compose` uni avtomatik o'qiydi, asosiy
`docker-compose.yml` ni o'zgartirish shart emas (git pull'da konflikt bo'lmaydi).

### Variant A — 80/443 bo'sh: loyihadagi caddy

```bash
cat > /home/backend/ijro_nazorati/docker-compose.override.yml <<'EOF'
services:
  app:
    mem_limit: 1g
    logging: { driver: json-file, options: { max-size: "20m", max-file: "5" } }
  caddy:
    mem_limit: 256m
    logging: { driver: json-file, options: { max-size: "20m", max-file: "5" } }
EOF
```

Caddy HTTPS sertifikatini o'zi oladi. 7-bosqichga o'ting.

### Variant B — host'da nginx ishlayapti

Bizning caddy o'chiriladi (`profiles` orqali), ilova faqat `127.0.0.1:3100` da ochiladi,
mavjud nginx unga yo'naltiradi.

```bash
cat > /home/backend/ijro_nazorati/docker-compose.override.yml <<'EOF'
services:
  app:
    ports:
      - "127.0.0.1:3100:3000"
    mem_limit: 1g
    logging: { driver: json-file, options: { max-size: "20m", max-file: "5" } }
  caddy:
    profiles: ["caddy-disabled"]   # ishga tushmaydi, 80/443 ni egallamaydi
EOF
```

Nginx sayt konfiguratsiyasi — `/etc/nginx/sites-available/ijro`:

```nginx
server {
    listen 80;
    server_name finance.liberator.uz;

    client_max_body_size 600m;

    # Umumiy proxy sozlamalari
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    # Ilova login limitini shu sarlavha bo'yicha qiladi — mijoz yuborganini doim ustidan yozing.
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host  $host;
    # Tashqaridan kelgan identifikatsiya sarlavhalarini olib tashlash
    proxy_set_header Oai-Authenticated-User-Id "";
    proxy_set_header Oai-Authenticated-User-Email "";
    proxy_set_header Oai-Authenticated-User-Full-Name "";
    proxy_set_header Oai-Authenticated-User-Full-Name-Encoding "";

    # Chat (SSE) — bufersiz va uzoq ulanish
    location /api/chat/stream {
        proxy_pass http://127.0.0.1:3100;
        proxy_buffering off;
        proxy_cache off;
        gzip off;
        proxy_read_timeout 1h;
    }

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_read_timeout 300s;
        proxy_request_buffering off;   # katta fayllar to'g'ridan-to'g'ri uzatiladi
    }
}
```

Yoqish va HTTPS sertifikat:

```bash
sudo ln -s /etc/nginx/sites-available/ijro /etc/nginx/sites-enabled/ijro
sudo nginx -t                      # xato bo'lsa DAVOM ETMANG — boshqa sayt ham to'xtab qoladi
sudo systemctl reload nginx        # reload — restart emas, boshqa sayt uzilmaydi

sudo apt install -y certbot python3-certbot-nginx     # agar hali yo'q bo'lsa
sudo certbot --nginx -d finance.liberator.uz --redirect
```

Certbot `listen 443 ssl` qismini o'zi qo'shadi va avtomatik yangilaydi
(`systemctl list-timers | grep certbot`).

### Variant C — 80/443 ni boshqa loyihaning konteyneri (caddy/traefik/nginx) egallagan

Bizning caddy o'chiriladi va ilova o'sha proxy'ning Docker tarmog'iga ulanadi.

1. Proxy konteyner qaysi tarmoqda ekanini bilib oling:
   ```bash
   docker inspect <proxy_konteyner_nomi> --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'
   ```
   Masalan: `boshqaloyiha_default`.

2. Override:
   ```bash
   cat > /home/backend/ijro_nazorati/docker-compose.override.yml <<'EOF'
   services:
     app:
       mem_limit: 1g
       logging: { driver: json-file, options: { max-size: "20m", max-file: "5" } }
       networks: [default, shared_proxy]
     caddy:
       profiles: ["caddy-disabled"]
   networks:
     shared_proxy:
       external: true
       name: boshqaloyiha_default     # 1-qadamda topilgan nom
   EOF
   ```

3. O'sha proxy konfiguratsiyasiga yangi sayt qo'shing. Manzil: `ijro-app-1:3000`
   (konteyner nomi `docker compose ps` da ko'rinadi).
   - **Caddy** bo'lsa — uning Caddyfile'iga shu loyihadagi `deploy/Caddyfile` blokini
     nusxalang, `{$DOMAIN}` o'rniga domen, `app:3000` o'rniga `ijro-app-1:3000` yozing,
     so'ng `docker exec <caddy> caddy reload --config /etc/caddy/Caddyfile`.
   - **Nginx** konteyner bo'lsa — B variantdagi server blokini ishlating,
     `127.0.0.1:3100` o'rniga `ijro-app-1:3000`, so'ng `docker exec <nginx> nginx -t && docker exec <nginx> nginx -s reload`.
   - **Traefik** bo'lsa — app servisiga label'lar qo'shiladi; bu holda menga yozing,
     aniq konfiguratsiyani moslab beraman.

### Variant D — host'da caddy ishlayapti (vmi3620729 serverida shu)

`sudo ss -tlnp` da `*:80 ... users:(("caddy",...))` ko'rinadi, `systemctl is-active caddy` → `active`.
Bizning caddy konteyneri o'chiriladi, ilova `127.0.0.1:3100` da ochiladi, mavjud caddy unga yo'naltiradi.

**1. Override:**

```bash
cd /home/backend/ijro_nazorati
echo "COMPOSE_PROJECT_NAME=ijro" > .env
cat > docker-compose.override.yml <<'EOF'
services:
  app:
    ports:
      - "127.0.0.1:3100:3000"
    mem_limit: 1g
    logging: { driver: json-file, options: { max-size: "20m", max-file: "5" } }
  caddy:
    profiles: ["caddy-disabled"]   # ishga tushmaydi, 80/443 ni egallamaydi
EOF
docker compose rm -sf caddy       # avval yaratilgan bo'lsa
docker compose config --services  # faqat "app" chiqishi kerak
docker compose up -d
curl -s http://127.0.0.1:3100/api/health   # {"ok":true}
```

**2. Mavjud Caddyfile'ga sayt qo'shish** (avval nusxa olinadi, boshqa sayt blokiga tegilmaydi):

```bash
sudo cat /etc/caddy/Caddyfile                                   # boshqa loyiha sozlamasini ko'rib oling
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-$(date +%F-%H%M)

sudo tee -a /etc/caddy/Caddyfile >/dev/null <<'EOF'

finance.liberator.uz {
	@compressible not path /api/chat/stream
	encode @compressible zstd gzip
	request_body {
		max_size 600MB
	}
	reverse_proxy 127.0.0.1:3100 {
		# Ilova login limitini shu sarlavha bo'yicha qiladi.
		header_up X-Real-IP {remote_host}
		# Chat (SSE) va fayl yuklab olish bufersiz uzatiladi.
		flush_interval -1
		header_up -Oai-Authenticated-User-Id
		header_up -Oai-Authenticated-User-Email
		header_up -Oai-Authenticated-User-Full-Name
		header_up -Oai-Authenticated-User-Full-Name-Encoding
	}
}
EOF
```

Domen `finance.liberator.uz` — `deploy/.env` dagi `DOMAIN` va `SITE_BASE_URL` bilan bir xil bo'lishi shart.

**3. Tekshirib, qayta yuklash** (`reload` — boshqa sayt uzilmaydi):

```bash
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
# "Valid configuration" chiqsagina davom eting. Xato bo'lsa:
#   sudo cp /etc/caddy/Caddyfile.bak-... /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo journalctl -u caddy -n 50 --no-pager | grep -i -E "certificate|error"
curl -s https://finance.liberator.uz/api/health       # {"ok":true}
```

Caddy HTTPS sertifikatini domen uchun o'zi oladi (DNS A yozuvi serverga qaragan bo'lishi kerak).

> Qaysi variant ekanini aniqlay olmasangiz, 2-bosqich buyruqlari natijasini yuboring.

---

## 7. Ishga tushirish

```bash
cd /home/backend/ijro_nazorati
mkdir -p runtime-data
sudo chown 1000:1000 runtime-data     # konteyner ichidagi "node" foydalanuvchisi (uid 1000)

docker compose config --services      # A: app, caddy.  B/C: faqat app
docker compose build                  # 3–10 daqiqa; boshqa loyiha shu vaqtda sekinlashishi mumkin
docker compose up -d
docker compose ps                     # app: healthy
docker compose logs -f app            # "N migration(s) applied" va "Ready" chiqishi kerak
```

> Build CPU'ni qizitadi — boshqa loyiha faol ishlatiladigan bo'lsa, buni kam yuklangan
> vaqtda (kechqurun) qiling.

Tekshirish:

```bash
curl -s http://127.0.0.1:3100/api/health        # (B varianti) {"ok":true}
curl -s https://finance.liberator.uz/api/health      # {"ok":true}
docker ps                                       # boshqa loyiha konteynerlari ham ishlayaptimi?
```

Brauzerda `https://finance.liberator.uz` — qulf belgisi bilan ochilishi kerak. **Boshqa loyiha
saytini ham ochib tekshiring.**

### 7.1 Administrator

```bash
docker compose exec app node scripts/db.mjs admin tizim.admin
```

Chiqqan **vaqtinchalik parol** bilan kiring — birinchi kirishda almashtirish so'raladi.

### 7.2 Xodimlar ro'yxati (ixtiyoriy, bir marta)

To'liq yo'riqnoma: **`XODIMLARNI_SERVERGA_YUKLASH.md`** (zaxira nusxa, tekshiruv va tiklash bilan).
Qisqasi: `0016` va `0017` private seedlarini **asl nomlari bilan** `runtime-data/` ga ko'chirib,
tartib bilan `seed-private` orqali qo'llang, keyin fayllarni o'chiring.

### 7.3 Telegram bot (ixtiyoriy)

1. @BotFather → `/newbot` → **yangi** bot (boshqa loyihaning botini ishlatmang).
2. `deploy/.env` ga `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME` yozing.
3. `docker compose up -d`.
4. Admin panel → **Telegram → Webhook o'rnatish**.
5. Botga `/start` yozib tekshiring.

---

## 8. Zaxira nusxa (backup)

Ilova har kuni `runtime-data/backups/ijro-YYYY-MM-DD.sqlite` nusxasini o'zi oladi
(oxirgi 14 kun). Ular **shu serverda** — server yo'qolsa, nusxa ham yo'qoladi. Boshqa
joyga ko'chiring.

### 8.1 Boshqa serverga (rsync)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/ijro_backup -N ""
ssh-copy-id -i ~/.ssh/ijro_backup.pub backup@<ZAXIRA_SERVER>
crontab -e        # mavjud qatorlarni o'chirmang, pastga qo'shing
```

```cron
0 3 * * * rsync -a -e "ssh -i $HOME/.ssh/ijro_backup" /home/backend/ijro_nazorati/runtime-data/backups /home/backend/ijro_nazorati/runtime-data/storage backup@<ZAXIRA_SERVER>:/zaxira/ijro/ >> $HOME/ijro-backup.log 2>&1
```

Agar boshqa loyiha uchun zaxira tizimi allaqachon bor bo'lsa — unga
`/home/backend/ijro_nazorati/runtime-data/backups` va `/home/backend/ijro_nazorati/runtime-data/storage` papkalarini qo'shish kifoya.
(`ijro.sqlite` ning o'zini to'g'ridan-to'g'ri nusxalamang — ishlab turgan bazadan buzuq nusxa
chiqishi mumkin; `backups/` dagilar izchil.)

### 8.2 Tiklash

```bash
cd /home/backend/ijro_nazorati
docker compose stop app
cp runtime-data/backups/ijro-2026-10-01.sqlite runtime-data/ijro.sqlite
rm -f runtime-data/ijro.sqlite-wal runtime-data/ijro.sqlite-shm
sudo chown 1000:1000 runtime-data/ijro.sqlite
docker compose up -d
```

> Tiklashni oldindan bir marta sinab ko'ring.

---

## 9. Yangilash

To'liq yo'riqnoma (zaxira, tekshiruv, orqaga qaytish bilan): **`SERVERNI_YANGILASH.md`**.
Zaxira uchun oddiy `cp` emas, `VACUUM INTO` ishlatiladi: `runtime-data/` egasi `ubuntu`, `deploy` u yerga yoza olmaydi.

```bash
cd /home/backend/ijro_nazorati
# zaxira: SERVERNI_YANGILASH.md, 3-qadam
git pull
docker compose build
docker compose up -d                 # migratsiyalar avtomatik
docker compose logs -f app
curl -s https://finance.liberator.uz/api/health
docker image prune -f --filter "label=com.docker.compose.project=ijro"   # faqat bizning eski image'lar
```

> `docker image prune -a` yoki `docker system prune` ishlatmang — boshqa loyiha image'lari ham o'chib ketadi.

### Orqaga qaytish

```bash
git log --oneline -5
git checkout <oldingi_commit>
docker compose build && docker compose up -d
```

Yangi versiya migratsiya qo'llagan bo'lsa, yangilashdan oldingi zaxirani 8.2 dagidek tiklang.

---

## 10. Kundalik buyruqlar (faqat `/home/backend/ijro_nazorati` ichida)

```bash
cd /home/backend/ijro_nazorati
docker compose ps
docker compose logs -f --tail=200 app
docker compose restart app
docker compose stop / docker compose up -d     # faqat bizning konteynerlar
docker stats --no-stream                        # ikkala loyiha RAM/CPU
df -h && du -sh runtime-data/*
```

Parolni unutgan admin: `docker compose exec app node scripts/db.mjs admin tizim.admin`.

---

## 11. Monitoring

- **UptimeRobot** / **Better Stack** (bepul): `https://finance.liberator.uz/api/health` ni har
  5 daqiqada tekshirsin.
- `docker stats` bilan ikkala loyihaning RAM'ini kuzating. `mem_limit: 1g` ilovani
  cheklaydi — agar logda `OOM` / konteyner qayta-qayta o'chsa, `1536m` ga oshiring.
- `restart: unless-stopped` — server qayta yuklansa ilova o'zi ko'tariladi.

---

## 12. Muammolar va yechimlar

| Belgisi | Sabab / yechim |
|---|---|
| `docker compose up` → `port is already allocated` / `address already in use :80` | 80/443 band — A variant emas. 2-bosqichga qaytib B yoki C ni tanlang. |
| B: `curl 127.0.0.1:3100` ishlaydi, domen `502 Bad Gateway` | nginx konfiguratsiyasidagi port noto'g'ri yoki `nginx -t` / `reload` qilinmagan. |
| C: `502` | App proxy tarmog'iga ulanmagan: `docker network inspect <tarmoq>` da `ijro-app-1` bormi. |
| Login/saqlash `So'rov manbasi tasdiqlanmadi` (403) | `SITE_BASE_URL` brauzerdagi manzil bilan bir xil emas (https, www, port). |
| Chat xabarlari kechikib keladi | Proxy SSE'ni buferlayapti — B variantdagi `/api/chat/stream` blokini tekshiring. |
| Katta fayl `413` | nginx `client_max_body_size 600m` yo'q (yoki boshqa loyihaning umumiy sozlamasi kichik). |
| `SQLITE_CANTOPEN` / `EACCES` | `sudo chown -R 1000:1000 /home/backend/ijro_nazorati/runtime-data` |
| Logda `Scheduler disabled` | `REMINDER_JOB_SECRET` bo'sh. To'ldirib `docker compose up -d`. |
| Telegram xabar kelmaydi | Token/username; webhook qayta o'rnating; `docker compose logs app \| grep -i telegram`. |
| Boshqa loyiha sekinlashdi | `docker stats` — build tugaganmi; kerak bo'lsa `mem_limit` ni kamaytiring. |
| `.env` o'zgarishi kuchga kirmadi | `docker compose up -d` (restart emas). |

---

## 13. Yakuniy tekshiruv ro'yxati

- [ ] DNS A yozuvi VPS IP ga qaragan
- [ ] 2-bosqich bajarildi, variant (A / B / C) tanlandi
- [ ] `/home/backend/ijro_nazorati/.env` da `COMPOSE_PROJECT_NAME=ijro`
- [ ] `docker-compose.override.yml` tanlangan variantga mos
- [ ] `deploy/.env` to'ldirilgan, `chmod 600`, `SITE_BASE_URL=https://...`
- [ ] `runtime-data` egasi `1000:1000`
- [ ] `docker compose ps` — app **healthy**
- [ ] `https://DOMEN/api/health` → `{"ok":true}`, brauzerda qulf belgisi
- [ ] **Boshqa loyiha ham ishlayapti** (sayti ochiladi, `docker ps` da konteynerlari bor)
- [ ] Admin yaratildi, vaqtinchalik parol almashtirildi
- [ ] (ixtiyoriy) Xodimlar ro'yxati yuklandi (`XODIMLARNI_SERVERGA_YUKLASH.md`), `.sql` fayllar o'chirildi
- [ ] (ixtiyoriy) Alohida Telegram bot, webhook o'rnatildi
- [ ] Ertasi kuni `runtime-data/backups/` da nusxa paydo bo'ldi
- [ ] Zaxira boshqa joyga ketmoqda, tiklash bir marta sinab ko'rildi
- [ ] `deploy/.env` nusxasi xavfsiz joyda
- [ ] Uptime monitoring sozlangan
