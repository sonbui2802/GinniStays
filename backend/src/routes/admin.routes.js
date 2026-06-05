const express = require('express');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');
const {
    getStats, getAllProperties, approveProperty, rejectProperty,
    deleteProperty, getAllUsers, deleteUser, toggleUserStatus
} = require('../controllers/admin.controller');

const router = express.Router();

// Tất cả route admin đều cần protect + role admin
router.use(protect);
router.use(authorizeRoles('admin'));

// Stats
router.get('/stats', getStats);

// Properties
router.get('/properties', getAllProperties);
router.patch('/properties/:id/approve', approveProperty);
router.patch('/properties/:id/reject', rejectProperty);
router.delete('/properties/:id', deleteProperty);

// Users
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;