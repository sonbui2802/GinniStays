const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { getWishlist, toggleWishlist, checkWishlist } = require('../controllers/wishlist.controller');

const router = express.Router();
router.use(protect);

router.get('/', getWishlist);
router.post('/:propertyId/toggle', toggleWishlist);
router.get('/:propertyId/check', checkWishlist);

module.exports = router;