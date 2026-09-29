# Jadval va hisobotlar mantiqi — 2026-09-17

## Tuzatilgan holatlar

- Davriy hisobot qoralamasini majburiy kataklar hali to‘liq bo‘lmaganida saqlash mumkin. Yuborishda har bir to‘ldirilgan qator qayta tekshiriladi va xato qator/ustun bilan ko‘rsatiladi.
- Tekshiruvchi hisobotning birlamchi qatorlarini o‘qish rejimida ochadi. Yuborilgan yoki tasdiqlangan hisobotning qatorlari va dalil fayllarini o‘zgartirish bloklanadi.
- Saqlash, yuborish, qaytarish, tasdiqlash va fayl o‘zgarishlari versiya bilan himoyalangan. Eskirgan oynadan yozish 409 javobini qaytaradi. Qatorlar, audit va holat o‘zgarishlari bitta tranzaksiyada bajariladi.
- Hisobot yaratishni qayta urinish bir xil requestId bilan avvalgi shaklni qaytaradi. Fayl yuklash muvaffaqiyatsiz bo‘lsa, yaratilgan shaklni takror yaratmasdan faylni qayta yuklash mumkin.
- Saqlash/import paytida shakl va yopish amallari bloklanadi; tahrirlangan shaklni tashlab chiqishda ogohlantirish bor. Mas’ul xodim tashkilot bo‘yicha qidiriladi.
- Excel importi O‘zbekiston vaqt mintaqasida sanani siljitmaydi; 1900 va 1904 sana tizimlari hisobga olinadi. Takroriy ustunlar, qator chegarasi va noto‘g‘ri qiymatlar tekshiriladi. TSV joylash ko‘p qatorli va qo‘shtirnoqli kataklarni saqlaydi.
- Excel eksportida ko‘p qiymatli maydonlar oddiy matn sifatida yoziladi. O‘rtacha qiymatlar haqiqiy kataklar soni bilan, o‘rtacha ish haqi esa jami fond/jami xodimlar asosida hisoblanadi.
- Katta hisobot ro‘yxati 500 tadan sahifalanadi. To‘liq ma’lumot yuklanmaguncha umumiy svod eksporti faollashmaydi.
- Axborot yozuvining tasdiqlash zanjiri, joriy bosqichi va nazorat xatolari kartochkada ko‘rinadi. Tahrirlash vakolati serverda qayta tekshiriladi; tasdiqlash yo‘nalishi yozuvning asl tashkiloti asosida tuziladi.
- Takroriy biznes kalitlari yuborilgan va nashr qilingan yozuvlar uchun band qilinadi. Qoralama/qaytarilgan yozuvlar kalitni band qilmaydi; demo va haqiqiy yozuvlar ajratiladi. Parallel yuborishda faqat bitta nusxa saqlanadi.
- Tadbir sanasi/joyi, sertifikat nomi/darajasi/raqami va boshlanish/yakun sanalari uchun alohida maydonlar qo‘shildi. Eski maydonlar va fayl bog‘lanishlari saqlanadi.
- Qaytarilgan ilmiy tadqiqot bosqichi avvalgi natija, KPI, xarajat va tekshiruvchi izohi bilan tahrirga ochiladi. Ilmiy tadqiqotlar mavjud Hisobotlar bo‘limida qoladi.

## Migratsiyalar va API

- `0027_report_edit_safety.sql`: topshiriq versiyasi va tranzaksiya belgisi.
- `0028_information_business_keys.sql`: faol yozuvlar kalitini atomar band qilish.
- `0029_information_form_shapes.sql`: mavjud katalog shakllarini ma’lumotni o‘chirmasdan tuzatish.
- Hisobot/axborot PATCH so‘rovlarida `expectedVersion`; tegishli fayl o‘zgarishlarida `X-Record-Version` talab qilinadi. Muvaffaqiyatli javobdagi yangi versiyadan foydalanish kerak.
- 409 olganda eski qiymatlarni avtomatik qayta yuborish mumkin emas: yangi holatni yuklab, o‘zgarishlarni solishtirish kerak.

## Tekshiruv dalillari

- `npm run lint`: xatosiz.
- `tsc --noEmit --incremental false`: xatosiz.
- Sites build va artifact tekshiruvi: muvaffaqiyatli.
- `node --test tests/*.test.mjs`: **109/109 o‘tdi**, tashlab ketilgan test yo‘q.
- Shundan 18 yangi sinov jadval, import/eksport, parallel yozish, fayl uzilishi, takroriy kalit va sahifalashni qamraydi. Haqiqiy route handlerlar barcha SQL migratsiyalari qo‘llangan vaqtinchalik SQLite bazasida ishga tushiriladi; autentifikatsiya, R2 va tashqi xabar yuborish test muhitida almashtiriladi.

## Kutubxonalar auditi

GitHub CI qo‘shimcha auditida aniqlangan bog‘liqliklar yangilandi: Next.js va eslint-config-next — 16.3.5, sharp — 0.35.4, baseline-browser-mapping — 2.11.0. Lockfile aniq versiya va tarball yaxlitligini saqlaydi; CI audit talabi o‘chirilmagan yoki yumshatilmagan.

Tegishli e’lonlar: [Next.js AVIF](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4), [sharp/libheif](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c), [baseline-browser-mapping](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv).

Bu natija tekshirilgan holatlarga tegishli. Ushbu tekshiruvda brauzer orqali jonli foydalanuvchi seansi va real tashqi integratsiyalar bo‘yicha yakuniy sinov bajarilmagan. Avvalgi arxitektura va integratsiya rejalari `KNOWN_LIMITATIONS.md` da saqlanadi.
