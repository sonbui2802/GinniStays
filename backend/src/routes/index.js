// File: src/routes/index.js
const express = require('express');

// Import các route con
const authRoutes = require('./auth.routes');
const propertyRoutes = require('./property.routes');
const viewingRequestRoutes = require('./viewingRequest.routes');

const router = express.Router();

// Lắp ráp các nhánh route
router.use('/auth', authRoutes);               // Thành: /auth/login, /auth/register
router.use('/properties', propertyRoutes);     // Thành: /properties, /properties/:id
router.use('/viewing-requests', viewingRequestRoutes); // Thành: /viewing-requests, ...

module.exports = router;