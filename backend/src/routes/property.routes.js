const express = require('express');
const { 
    createProperty, getAllProperties, getMyProperties, 
    getPropertyById, updateProperty, deleteProperty,
    uploadPropertyImages, updateOccupants,
    searchProperties, getLocations // ✅ import thêm
} = require('../controllers/property.controller');

const { protect, authorizeRoles } = require('../middlewares/auth.middleware');
const upload = require('../config/cloudinary');

const router = express.Router();

// 1. PUBLIC STATIC ROUTES — phải đặt TRƯỚC /:id
router.get('/', getAllProperties);
router.get('/search', searchProperties); 
router.get('/locations', getLocations); // ✅ Thêm route Lấy vị trí động ở đây

// 2. PROTECTED STATIC ROUTES — cũng phải đặt TRƯỚC /:id
router.get('/landlord/my-properties', protect, authorizeRoles('landlord', 'admin'), getMyProperties);

// 3. DYNAMIC ROUTE — đặt SAU tất cả static
router.get('/:id', getPropertyById);

// 4. PROTECTED ROUTES
router.use(protect);

router.post('/', authorizeRoles('landlord', 'admin'), createProperty);
router.put('/:id', authorizeRoles('landlord', 'admin'), updateProperty);
router.delete('/:id', authorizeRoles('landlord', 'admin'), deleteProperty);
router.patch('/:id/occupants', authorizeRoles('landlord', 'admin'), updateOccupants);
router.post('/:id/images', authorizeRoles('landlord', 'admin'), upload.array('images', 8), uploadPropertyImages);

module.exports = router;