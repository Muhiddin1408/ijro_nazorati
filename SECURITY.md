# Xavfsizlik va maxfiy ma’lumotlar

## Repozitoriy maxfiyligi

Ushbu loyiha xodimlarga oid shaxsiy ma’lumotlar va tashkilotning ichki tuzilmasini o‘z ichiga oladi. GitHub repozitori **private** holatda saqlanishi shart. Uni public qilish, fork yoki mirror ko‘rinishida ochiq joylashtirish taqiqlanadi.

Loginlar, vaqtinchalik parollar, bir martalik credential Excel fayli va `*_private_*.sql` migratsiyalari Git tarixiga kiritilmaydi. Tizim ma’lumotlar bazasida faqat PBKDF2 xesh va salt saqlaydi; ochiq parol faqat yaratilgan paytda bir marta ko‘rsatiladi.

PBKDF2-SHA256 ish koeffitsiyenti Cloudflare Workers WebCrypto chegarasiga mos qat’iy 100 000 iteratsiya. 100 000 dan farqli credentiallar hisoblashga yuborilmaydi va avtomatik yengilroq usulga o‘tilmaydi; akkaunt administrator orqali xavfsiz qayta chiqariladi.

## Birinchi administrator va vaqtinchalik parollar

- Birinchi administrator credentiali faqat deployment vaqtida alohida maxfiy migratsiya yoki himoyalangan provisioning jarayoni orqali beriladi.
- Vaqtinchalik parol birinchi kirishda majburiy almashtiriladi va amal qilish muddati tugagach qabul qilinmaydi.
- Vakant shtat uchun rezerv credential xodim lavozimga biriktirilmaguncha tizimga kira olmaydi.
- Credential Excel fayli faqat tegishli mas’ul shaxsga himoyalangan kanal orqali beriladi va tarqatish tugagach xavfsiz arxivga ko‘chiriladi yoki o‘chiriladi.

## Ishonchli autentifikatsiya proksisi

`TRUST_OAI_AUTHENTICATED_USER_HEADER=true` faqat tashqi foydalanuvchi yuborgan shu nomli headerni majburan olib tashlaydigan va kriptografik tekshirilgan identifikatorni o‘zi qo‘shadigan ishonchli reverse proxy ortida yoqilishi mumkin. Oddiy public origin, GitHub, Cloudflare yoki Vercel deploymentida bu shart isbotlanmagan bo‘lsa, parametr yoqilmaydi.

## Telegram bot siri

Telegram bot tokeni Git, Excel, log yoki brauzer bundle’iga yozilmaydi. Suhbat yoki boshqa ochiq kanalga yuborilgan token komprometatsiya qilingan deb hisoblanadi: BotFather orqali bekor qilinadi, yangisi yaratiladi va faqat deployment secret sifatida saqlanadi.

## Dependency auditi — 2026-08-11

`next -> postcss -> nanoid` tranzitiv yo‘lidagi `GHSA-2v37-7h3g-55p8` ogohlantirishi lockfile’da `nanoid` 3.3.18 versiyasiga yangilash orqali bartaraf etildi. CI `npm audit --omit=dev --audit-level=high` buyrug‘ini istisnosiz bajaradi va yangi `high` yoki `critical` muammo aniqlansa tekshiruvni to‘xtatadi.

## Incident talabi

Parol, bot tokeni yoki shaxsiy ma’lumot oshkor bo‘lsa: tegishli sir darhol bekor qilinadi/almashtiriladi, aktiv sessiyalar yopiladi, audit yozuvlari tekshiriladi va Git tarixiga tushgan bo‘lsa oddiy yangi commit bilan cheklanmay, tarixdan tozalash bo‘yicha alohida xavfsizlik jarayoni bajariladi.
