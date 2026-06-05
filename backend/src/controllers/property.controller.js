const propertyService = require('../services/property.service');
const { AppError, successResponse } = require('../utils/response');

const createProperty = async (req, res, next) => {
    try {
        const { title, city, district, price, bedrooms } = req.body;
        const landlordId = req.user.id; 

        if (!title || !city || !district || !price || bedrooms === undefined) {
            throw new AppError('Title, city, district, price, and bedrooms are required fields', 400);
        }

        const newProperty = await propertyService.createProperty(landlordId, req.body);
        return successResponse(res, 'Property created successfully', newProperty, 201);
    } catch (error) { next(error); }
};

const getAllProperties = async (req, res, next) => {
    try {
        const properties = await propertyService.getAllProperties();
        return successResponse(res, 'Properties fetched successfully', properties, 200);
    } catch (error) { next(error); }
};

const getMyProperties = async (req, res, next) => {
    try {
        const landlordId = req.user.id;
        const properties = await propertyService.getMyProperties(landlordId);
        return successResponse(res, 'My properties fetched successfully', properties, 200);
    } catch (error) { next(error); }
};

const getPropertyById = async (req, res, next) => {
    try {
        const property = await propertyService.getPropertyById(req.params.id);
        return successResponse(res, 'Property fetched successfully', property, 200);
    } catch (error) { next(error); }
};

const updateProperty = async (req, res, next) => {
    try {
        const updatedProperty = await propertyService.updateProperty(req.params.id, req.user.id, req.body);
        return successResponse(res, 'Property updated successfully', updatedProperty, 200);
    } catch (error) { next(error); }
};

const deleteProperty = async (req, res, next) => {
    try {
        await propertyService.deleteProperty(req.params.id, req.user.id);
        return successResponse(res, 'Property deleted successfully', null, 200);
    } catch (error) { next(error); }
};

const uploadPropertyImages = async (req, res, next) => {
    try {
        const files = req.files;
        if (!files || files.length < 5) {
            throw new AppError('Phải có ít nhất 5 ảnh cho mỗi bài đăng (Minimum 5 images required)', 400);
        }
        if (files.length > 8) {
            throw new AppError('Chỉ được tải lên tối đa 8 ảnh (Maximum 8 images allowed)', 400);
        }
        const uploadedImages = await propertyService.uploadPropertyImages(req.params.id, req.user.id, files);
        return successResponse(res, 'Images uploaded successfully', uploadedImages, 200);
    } catch (error) { next(error); }
};

const updateOccupants = async (req, res, next) => {
    try {
        const propertyId = req.params.id;
        const landlordId = req.user.id;
        const { current_occupants } = req.body;

        if (current_occupants === undefined || current_occupants < 0) {
            return res.status(400).json({ success: false, message: 'Số lượng người ở không hợp lệ' });
        }

        const result = await propertyService.updateOccupants(propertyId, landlordId, current_occupants);
        res.status(200).json({ success: true, message: 'Cập nhật số lượng người ở thành công', data: result });
    } catch (error) { next(error); }
};

const searchProperties = async (req, res, next) => {
    try {
        const filters = req.query;
        const properties = await propertyService.searchProperties(filters);
        return successResponse(res, 'Search results', properties, 200);
    } catch (error) { next(error); }
};

// ✅ TÍNH NĂNG MỚI: API endpoint trả về locations
const getLocations = async (req, res, next) => {
    try {
        const locations = await propertyService.getAvailableLocations();
        return successResponse(res, 'Locations fetched successfully', locations, 200);
    } catch (error) { next(error); }
};

module.exports = { 
    createProperty, getAllProperties, getMyProperties, getPropertyById, 
    updateProperty, deleteProperty, uploadPropertyImages, updateOccupants, 
    searchProperties, getLocations // ✅ export thêm
};