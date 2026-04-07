# ONE STYLE FOREVER

Nuxt 4 e-commerce storefront with checkout, admin panel, multilingual UI, and Supabase backend for orders.

## 1) Install

```bash
npm install
```

## 2) Configure Environment

Create `.env` from template:

```bash
cp .env.example .env
```

Required variables:

- `NUXT_ADMIN_KEY` - key for `/admin` access
- `NUXT_SUPABASE_URL` - Supabase project URL
- `NUXT_SUPABASE_SERVICE_ROLE_KEY` - server-only service role key
- `NUXT_TELEGRAM_BOT_TOKEN` - Telegram bot token for order notifications
- `NUXT_TELEGRAM_CHAT_ID` - Telegram chat ID for order notifications
- `NUXT_RESEND_API_KEY` - Resend API key
- `NUXT_ORDER_EMAIL_TO` - where order notifications are sent
- `NUXT_ORDER_EMAIL_FROM` - sender email

## 3) Prepare Supabase Database

Open Supabase SQL Editor and run:

`supabase/schema.sql`

This creates:

- `orders`
- `order_items`
- `order_status_history`
- `product_inventory`
- indexes + update trigger

## 4) Run Project

```bash
npm run dev
```

App: `http://localhost:3000`  
Admin: `http://localhost:3000/admin`

## 5) Production Build

```bash
npm run build
npm run preview
```

## Backend Notes

- Orders are saved in Supabase from `POST /api/order`
- Order stock is atomically reserved from `product_inventory` before order save
- Admin list: `GET /api/admin/orders`
- Admin status update: `PATCH /api/admin/orders/:id`
- Admin login: `POST /api/admin/session/login` (creates HttpOnly session cookie)
- Admin logout: `POST /api/admin/session/logout`
- Admin session check: `GET /api/admin/session/me`
- Public inventory snapshot: `GET /api/inventory`
- Admin routes use server session cookie + `x-csrf-token` (double-check protection)
- `POST /api/order` has basic rate limit by IP (anti-spam)
- Server uses Supabase service role key, so keep it private (never expose in client code)
