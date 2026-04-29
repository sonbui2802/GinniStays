const express = require('express');
const { 
    createRoom, getRoomsByProperty, getRoomById, 
    updateRoom, deleteRoom 
} = require('../controllers/room.controller');

const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

// 1. PUBLIC ROUTES (Người thuê xem phòng)
// Đường dẫn sẽ trông như: GET /api/rooms/property/10 (Lấy các phòng của nhà số 10)
router.get('/property/:propertyId', getRoomsByProperty); 
router.get('/:id', getRoomById); 

// 2. PROTECTED ROUTES (Chỉ Landlord)
router.use(protect);
router.use(authorizeRoles('landlord', 'admin'));

// CRUD
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;