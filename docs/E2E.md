# Brauzer smoke testi (Playwright + axe-core)

`npm test` ga kirmaydi — ishlab turgan stekka qarshi ishlatiladi.

Tekshiradi (desktop 1440×900 va mobil 390×844):
login, bootstrap sikli yo'qligi, 8 ta asosiy sahifa, modal oyna a11y (fokus, Tab tuzog'i,
Escape), topshiriq formasi, kirill va rus rejimlari, axe WCAG 2 A/AA (serious/critical),
gorizontal siljish yo'qligi, JS xatolari yo'qligi. Skrinshotlar `E2E_OUT` papkasiga yoziladi.

```bash
docker compose up -d --build
docker compose exec app node scripts/db.mjs admin tizim.admin 'Sinov12345parol'

mkdir -p /tmp/e2e && cp tests/e2e/browser-smoke.mjs /tmp/e2e/ && cd /tmp/e2e
docker run --rm --network host -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.55.0-noble \
  bash -c "npm i playwright@1.55.0 axe-core@4.10.3 >/dev/null && E2E_OUT=/work node browser-smoke.mjs"
```

O'zgaruvchilar: `E2E_BASE_URL` (standart `https://localhost`), `E2E_LOGIN`, `E2E_PASSWORD`, `E2E_OUT`, `AXE_PATH`.
