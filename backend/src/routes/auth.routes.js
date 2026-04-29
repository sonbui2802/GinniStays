const express = require('express');

// Import các hàm từ Controller 
const { register, login, getCurrentUser } = require('../controllers/auth.controller');

// Import middleware bảo vệ route
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// --- PUBLIC ROUTES (Không cần đăng nhập) ---
router.post('/register', register); 
router.post('/login', login);

// --- PROTECTED ROUTES (Bắt buộc phải có token JWT) ---
// Middleware 'protect' sẽ chạy trước, nếu token hợp lệ mới chạy 'getCurrentUser'
router.get('/me', protect, getCurrentUser);

module.exports = router;