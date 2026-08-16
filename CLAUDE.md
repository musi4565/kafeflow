# Hackathon loyihasi — 2 soatlik tezkor rejim

## Vaziyat
Bu loyiha hackathon doirasida qilinmoqda. Vaqt cheklangan — **atigi 2 soat**, mavzu sessiya boshida beriladi. Asosiy maqsad: ishlaydigan, ozoda demo qilsa bo'ladigan mahsulotni eng qisqa vaqtda yig'ish.

**Ish uslubi — tez VA sifatli, oshiqcha emas:**
- Uzoq tushuntirish, uzun reja yozish yoki ortiqcha muhokamaga vaqt sarflama — to'g'ridan-to'g'ri kodga o't.
- Lekin tezlik "shoshib xato qilish" degani emas — sinab ko'rmagan, ishlamaydigan kodni commit qilib qo'ymaslik kerak. Har bir katta qadamdan keyin tezda tekshirib (ishga tushirib) ko'r, keyin davom et.
- Loyiha qamrovini **kichik ushla** — juda katta, ko'p feature'li narsa qurishga urinma. 1-2 ta asosiy funksiya to'liq va toza ishlasin — bu 10 ta yarim-ishlaydigan feature'dan yaxshiroq.
- Scope o'sib ketsa (feature creep), o'zingga savol ber: "bu demo uchun majburiymi?" — yo'q bo'lsa, tashlab ket.

**To'liq vakolat — keraksiz savol berma:** Foydalanuvchi standart qarorlar (texnologik tanlov, keyinroq to'ldiriladigan credential'lar, ichki struktura kabi) uchun to'liq vakolat beradi. O'zing oqilona qaror qabul qilib darhol boshla; to'xtab tasdiq so'rash faqat quyidagi holatlarda: (1) qaror qaytarib bo'lmaydigan yoki xarajat/xavf tug'diradigan bo'lsa (masalan real deploy, pullik xizmat), yoki (2) loyiha qamrovini yoki yo'nalishini tubdan o'zgartiradigan strategik tanlov bo'lsa va standart yo'q bo'lsa. Aks holda savol berib vaqt yo'qotma.

## Tezkor checklist (vaqt bo'yicha)
Bosim ostida uzun matnni o'qishga vaqt yo'q — shuning uchun avval shu checkpointlarga qara, tafsilotlar pastdagi bo'limlarda:

- **0–10 daqiqa:** mavzuni o'qi, kerakli qism(lar)ni aniqla (landing / web / backend / bot — hammasi shart emas, mavzuga qarab), papka tuzilishini bel (`/backend`, `/web`, `/landing`, `/bot`), muhitni tezda tekshir (`node -v`, kerakli portlar band emasmi, mongod/opencode bormi), mustaqil qismlarni subagent/opencode'ga taqsimlashni rejalashtir va darhol boshla.
- **10–90 daqiqa:** qur — har bosqichdan keyin ishga tushirib sina, ishlagan checkpointda git commit qil.
- **90–110 daqiqa:** integratsiya, backend+frontend deploy, UI polish (loading/empty/error, responsive), README.
- **110–120 daqiqa:** yakuniy tekshiruv (pastga qara: "Muvaffaqiyatsizlikka qarshi choralar"), screenshot/GIF, taqdimotga tayyor bo'l.

## Muvaffaqiyatsizlikka qarshi choralar
Bu bo'lim demo paytida "pand yemaslik" uchun — hackathonlarda ko'p ball vaqt tugashi yoki oxirgi daqiqada nimadir buzilishidan yo'qoladi, funksiya yetishmasligidan emas:

- **Git checkpointlari:** loyiha boshida `git init` qil, har bir ishlaydigan bosqichdan keyin commit qil (masalan "backend CRUD ishladi", "items sahifasi ishladi"). Oxirgi daqiqalarda nimadir buzilsa — tez orqaga qaytarish imkoni bo'lsin.
- **Muhit preflight:** ishni boshlashdan oldin kerakli versiyalar/portlar/vositalarni tezda tekshir (masalan `lsof -i :PORT` band portni oldindan aniqlash uchun) — band port yoki versiya nomuvofiqligi bilan o'rtada vaqt yo'qotma.
- **Fayl/papka gigienasi:** muhim fayllar (ayniqsa `CLAUDE.md`) oddiy, toza nomlarda bo'lsin — nomda ko'rinmas belgilar (non-breaking space va h.k.) vositalarni buzishi mumkin.
- **Demo oldidan yakuniy tekshiruv (oxirgi ~10 daqiqa):** live URL'ni **yangi/incognito** oynada och (lokal kesh aldamasin), asosiy foydalanuvchi oqimini boshidan oxirigacha qo'lda sinab ko'r, brauzer konsolida xato yo'qligini tekshir, mobil o'lchamda ham qara.
- **Zaxira reja:** live deploy demo paytida ishlamay qolishi mumkinligidan xavotirlansang — oldindan tayyorlangan qisqa GIF/screenshot zaxira sifatida qo'lda tursin.
- **Ruxsat rejimi:** agar sessiya har bir bash/tool chaqiruvida alohida tasdiq so'rayotgan bo'lsa, ishning boshida foydalanuvchidan erkinroq ruxsat rejimiga (masalan "accept edits"/"bypass permissions") o'tishni so'ra — vakolat allaqachon berilgan, har bir buyruqqa alohida to'xtash faqat vaqt yeydi.
- **Yarim ishlagan narsani yashir:** vaqt tugab, biror narsa to'liq tuzatilmasa — uni UI'dan olib tashla yoki yashir. Judalarga ishlamayotgan tugma ko'rsatish, o'sha feature umuman bo'lmaganidan yomonroq taassurot qoldiradi.

## Qo'shimcha ball strategiyasi (bonus)
Katta yangi narsa qo'shish o'rniga, **tez-tez qo'shsa bo'ladigan, arzon lekin ko'zga tashlanadigan** narsalarga vaqt ajrat:
- Live deploy qilingan link (ishlaydigan demo — juri buni birinchi tekshiradi)
- Qisqa, aniq README (nima qilingani, qanday ishga tushiriladi, stack)
- Asosiy xatoliklarni ushlash (error handling) — crash bo'lmasin
- Loading/empty/error holatlari UI'da ko'rsatilsin (frontend uchun)
- Responsive dizayn (mobil ham ishlasin)
- .env.example fayli, aniq setup qadamlari
- Bittagina screenshot yoki qisqa GIF (agar vaqt qolsa)

Bularning har biri kam vaqt oladi, lekin taassurotga katta ta'sir qiladi — prioritet shu.

## Tech stack
- Til: **JavaScript / TypeScript** (asosiy)
- Backend DB: **MongoDB**
- Backend deploy: **Render**
- Frontend deploy: **Vercel**

Standart tanlovlar (aniq tayinlanmasa, shulardan boshla — vaqt tejash uchun):
- Frontend: Next.js (Vercel bilan eng silliq integratsiya) yoki oddiy Vite + React (agar faqat landing bo'lsa)
- Backend: Express + Mongoose (Render'da tez deploy qilinadi)
- Auth kerak bo'lsa: soddaroq yechim (masalan JWT) — murakkab auth provayderlarga vaqt ketkazma, agar shart bo'lmasa

## Loyiha turi bo'yicha tezkor yondashuv
Mavzu ma'lum bo'lgach, quyidagilardan qaysi biriga to'g'ri kelishini aniqlab, shunga mos boshla:

- **Website / landing** — statik/kam-dinamik, faqat tanishtiruv/marketing maqsadida (mahsulotni tushuntiradi va "sotadi"). Next.js yoki Vite + React. Backend shart emas. Vercel'ga bitta buyruq bilan deploy.
- **App (full-stack) / "web"** — mahsulotning o'zi, funksional ilova: frontend (Vercel) + backend (Render) + MongoDB. Avval backend'ning minimal API'sini (CRUD) tez qur, keyin frontend'ni ula.
- **Bot** (Telegram/Discord va h.k.) — Node.js skript, Render'da "Background Worker" yoki "Web Service" sifatida deploy qilinadi (webhook kerak bo'lsa web service). MongoDB — foydalanuvchi/holat saqlash uchun.
- **Backend (faqat API)** — Express + Mongoose, Render'ga deploy. Postman/curl bilan tez tekshirib bor.

**"Landing" va "web" alohida-alohida so'ralsa** (masalan "web va landing bo'lishi kerak"), ularni **ikkita mustaqil loyiha** sifatida qur, bitta ilovaga qo'shib yuborma:
- **landing** — tanishtiruv/marketing sayti: hero, xususiyatlar, "qanday ishlaydi", CTA (asosiy "web"ga va botga link), footer. Referens uslub: hisvex-landing.vercel.app kabi professional SaaS landing.
- **web** — mahsulotning o'zi (asosiy funksional ilova, ro'yxat/forma/CRUD va h.k.). Referens uslub: hisvex-web.vercel.app.
Ikkalasi ham alohida papka, alohida `package.json`, alohida Vercel deploy sifatida qurilishi kerak; landing'dagi CTA tugmalar web ilova manziliga (env orqali) link qiladi.

## Tezlik uchun kuch multiplikatorlari: opencode + AI subagentlar

Hackathonda eng katta cheklov — **vaqt va e'tibor**, token emas. Shu sabab ikkita vositani **samarali va faol** ishlat: `opencode` CLI (boilerplate uchun) va Claude Code'ning `Agent` vositasi (mustaqil qismlarni parallel qurish uchun). Ikkalasi ham majburiy emas — har safar o'zingga savol ber: *"buni shu vosita orqali qilish meni tezroq va sifatliroq natijaga olib boradimi?"* Agar ha bo'lsa, ishlat; ikkilanib, "o'zim yozganim ishonchliroq" deb har doim qo'lda yozishga qaytib ketma — bu tez-tez sodir bo'ladigan xato.

### AI subagentlar (Agent tool) — mustaqil qismlarni parallel qur
Loyiha bir nechta mustaqil qismga bo'linadigan bo'lsa (masalan **landing / web / backend / bot**, yoki bir nechta mustaqil feature), ish boshida — birinchi 10 daqiqada — qismlarga bo'l va mustaqil qismlarni fon rejimidagi (`run_in_background: true`) subagentlarga bir vaqtda topshir, shu payt o'zing eng murakkab/integratsion qismda (arxitektura, ikkita qismni bog'lash, debugging) qol. Har bir subagentga aniq kontekst va aniq chegara (qaysi papkaga tegishi, qaysi papkaga tegmasligi) ber. Subagent natijasini — xuddi opencode natijasi kabi — integratsiyadan oldin ko'rib chiqib, ishga tushirib sinash kerak.

### opencode
Mashinada `opencode` CLI o'rnatilgan (`/Users/dilbek/.opencode/bin/opencode`, v1.18.13). Alohida dastur — o'z (bepul) modellaridan foydalanadi, Claude tokenlarini yemaydi.

**Mavjud modellar (bepul):**
```
opencode/big-pickle
opencode/deepseek-v4-flash-free
opencode/hy3-free
opencode/laguna-s-2.1-free
opencode/ling-3.0-tiny-free
opencode/mimo-v2.5-free
opencode/nemotron-3-ultra-free
opencode/nemotron-3.5-lightning-free
```
(Yangilash: `opencode models`)

**Sintaksis:**
```bash
opencode run "vazifa matni" --format json --model opencode/big-pickle
```
Fonda ishga tushirish uchun Bash'da `run_in_background: true` bilan chaqir, boshqa ishni davom ettir, keyin natijani o'qi.

**MUHIM QOIDA — "tez" "ehtiyotsiz" degani emas:**
opencode'ga berilgan har bir natijani **ishlatishdan oldin albatta ko'zdan kechir va sinab ko'r**. Ko'rmasdan, tekshirmasdan loyihaga qo'shib qo'yish — vaqtni tejamaydi, aksincha keyinroq debugging'ga ko'proq vaqt yeydi (2 soatda bu qimmatga tushadi). Ya'ni oqim shunday:
1. opencode'ga aniq, tor doiradagi vazifa ber (masalan "shu strukturada 5ta CRUD endpoint yoz", "shu komponentlar uchun skelet yarat")
2. Natijani tez ko'rib chiq — importlar to'g'rimi, mantiq mos keladimi
3. Loyihaga qo'shib, **darhol ishga tushirib tekshir** (build/run/curl)
4. Xato bo'lsa — o'zim (Claude) tuzataman, opencode'ga qayta-qayta "tuzat" deb ketma-ket berib vaqt sarflamayman

**Nimalarni opencode'ga berish kerak (mos, past-riskli ishlar):**
- Boilerplate/skelet kod (CRUD endpoint shabloni, komponent shablonlari)
- Takrorlanuvchi fayllar (bir xil strukturadagi ko'p komponent/route/model)
- Oddiy config, README qoralamasi, test shablonlari
- Mock data, seed skriptlari

**Nimani o'zim (Claude) qilishim kerak:**
- Arxitektura qarori, murakkab mantiq, integratsiya, debugging
- opencode natijasini review qilish va sinash
- Deploy jarayoni (Vercel/Render) va muhim vaqt-tanqisligi qarorlari
- Scope'ni kichik ushlab turish qarori

**Parallel strategiya:** Bir nechta mustaqil, oddiy sub-vazifani (masalan "frontend komponentlar skeleti" + "backend model fayllari") bir vaqtda fon rejimida opencode'ga berib, shu payt o'zim asosiy/qiyin logikani yozib borish — umumiy vaqtni qisqartiradi. Lekin parallel ishlarni ham navbat bilan tekshirib chiqish shart — nazoratsiz qo'shib ketmaslik kerak.

### Brauzer va tashqi resurslar
Referens dizayn ko'rish, kutubxona docs'ini tekshirish yoki boshqa vosita/sayt kerak bo'lsa — ruxsat so'ramasdan brauzerdan mustaqil foydalanish mumkin. Mavjud xavfsizlik siyosati (login/parol/to'lov ma'lumotlarini kiritmaslik, hisob yaratmaslik va h.k.) baribir amal qiladi.

## Deploy tezkor cheklist
- **Backend (Render):** `render.yaml` yoki qo'lda web service, `PORT` env'dan o'qilishi kerak, MongoDB connection string env variable orqali (`.env`, Render dashboard'da qo'shiladi)
- **Frontend (Vercel):** `vercel deploy` yoki GitHub repo ulab avtomatik deploy; backend URL'ni env variable (`NEXT_PUBLIC_API_URL` va h.k.) orqali ber
- Ikkalasini ham **vaqtida** (oxirgi 15 daqiqaga qoldirmasdan) deploy qilib, ishlashini tekshirib qo'yish kerak — juri live link'ni tekshiradi
- Render'ning bepul tarifida backend "sovib qolishi" (cold start) mumkin — demo oldidan bir marta URL'ga so'rov yuborib "isitib qo'y"
- Yakuniy tekshiruv tartibi uchun yuqoridagi "Muvaffaqiyatsizlikka qarshi choralar" bo'limiga qara

## Eslatma
Bu fayl loyiha ildiziga `CLAUDE.md` nomi bilan qo'yilsa, Claude Code sessiya boshida uni avtomatik o'qiydi — qayta tushuntirishga hojat qolmaydi.
