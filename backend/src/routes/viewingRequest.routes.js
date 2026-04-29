const express = require('express');
const { 
    createRequest, getTenantRequests, getLandlordRequests, updateStatus 
} = require('../controllers/viewingRequest.controller');

const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

// TẤT CẢ CÁC ROUTES ĐỀU PHẢI ĐĂNG NHẬP
router.use(protect);

// --- CỦA NGƯỜI THUÊ (TENANT) ---
router.post('/', authorizeRoles('tenant'), createRequest);
router.get('/tenant', authorizeRoles('tenant'), getTenantRequests);

// --- CỦA CHỦ TRỌ (LANDLORD) ---
router.get('/landlord', authorizeRoles('landlord', 'admin'), getLandlordRequests);
router.put('/:id/status', authorizeRoles('landlord', 'admin'), updateStatus);

module.exports = router;    