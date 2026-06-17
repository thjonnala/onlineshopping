# Hyderabad Online Shopping 🕌

A full-stack Amazon-like online shopping app themed around Hyderabad — featuring biryani spices, pearls, Bidriware, Ikat textiles, and more.

This repo holds the **React frontend** (deployed to GitHub Pages).
The backend has been **consolidated into the shared [`thiru-apps-api`](https://github.com/thjonnala/thiru-apps-api)** service, where Hyderabad Bazaar is served under **`/api/hos`**.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React.js, React Router, Context API |
| Backend   | ASP.NET Core Web API (C#) — in the shared [`thiru-apps-api`](https://github.com/thjonnala/thiru-apps-api) repo, served under `/api/hos` |
| ORM       | Entity Framework Core (SqlClient)   |
| Database  | Azure SQL — shared `thiru-apps-db`, `hos_`-prefixed tables |
| Auth      | JWT Bearer tokens                   |
| Hosting   | Frontend → GitHub Pages · Backend → `thiru-apps-api` (Azure App Service) · DB → Azure SQL |

---

## Prerequisites

- [Node.js 18+](https://nodejs.org) — for the frontend

> **Backend & database live in separate repos.** The API is in
> [`thiru-apps-api`](https://github.com/thjonnala/thiru-apps-api) and the schema in
> [`thiru-apps-db`](https://github.com/thjonnala/thiru-apps-db) (Azure SQL, `hos_`-prefixed
> tables — the API only reads/writes them; it does not create or migrate them).
> See those repos to run the API locally, or just point the frontend at the deployed Azure API.

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure API URL

Edit `frontend/.env` to point at the consolidated API (local `thiru-apps-api` on port 5037):
```
REACT_APP_API_URL=http://localhost:5037/api/hos
```

`frontend/.env.production` points at the deployed Azure API
(`https://thiru-apps-api.azurewebsites.net/api/hos`) and is used for the GitHub Pages build.

### 3. Start the dev server

```bash
npm start
```

App runs at `http://localhost:3000`.

---

## Cloud Deployment

### Backend + Database — consolidated thiru-apps-api on Azure
The backend is **consolidated into the shared `thiru-apps-api` Azure App Service**, served under
**`/api/hos`**, with its data under the **`hos_`** prefix in the shared **Azure SQL** database
(`thiru-apps-db`). Render, Neon, and the standalone PostgreSQL backend are no longer used.

- **Infrastructure** — App Service + Azure SQL + Key Vault are provisioned from the
  [`thiru-apps-infra`](https://dev.azure.com/thjonnala/thiru-apps-infra) repo (Bicep + pipelines).
- **Schema** — owned by the `thiru-apps-db` database project and deployed as a DACPAC; the API
  does not create or migrate the schema.

### Frontend — GitHub Pages
- Served from the `main` branch `/docs` folder (already built).
- Built and published by [`.github/workflows/deploy-frontend.yml`](.github/workflows/deploy-frontend.yml) on push to `main`.
- API base URL comes from [`frontend/.env.production`](frontend/.env.production)
  (`REACT_APP_API_URL=https://thiru-apps-api.azurewebsites.net/api/hos`).

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

Served by the consolidated API under the **`/api/hos`** base (e.g. `/api/hos/products`):

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login, get JWT |
| GET | `/products` | No | List products (search/filter/sort/page) |
| GET | `/products/{id}` | No | Product detail |
| GET | `/products/category/{id}` | No | Products by category |
| GET | `/categories` | No | All categories |
| GET | `/cart` | Yes | Get user cart |
| POST | `/cart` | Yes | Add to cart |
| PUT | `/cart/{id}` | Yes | Update quantity |
| DELETE | `/cart/{id}` | Yes | Remove item |
| GET | `/orders` | Yes | Order history |
| POST | `/orders` | Yes | Place order |
| GET | `/orders/{id}` | Yes | Order detail |
