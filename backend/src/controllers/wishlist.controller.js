const wishlistService = require('../services/wishlist.service');
const { successResponse } = require('../utils/response');

const getWishlist = async (req, res, next) => {
    try {
        const items = await wishlistService.getWishlist(req.user.id);
        return successResponse(res, 'Fetched wishlist', items, 200);
    } catch (error) { next(error); }
};

const toggleWishlist = async (req, res, next) => {
    try {
        const result = await wishlistService.toggleWishlist(req.user.id, req.params.propertyId);
        return successResponse(res, result.saved ? 'Đã lưu' : 'Đã bỏ lưu', result, 200);
    } catch (error) { next(error); }
};

const checkWishlist = async (req, res, next) => {
    try {
        const result = await wishlistService.checkWishlist(req.user.id, req.params.propertyId);
        return successResponse(res, 'Checked', result, 200);
    } catch (error) { next(error); }
};

module.exports = { getWishlist, toggleWishlist, checkWishlist };