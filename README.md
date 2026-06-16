# Hyderabad Online Shopping 🕌

A full-stack Amazon-like online shopping app themed around Hyderabad — featuring biryani spices, pearls, Bidriware, Ikat textiles, and more.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React.js, React Router, Context API |
| Backend   | ASP.NET Core 10 Web API (C#)        |
| ORM       | Entity Framework Core (Npgsql local / SqlClient on Azure) |
| Database  | PostgreSQL (local) / Azure SQL — shared `thiru-apps-db` (cloud) |
| Auth      | JWT Bearer tokens                   |
| Hosting   | Frontend → GitHub Pages · Backend → `thiru-apps-api` (Azure App Service) · DB → Azure SQL |

---

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [PostgreSQL 16](https://www.postgresql.org/download/) (local) **or** a free [Neon](https://neon.tech) database (cloud)

---

## Database — shared `thiruapps` (PostgreSQL)

The schema lives in the **[`thiru-apps-db`](../thiru-apps-db)** repo, not in this
app. All objects are prefixed `hos_` so the database (`thiruapps`) can be shared
by multiple apps. The app only reads/writes those tables — it does **not** create
or migrate them.

**Set up the database (one consolidated script):**

```powershell
# from the thiru-apps-db repo
.\apply.ps1 -ConnectionString "postgres://postgres:postgres@localhost:5432/thiruapps"
# …or plain psql
psql "postgres://postgres:postgres@localhost:5432/thiruapps" -f hos/init.sql
```

This creates the `hos_` tables and seeds 20 products across 6 categories
(idempotent — safe to re-run, never overwrites existing rows).

## Backend Setup

### 1. Configure the connection string

The app reads the connection from the `DATABASE_URL` environment variable
(production), falling back to `DefaultConnection` in `appsettings.json` locally:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=thiruapps;Username=postgres;Password=postgres"
}
```

Both URI form (`postgres://user:pass@host/db`, as Render/Neon provide) and
key=value form are accepted.

### 2. Run the API

```bash
cd backend/HyderabadBazaar.API
dotnet run
```

Swagger UI: `http://localhost:5037/swagger`

---

## Cloud Deployment

### Backend + Database — consolidated thiru-apps-api on Azure
The backend is **consolidated into the shared `thiru-apps-api` Azure App Service**, served under
**`/api/hos`**, with its data under the **`hos_`** prefix in the shared **Azure SQL** database
(`thiru-apps-db`). **Render and Neon are no longer used** (the old `render.yaml` has been removed).

- **Infrastructure** — App Service + Azure SQL + Key Vault are provisioned from the
  [`thiru-apps-infra`](https://dev.azure.com/thjonnala/thiru-apps-infra) repo (Bicep + pipelines).
- **Schema** — owned by the `thiru-apps-db` database project and deployed as a DACPAC; the API
  does not create or migrate the schema.

### Frontend — GitHub Pages
- Served from the `main` branch `/docs` folder (already built).
- API base URL comes from [`frontend/.env.production`](frontend/.env.production)
  (`REACT_APP_API_URL=https://thiru-apps-api.azurewebsites.net/api/hos`).

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
