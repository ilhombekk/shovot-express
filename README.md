# Shovot Express 🛒

Yandex Lavka kloni — Telegram Mini App + Web

## Stack
- **Frontend:** React 18 + Vite + Tailwind CSS + Zustand
- **Backend:** Node.js + Express + SQLite
- **Deploy:** Vercel (frontend) + Railway (backend)

## Boshlash

### 1. O'rnatish
```bash
npm run install:all
```

### 2. Backend sozlash
```bash
cd backend
cp .env.example .env
# .env faylda BOT_TOKEN va ADMIN_CHAT_ID ni to'ldiring
```

### 3. Ishga tushirish (ikkala server birga)
```bash
# Root papkada
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3001

## API

| Method | URL | Tavsif |
|--------|-----|--------|
| GET | /api/products | Barcha mahsulotlar |
| GET | /api/products?category=meva | Kategoriya bo'yicha |
| GET | /api/products?search=olma | Qidirish |
| POST | /api/products | Yangi mahsulot (admin) |
| PUT | /api/products/:id | Tahrirlash (admin) |
| GET | /api/categories | Kategoriyalar |
| POST | /api/orders | Buyurtma berish |
| GET | /api/orders | Barcha buyurtmalar (admin) |
| PATCH | /api/orders/:id/status | Status o'zgartirish |

## Deploy

### Frontend → Vercel
```bash
cd frontend
npm run build
# vercel.com ga push qiling
```

### Backend → Railway
```bash
# railway.app ga connect qiling
# Environment variables qo'shing
```

## Telegram Bot ulash
1. @BotFather → /newbot
2. BOT_TOKEN ni .env ga qo'shing
3. /newapp → frontend URL ni bering
4. ADMIN_CHAT_ID ni .env ga qo'shing
