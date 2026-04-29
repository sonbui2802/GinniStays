const propertyService = require('../services/property.service');
const { AppError, successResponse } = require('../utils/response');

const createProperty = async (req, res, next) => {
    try {
        const { title, city, district, price } = req.body;
        const landlordId = req.user.id; 

        // Đã bổ sung validation cho 'price' vì giờ nó là bắt buộc
        if (!title || !city || !district || !price) {
            throw new AppError('Title, city, district, and price are required fields', 400);
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
        // Validation thêm nếu cần, nhưng ta đã đẩy logic xuống Service
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
        if (!files || files.length === 0) {
            throw new AppError('Please select at least one image', 400);
        }

        const uploadedImages = await propertyService.uploadPropertyImages(req.params.id, req.user.id, files);
        
        return successResponse(res, 'Images uploaded successfully', uploadedImages, 200);
    } catch (error) { next(error); }
};

module.exports = { 
    createProperty, getAllProperties, getMyProperties, 
    getPropertyById, updateProperty, deleteProperty, 
    uploadPropertyImages 
};