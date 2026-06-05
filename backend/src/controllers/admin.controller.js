const adminService = require('../services/admin.service');
const { successResponse } = require('../utils/response');

const getStats = async (req, res, next) => {
    try {
        const stats = await adminService.getStats();
        return successResponse(res, 'Stats fetched', stats, 200);
    } catch (error) { next(error); }
};

const getAllProperties = async (req, res, next) => {
    try {
        const { status } = req.query;
        const properties = await adminService.getAllProperties(status);
        return successResponse(res, 'Properties fetched', properties, 200);
    } catch (error) { next(error); }
};

const approveProperty = async (req, res, next) => {
    try {
        const result = await adminService.approveProperty(req.params.id);
        return successResponse(res, 'Đã duyệt phòng', result, 200);
    } catch (error) { next(error); }
};

const rejectProperty = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const result = await adminService.rejectProperty(req.params.id, reason);
        return successResponse(res, 'Đã từ chối phòng', result, 200);
    } catch (error) { next(error); }
};

const deleteProperty = async (req, res, next) => {
    try {
        await adminService.deleteProperty(req.params.id);
        return successResponse(res, 'Đã xóa phòng', null, 200);
    } catch (error) { next(error); }
};

const getAllUsers = async (req, res, next) => {
    try {
        const { role } = req.query;
        const users = await adminService.getAllUsers(role);
        return successResponse(res, 'Users fetched', users, 200);
    } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
    try {
        await adminService.deleteUser(req.params.id);
        return successResponse(res, 'Đã xóa user', null, 200);
    } catch (error) { next(error); }
};

const toggleUserStatus = async (req, res, next) => {
    try {
        const result = await adminService.toggleUserStatus(req.params.id);
        return successResponse(res, 'Đã cập nhật trạng thái', result, 200);
    } catch (error) { next(error); }
};

module.exports = {
    getStats, getAllProperties, approveProperty, rejectProperty,
    deleteProperty, getAllUsers, deleteUser, toggleUserStatus
};