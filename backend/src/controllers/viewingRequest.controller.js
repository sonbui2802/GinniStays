const viewingRequestService = require('../services/viewingRequest.service');
const { AppError, successResponse } = require('../utils/response');

const createRequest = async (req, res, next) => {
    try {
        const tenantId = req.user.id;
        const request = await viewingRequestService.createRequest(tenantId, req.body);
        return successResponse(res, 'Viewing request sent successfully', request, 201);
    } catch (error) { next(error); }
};

const getTenantRequests = async (req, res, next) => {
    try {
        const requests = await viewingRequestService.getTenantRequests(req.user.id);
        return successResponse(res, 'Your viewing requests fetched successfully', requests, 200);
    } catch (error) { next(error); }
};

const getLandlordRequests = async (req, res, next) => {
    try {
        const requests = await viewingRequestService.getLandlordRequests(req.user.id);
        return successResponse(res, 'Received requests fetched successfully', requests, 200);
    } catch (error) { next(error); }
};

const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const updated = await viewingRequestService.updateRequestStatus(req.params.id, req.user.id, status);
        return successResponse(res, `Request marked as ${status}`, updated, 200);
    } catch (error) { next(error); }
};

module.exports = { createRequest, getTenantRequests, getLandlordRequests, updateStatus };