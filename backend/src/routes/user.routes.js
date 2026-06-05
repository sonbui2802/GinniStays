const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');

router.use(protect);

// Nhận file có field name là 'avatar'
router.put('/profile', uploadAvatar.single('avatar'), userController.updateProfile);
router.put('/password', userController.changePassword);

module.exports = router;