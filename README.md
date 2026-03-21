# 📦 GinniStays

A full-stack web application for managing rental rooms and mini apartments in Vietnam.

---

## 📦 Project Structure

```bash
GinniStays
│
├── backend
│   └── src
│       ├── config        # Database configuration (MySQL)
│       ├── controllers   # Handle incoming requests
│       ├── middlewares   # Auth (JWT) & error handling
│       ├── routes        # API endpoints
│       ├── services      # Business logic & DB operations
│       ├── utils         # Helper functions (JWT, response)
│       ├── app.js        # Express app setup
│       └── server.js     # Server entry point
│
├── frontend              # (Optional - UI layer)
│
├── database
│   └── schema.sql        # Database schema (tables & relations)
│
└── README.md