# KafeFlow

Kichik mahalla kafesi uchun hackathon MVP: **QR → Menyu → Buyurtma → Oshxona → To'lov → Ombor → Egasi hisoboti**, real vaqtda (Socket.IO) va Telegram bot bildirishnomalari bilan.

## Jonli havolalar

- Sayt: https://kafeflow-web.onrender.com
- Backend API: https://kafeflow-backend.onrender.com/api/health

> Render'ning bepul tarifi ishlatilgan — backend bir necha daqiqa foydalanilmasa "uxlab qoladi". Birinchi so'rov 30–50 soniya cho'zilishi mumkin (cold start).

## Demo login

- Egasi: `owner@kafeflow.uz` / `123456`
- Ofitsiant: `waiter@kafeflow.uz` / `123456`
- Oshxona: alohida login shart emas — `/oshxona`
- Mijoz: QR orqali `/menyu?stol=04`

## Tech stack

| Qism | Texnologiya |
|---|---|
| Frontend | React + TypeScript + Vite, Tailwind CSS, Framer Motion, React Router, Lucide React |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Real-time | Socket.IO |
| Telegram | Telegraf |
| Deploy | Render (backend: Web Service, frontend: Static Site, DB: PostgreSQL) |

## Loyiha tuzilishi

```
backend/   Express API, Prisma sxema, Socket.IO, Telegram bot
web/       React + Vite frontend (landing, menyu, oshxona, ofitsiant, egasi)
```

## Lokal ishga tushirish

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # DATABASE_URL (Postgres), JWT_SECRET va h.k. to'ldiring
npx prisma db push        # sxemani bazaga qo'llash
npm run seed               # demo ma'lumotlar (stollar, mahsulotlar, userlar)
npm run dev                 # http://localhost:5000
```

### 2. Frontend

```bash
cd web
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:5000
npm run dev                   # http://localhost:5174
```

### 3. Telegram bot (ixtiyoriy)

`backend/.env` ichida:

```
TELEGRAM_BOT_TOKEN=<@BotFather'dan olingan token>
TELEGRAM_CHAT_ID=<xabar yuboriladigan chat ID>
```

Token berilmasa, backend avtomatik **mock-notification** rejimida ishlaydi — xabarlar konsolga chiqadi va `Notification` jadvaliga yoziladi, tizim to'liq ishlashda davom etadi.

## Asosiy business flow

1. Mijoz QR orqali `/menyu?stol=04` sahifasini ochadi, savatga mahsulot qo'shadi.
2. "Buyurtma berish" bosilganda backend `ORD-XXX` bilan buyurtma yaratadi, stol **band** bo'ladi, Telegramga xabar ketadi.
3. Mijoz 3 daqiqa ichida buyurtmani bekor qilishi mumkin — vaqt backendda `createdAt` orqali tekshiriladi (frontend timeriga ishonilmaydi).
4. Oshxona (`/oshxona`) buyurtmani "Tayyorlanmoqda" → "Tayyor" qiladi — bu real vaqtda mijoz va ofitsiant ekranlarida ko'rinadi.
5. Ofitsiant (`/ofitsiant`) to'lovni qabul qiladi → ombor kamayadi, stol bo'shaydi, egasi tushumi yangilanadi, Telegramga xabar ketadi.
6. Egasi (`/egasi`) kundalik tushum, buyurtmalar, ombor holatini ko'radi.

## API

| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/api/menu` | Menyu va kategoriyalar |
| GET | `/api/tables` | Stollar holati |
| POST | `/api/orders` | Yangi buyurtma |
| GET | `/api/orders?status=` | Buyurtmalar ro'yxati (oshxona uchun) |
| GET | `/api/orders/:id` | Buyurtma tafsiloti |
| PATCH | `/api/orders/:id/status` | Holatni yangilash (oshxona) |
| POST | `/api/orders/:id/cancel` | 3 daqiqa ichida bekor qilish |
| POST | `/api/orders/:id/payment` | To'lovni qabul qilish |
| GET | `/api/dashboard` | Egasi uchun kunlik hisobot |
| GET | `/api/inventory` | Ombor holati |
| POST | `/api/auth/login` | Egasi/ofitsiant kirishi |

## Deploy

Backend va frontend Render'ga GitHub repo orqali ulangan (`autoDeploy: yes`) — `main` branchga push qilinganda avtomatik qayta deploy bo'ladi. Ma'lumotlar bazasi — umumiy Render PostgreSQL instansiyasida alohida `kafeflow` schema.
