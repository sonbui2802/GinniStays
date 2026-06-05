# 📦 GinniStays

A full-stack web application for managing rental rooms and mini apartments in Vietnam.

---

## 🏗️ System Architecture Overview

GinniStays follows a **client-server architecture**:

* **Frontend (React)** handles UI, user interaction, and sends HTTP requests.
* **Backend (Node.js + Express)** processes requests, handles business logic, and interacts with the database.
* **Database (MySQL)** stores users, properties, bookings, etc.

📡 Flow:

```
User → Frontend (React) → API (Axios) → Backend (Express) → MySQL Database
                                             ↓
                                      Response (JSON)
                                             ↓
                                Frontend renders UI
```

---

## 📦 Project Structure

```bash
GinniStays
├── frontend
│   └── src
│       ├── assets/         # Static images, logos
│       ├── components/     
│       │   ├── common/     # Reusable UI (Button, Input, Modal...)
│       │   ├── layout/     # Navbar, Footer, Sidebar...
│       │   └── property/   # PropertyCard, MapView, CategoryBar...
│       ├── hooks/          # Custom hooks (useAuth, useGeolocation)
│       ├── layouts/        # Page layouts (MainLayout, DashboardLayout)
│       ├── pages/          # Main pages (Home, PropertyDetail, HostDashboard)
│       ├── services/       # API calls (Axios config & endpoints)
│       ├── store/          # Zustand state management (authStore)
│       ├── utils/          # Helpers (format currency, date...)
│       └── App.jsx

├── backend
│   └── src
│       ├── config/         # Database config (MySQL connection)
│       ├── controllers/    # Handle incoming HTTP requests
│       ├── middlewares/    # Auth (JWT), error handling
│       ├── routes/         # API endpoints (REST)
│       ├── services/       # Business logic & DB queries
│       ├── utils/          # Helpers (JWT, response format)
│       ├── app.js          # Express app setup
│       └── server.js       # Entry point

├── database
│   └── schema.sql          # Database schema

└── README.md
```

---

## 🔗 How Frontend Connects to Backend

### 1. API Layer (Frontend)

All API calls are centralized in:

```
frontend/src/services/api.js
```

Example:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default api;
```

👉 Other services use this instance:

```js
api.get("/properties");
api.post("/auth/login", data);
```

---

### 2. Backend Routes

Backend exposes REST APIs via:

```
backend/src/routes/
```

Example:

```js
router.get("/properties", propertyController.getAll);
router.post("/auth/login", authController.login);
```

---

### 3. Request Flow Example

📌 User loads homepage:

1. Frontend calls:

```js
api.get("/properties");
```

2. Backend route receives:

```
GET /api/properties
```

3. Controller handles:

```js
propertyController.getAll
```

4. Service queries database:

```sql
SELECT * FROM properties;
```

5. Backend returns JSON:

```json
{
  "data": [ ...properties ]
}
```

6. Frontend renders UI 🎉

---

## ⚙️ Running the Project

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Server runs at:

```
http://localhost:5000
```

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at:

```
http://localhost:5173
```

---

## 🔐 Authentication Flow (JWT)

1. User logs in → frontend sends credentials
2. Backend verifies → returns JWT
3. Frontend stores token (Zustand / localStorage)
4. Future requests include:

```
Authorization: Bearer <token>
```

---

## 🚀 Key Features

* 🏠 Property listing & filtering
* 📍 Map-based location view
* 👤 User authentication (JWT)
* 🧑‍💼 Host dashboard for property management
* 💾 Persistent storage with MySQL

---

## 💡 Future Improvements

* Payment integration
* Real-time chat (WebSocket)
* Recommendation system (AI-based)
* Advanced search & filtering

---

## 🧠 Notes

* Frontend and backend are **decoupled**, communicate via REST APIs
* Easily scalable to microservices or GraphQL in the future
* Clean separation: UI ↔ Business Logic ↔ Data Layer

---
