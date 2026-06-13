# Hyderabad Online Shopping 🕌

A full-stack Amazon-like online shopping app themed around Hyderabad — featuring biryani spices, pearls, Bidriware, Ikat textiles, and more.

## Tech Stack (100% open-source / free hosting)

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React.js, React Router, Context API |
| Backend   | ASP.NET Core 10 Web API (C#)        |
| ORM       | Entity Framework Core + Npgsql      |
| Database  | PostgreSQL (local) / Neon (cloud)   |
| Auth      | JWT Bearer tokens                   |
| Hosting   | Frontend → GitHub Pages · Backend → Render · DB → Neon |

---

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [PostgreSQL 16](https://www.postgresql.org/download/) (local) **or** a free [Neon](https://neon.tech) database (cloud)

---

## Backend Setup

### 1. Configure the connection string

The app reads the database connection from the `DATABASE_URL` environment
variable (used in production), falling back to `DefaultConnection` in
`appsettings.json` for local development:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=hyderabadonlineshopping;Username=postgres;Password=postgres"
}
```

Both URI form (`postgres://user:pass@host/db`, as Neon/Render provide) and
key=value form are accepted.

### 2. Apply migrations & seed data

```bash
cd backend/HyderabadBazaar.API
dotnet ef database update
```

This creates all tables and seeds 20 Hyderabadi products across 6 categories.
(The app also auto-migrates on startup, so this is optional.)

### 3. Run the API

```bash
dotnet run
```

Swagger UI: `http://localhost:5037/swagger`

---

## Cloud Deployment (free, single provider)

### Backend + Database — Render (one click)
1. At [render.com](https://render.com) → **New → Blueprint**, connect this repo.
2. Render reads [`render.yaml`](render.yaml) and provisions **both**:
   - a managed **PostgreSQL** database (`hyderabad-db`)
   - the **API** Docker web service — with `DATABASE_URL` wired in automatically
     and a `Jwt__Key` secret generated for you.
3. Click **Apply**. The API auto-migrates and seeds on first boot.
   URL: `https://hyderabad-online-shopping-api.onrender.com`

> Render's free PostgreSQL is free for 30 days, then needs a paid plan. For a
> no-expiry free Postgres, create a [Neon](https://neon.tech) DB instead and
> set `DATABASE_URL` manually on the Render service (the code is identical —
> it accepts any `postgres://` URL).

### Frontend — GitHub Pages
- Served from the `main` branch `/docs` folder (already built).
- Update `frontend/.env.production` with your Render URL if the service name differs, then rebuild.

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure API URL

Edit `frontend/.env`:
```
REACT_APP_API_URL=https://localhost:7001/api
```

### 3. Start the dev server

```bash
npm start
```

App runs at `http://localhost:3000`.

---

## Features

- 🛍️ **Home** — hero banner, category grid, deals, top-rated products
- 🔍 **Product listing** — search, filter (price/rating), sort, pagination
- 📦 **Product detail** — images, description, add to cart / buy now
- 🛒 **Cart** — quantity controls, savings display, checkout flow
- 💳 **Checkout** — address form, 4 payment methods (mock)
- ✅ **Order confirmation** — order ID, status steps
- 📋 **My orders** — full order history with status badges
- 🔐 **Auth** — JWT register/login, protected routes

## Seed Data Categories

| Category | Sample Products |
|----------|----------------|
| Biryani Spices | Shah Ghouse masala, Pista House kit, Kesar |
| Pearls & Jewellery | South Sea pearls, Kundan choker |
| Handicrafts | Bidriware vase, Nirmal lacquerware, Kalamkari |
| Textiles & Ikat | Pochampally saree, Gadwal saree |
| Electronics | boAt headphones, Redmi, HP laptop |
| Hyderabadi Sweets | Karachi Bakery biscuits, Haleem mix |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET | `/api/products` | No | List products (search/filter/sort/page) |
| GET | `/api/products/{id}` | No | Product detail |
| GET | `/api/products/category/{id}` | No | Products by category |
| GET | `/api/categories` | No | All categories |
| GET | `/api/cart` | Yes | Get user cart |
| POST | `/api/cart` | Yes | Add to cart |
| PUT | `/api/cart/{id}` | Yes | Update quantity |
| DELETE | `/api/cart/{id}` | Yes | Remove item |
| GET | `/api/orders` | Yes | Order history |
| POST | `/api/orders` | Yes | Place order |
| GET | `/api/orders/{id}` | Yes | Order detail |
