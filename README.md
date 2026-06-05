# GinniStays 🏠

A room rental platform for Vietnam — connecting landlords and tenants with smart search, contract management, and PDF export.

---

## Why this exists

The rental market in Vietnam still runs mostly on word-of-mouth and scattered social media posts. GinniStays puts everything in one place: landlords list their rooms, tenants search by map, sign contracts, and manage everything on a single platform.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, Zustand, Axios |
| Backend | Node.js + Express |
| Database | MySQL |
| Auth | JWT |
| Docs | PDF generation |

---

## Project structure

```
GinniStays
├── frontend
│   └── src
│       ├── assets/         # Static images, logos
│       ├── components/
│       │   ├── common/     # Button, Input, Modal...
│       │   ├── layout/     # Navbar, Footer, Sidebar
│       │   └── property/   # PropertyCard, MapView, CategoryBar
│       ├── hooks/          # useAuth, useGeolocation
│       ├── layouts/        # MainLayout, DashboardLayout
│       ├── pages/          # Home, PropertyDetail, HostDashboard
│       ├── services/       # Axios config + API endpoints
│       ├── store/          # Zustand (authStore)
│       ├── utils/          # Currency, date formatters
│       └── App.jsx
│
├── backend
│   └── src
│       ├── config/         # MySQL connection
│       ├── controllers/    # Handle incoming HTTP requests
│       ├── middlewares/    # JWT auth, error handling
│       ├── routes/         # REST API endpoints
│       ├── services/       # Business logic + DB queries
│       ├── utils/          # JWT helpers, response format
│       ├── app.js
│       └── server.js
│
├── database
│   └── schema.sql
└── README.md
```

---

## Getting started

> Requirements: Node.js ≥ 18, MySQL running locally.

### 1. Clone the repo

```bash
git clone https://github.com/sonbui2802/GinniStays.git
cd GinniStays
```

### 2. Set up the database

```bash
mysql -u root -p < database/schema.sql
```

### 3. Run the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ginnistays
JWT_SECRET=your_secret_key
```

```bash
npm run dev
# → http://localhost:5000
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## How it works

```
User → React (Axios) → Express API → MySQL
                           ↓
                      JSON response
                           ↓
                     React renders UI
```

All frontend API calls go through a single instance:

```js
// frontend/src/services/api.js
const api = axios.create({ baseURL: "http://localhost:5000/api" });

api.get("/properties");
api.post("/auth/login", data);
```

---

## Auth (JWT)

1. User logs in → backend returns a token
2. Frontend stores it in Zustand + localStorage
3. Every subsequent request attaches:

```
Authorization: Bearer <token>
```

---

## Features

- 🔍 Property search and filtering
- 🗺️ Map-based browsing
- 👤 User auth (JWT)
- 🧑‍💼 Host dashboard for managing listings
- 📄 Contract management + PDF export

## Roadmap

- [ ] Payment integration
- [ ] Real-time chat (WebSocket)
- [ ] AI-based room recommendations
- [ ] Advanced search filters

---

## Contributors

[@sonbui2802](https://github.com/sonbui2802) — PRs welcome 🙌
