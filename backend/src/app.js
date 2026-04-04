const express = require('express');
const cors = require('cors');

// Import our custom response utility
const { successResponse } = require('./utils/response');
// Import our error handling middlewares
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
// Import our newly created auth routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- 1. GLOBAL MIDDLEWARES ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests

// --- 2. API ROUTES ---

// Health check route for monitoring
app.get('/api/health', (req, res) => {
  // Let's actually use the utility we imported!
  successResponse(res, "Server is running", null, 200);
});

// Mount the Auth routes
app.use('/api/auth', authRoutes);

// Placeholder for future API routes (Properties, Rooms)
// Note: This will look for src/routes/index.js
app.use('/api', require('./routes'));

// --- 3. ERROR HANDLING MIDDLEWARES ---
// 🚨 CRITICAL: These must be the absolutely last things in this file!

// 1st: Catch 404 for unknown routes and pass it down as an error
app.use(notFound);

// 2nd: Global Error Handler (Catches the 404 above, and any other thrown errors)
app.use(errorHandler);

module.exports = app;