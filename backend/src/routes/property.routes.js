const express = require('express');
const { 
    createProperty, getAllProperties, getMyProperties, 
    getPropertyById, updateProperty, deleteProperty,
    uploadPropertyImages // <-- 1. Thêm import hàm này
} = require('../controllers/property.controller');

const { protect, authorizeRoles } = require('../middlewares/auth.middleware');
const upload = require('../config/cloudinary'); // <-- 2. Thêm import cấu hình Multer

const router = express.Router();

// 1. PUBLIC ROUTES (Ai cũng xem được danh sách và chi tiết)
router.get('/', getAllProperties);
router.get('/:id', getPropertyById); 

// 2. PROTECTED ROUTES (Phải đăng nhập)
router.use(protect);

// 3. LANDLORD ROUTES (Phải đăng nhập + Có quyền landlord)
// Route lấy danh sách nhà của RIÊNG chủ trọ đang đăng nhập
router.get('/landlord/my-properties', authorizeRoles('landlord', 'admin'), getMyProperties);

// CRUD
router.post('/', authorizeRoles('landlord', 'admin'), createProperty);
router.put('/:id', authorizeRoles('landlord', 'admin'), updateProperty);
router.delete('/:id', authorizeRoles('landlord', 'admin'), deleteProperty);

// Upload ảnh cho Property (Tối đa 5 ảnh)
// <-- 3. Thêm Route này
router.post('/:id/images', authorizeRoles('landlord', 'admin'), upload.array('images', 5), uploadPropertyImages); 

module.exports = router;