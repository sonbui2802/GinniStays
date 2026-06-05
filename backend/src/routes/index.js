// File: src/routes/index.js
const express = require('express');
const wishlistRoutes = require('./wishlist.routes');
// Import các route con
const authRoutes = require('./auth.routes');
const propertyRoutes = require('./property.routes');
const viewingRequestRoutes = require('./viewingRequest.routes');
const adminRoutes = require('./admin.routes');
const userRoutes = require('./user.routes');
const router = express.Router();
const contractRoutes = require('./contract.routes');

// Lắp ráp các nhánh route
router.use('/wishlists', wishlistRoutes);
router.use('/contracts', contractRoutes);
router.use('/auth', authRoutes);               // Thành: /auth/login, /auth/register
router.use('/properties', propertyRoutes);     // Thành: /properties, /properties/:id
router.use('/viewing-requests', viewingRequestRoutes); // Thành: /viewing-requests, ...
router.use('/admin', adminRoutes);             // Thành: /admin/users, /admin/properties
router.use('/users', userRoutes); // Thành: /users/profile, /users/password
module.exports = router;