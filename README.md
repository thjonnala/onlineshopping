# Hyderabad Online Shopping 🕌

A full-stack Amazon-like online shopping app themed around Hyderabad — featuring biryani spices, pearls, Bidriware, Ikat textiles, and more.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React.js, React Router, Context API |
| Backend   | ASP.NET Core 10 Web API (C#)        |
| ORM       | Entity Framework Core 9             |
| Database  | SQL Server Express / Azure SQL      |
| Auth      | JWT Bearer tokens                   |

---

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- SQL Server Express (local) **or** an Azure SQL Database

---

## Backend Setup

### 1. Configure the connection string

Edit `backend/Hyderabad Online Shopping.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.\\SQLEXPRESS;Database=HyderabadOnlineShoppingDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

**For Azure SQL**, swap in the `AzureConnection` string and change `Program.cs` line:
```csharp
options.UseSqlServer(builder.Configuration.GetConnectionString("AzureConnection"))
```

### 2. Apply migrations & seed data

```bash
cd backend/Hyderabad Online Shopping.API
dotnet ef database update
```

This creates all tables and seeds 20 Hyderabadi products across 6 categories.

### 3. Run the API

```bash
dotnet run
```

API runs at `https://localhost:7001`.  
Swagger UI: `https://localhost:7001/swagger`

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
