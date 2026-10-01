# Xodimlarni serverga yuklash yo'riqnomasi

> **Server:** finance.liberator.uz, foydalanuvchi `deploy`
> **Loyiha papkasi:** `/home/backend/ijro_nazorati`
> **Nima yuklanadi:** Markaziy apparatning 77 xodimi (`Ходимлар.xlsx`): F.I.Sh. (lotin + kirill), lavozim,
> bo'lim, tug'ilgan sana, ichki va mobil telefon; har bir xodim shtatdagi lavozimiga bog'lanadi.
> **Vaqt:** ~10 daqiqa. Ilovani to'xtatish shart emas.

> ⚠️ **Server umumiy (boshqa loyihalar ham bor).** Barcha `docker compose` buyruqlarini faqat
> `/home/backend/ijro_nazorati` papkasida bajaring. `docker system prune`, `docker compose down`,
> `systemctl restart docker` kabi buyruqlarni ishlatmang.

---

## 0. Kerakli fayllar (sizning kompyuteringizda)

| Fayl | Mazmuni |
|---|---|
| `private-seed/0016_private_central_apparatus_employees.sql` | 77 xodim, profillar, bo'limlar, lavozim bandligi |
| `private-seed/0017_private_employees_xodimlar_update.sql` | `Ходимлар.xlsx` bo'yicha 3 ta kontakt tuzatishi |

Bu fayllarda shaxsiy ma'lumot bor: ular git'da yo'q, serverga faqat `scp` bilan ko'chiriladi
va ishdan keyin serverdan o'chiriladi.

**Fayl nomlarini o'zgartirmang.** Seed qayta qo'llanmasligi fayl nomi bo'yicha tekshiriladi:
ikkalasi bir xil nom bilan (masalan `seed.sql`) yuklansa, ikkinchisi "already applied" deb o'tkazib yuboriladi.

---

## 1. Fayllarni serverga ko'chirish (o'z kompyuteringizda)

Avval loyiha papkasiga o'ting (papka nomida bo'sh joy bor, qo'shtirnoq shart). `<VPS_IP>` o'rniga
server IP manzilini yozing:

```bash
cd "/home/user01/Downloads/Telegram Desktop/Ichki_hisobotlar_yakuniy_kod_2026-09-28/ijro-nazorati"
scp private-seed/0016_private_central_apparatus_employees.sql \
    private-seed/0017_private_employees_xodimlar_update.sql \
    deploy@<VPS_IP>:~/
```

Ikkala fayl uchun `100%` chiqishi kerak.

> Fayllar avval `deploy` ning uy papkasiga ko'chiriladi. `runtime-data/` ning egasi `ubuntu` (uid 1000,
> konteyner ham shu foydalanuvchi bilan ishlaydi), shuning uchun `deploy` unga to'g'ridan-to'g'ri yoza olmaydi.

## 2. Serverga kirish va holatni tekshirish

```bash
ssh deploy@<VPS_IP>
cd /home/backend/ijro_nazorati
docker compose ps                       # "app" — running (healthy) bo'lishi kerak
ls -l ~/00*_private_*.sql               # ikkala fayl kelganini tekshiring
sudo mv ~/00*_private_*.sql runtime-data/
sudo chown 1000:1000 runtime-data/00*_private_*.sql
sudo chmod 644 runtime-data/00*_private_*.sql
ls -l runtime-data/00*_private_*.sql    # ikkala fayl ko'rinishi kerak
```

Bazaning hozirgi holati (bu buyruqni 6-qadamda yana ishlatasiz):

```bash
docker compose exec -T app node --input-type=module <<'EOF'
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("/data/ijro.sqlite");
const one = (sql) => Object.values(db.prepare(sql).get())[0];
console.log("Qo'llangan seedlar:", db.prepare("SELECT name FROM _ijro_migrations WHERE name LIKE 'private:%'").all().map((r) => r.name).join(", ") || "yo'q");
console.log("Xodimlar:", one("SELECT count(*) FROM app_employees"));
console.log("Profillar:", one("SELECT count(*) FROM app_employee_profiles"));
console.log("Lavozim bandligi:", one("SELECT count(*) FROM app_position_occupancies WHERE ends_at IS NULL"));
console.log("Admin:", db.prepare("SELECT e.full_name || ' (' || COALESCE(u.username, 'loginsiz') || ')' AS a FROM app_employees e JOIN app_roles r ON r.id=e.role_id LEFT JOIN app_user_credentials u ON u.employee_id=e.id WHERE r.code='admin'").all().map((r) => r.a).join(", "));
EOF
```

Natijaga qarab:

| Ko'rgan natijangiz | Nima qilish kerak |
|---|---|
| Seedlar: `yo'q`, Xodimlar: `1` | Hammasi joyida, 3-qadamga o'ting |
| Seedlar ichida `0016` bor, `0017` yo'q | 4-qadamda faqat 0017 ni qo'llang |
| Ikkalasi ham bor | Xodimlar allaqachon yuklangan, 7-qadamga o'tib fayllarni o'chiring |
| Seedlar: `yo'q`, lekin Xodimlar `1` dan ko'p | **To'xtang.** Kimdir xodimlarni qo'lda kiritgan. Seed bir xil ismli xodimlarni o'tkazib yuboradi va ular profilsiz qoladi. Avval tekshirib oling |

## 3. Zaxira nusxa olish

```bash
docker compose exec -T app node --input-type=module <<'EOF'
import { DatabaseSync } from "node:sqlite";
const file = `/data/backups/ijro-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}-xodimlardan-oldin.sqlite`;
new DatabaseSync("/data/ijro.sqlite").exec(`VACUUM INTO '${file}'`);
console.log("Zaxira:", file);
EOF
ls -lh runtime-data/backups/ | tail -3    # yangi fayl ko'rinishi kerak
```

`VACUUM INTO` ilova ishlab turganda ham butun va izchil nusxa oladi.

## 4. Seedlarni qo'llash (tartib bilan: avval 0016, keyin 0017)

```bash
docker compose exec app node scripts/db.mjs seed-private /data/0016_private_central_apparatus_employees.sql
docker compose exec app node scripts/db.mjs seed-private /data/0017_private_employees_xodimlar_update.sql
```

Kutilgan natija:

```
applied private:0016_private_central_apparatus_employees.sql
applied private:0017_private_employees_xodimlar_update.sql
```

Har bir seed bitta tranzaksiyada bajariladi: xato bo'lsa, o'zgarish to'liq bekor qilinadi va baza
avvalgi holatida qoladi. Xato matnini saqlab, menga yuboring.

## 5. Ilovani qayta ishga tushirish shart emas

Ilova xodimlar ro'yxatini xotirada saqlamaydi, yangi ma'lumot darhol ko'rinadi.

## 6. Tekshirish

2-qadamdagi tekshiruv buyrug'ini qayta ishga tushiring. Kutilgan natija:

```
Qo'llangan seedlar: private:0016_private_central_apparatus_employees.sql, private:0017_private_employees_xodimlar_update.sql
Xodimlar: 77
Profillar: 77
Lavozim bandligi: 77
Admin: Nurmurodov Javoxir Juratovich (tizim.admin)
```

Brauzerda: https://finance.liberator.uz ga `tizim.admin` bilan kiring. **Xodimlar** bo'limida 77 xodim
bo'lishi kerak, **Shtat** bo'limida markaziy apparat lavozimlari band ko'rinishi kerak.

> ℹ️ Seed admin akkauntini **Nurmurodov Javoxir** xodim yozuviga bog'laydi. Login (`tizim.admin`) va
> parol o'zgarmaydi, faqat ekranda ko'rinadigan ism va lavozim almashadi.

## 7. Shaxsiy fayllarni serverdan o'chirish

```bash
sudo rm runtime-data/00*_private_*.sql
ls runtime-data/                          # .sql fayl qolmagan bo'lishi kerak
```

## 8. Keyingi qadam: xodimlarga login berish

Seed xodimlarga login yaratmaydi. Admin sifatida ilovaning lavozim loginlari bo'limidan login
yarating va xodimlarga tarqating. Har bir xodim birinchi kirishda parolini o'zgartiradi.

---

## Muammo bo'lsa: zaxiradan tiklash

Faqat natija noto'g'ri chiqsa kerak bo'ladi. Ilova 1–2 daqiqa ishlamay turadi.

```bash
cd /home/backend/ijro_nazorati
ls runtime-data/backups/                  # 3-qadamdagi fayl nomini toping
docker compose stop app
sudo cp runtime-data/backups/ijro-<SANA>-xodimlardan-oldin.sqlite runtime-data/ijro.sqlite
sudo rm -f runtime-data/ijro.sqlite-wal runtime-data/ijro.sqlite-shm
sudo chown 1000:1000 runtime-data/ijro.sqlite
docker compose start app
docker compose ps                         # app — healthy
```

## Tekshiruv ro'yxati

- [ ] 1. Ikkala `.sql` fayl serverdagi `runtime-data/` ga ko'chirildi
- [ ] 2. Boshlang'ich holat tekshirildi (seedlar yo'q, xodim 1 ta)
- [ ] 3. Zaxira nusxa `runtime-data/backups/` da paydo bo'ldi
- [ ] 4. `applied private:0016…` va `applied private:0017…` chiqdi
- [ ] 6. Xodimlar 77, profillar 77, lavozim bandligi 77; brauzerda ham ko'rindi
- [ ] 7. `.sql` fayllar serverdan o'chirildi
