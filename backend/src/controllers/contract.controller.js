const contractService = require('../services/contract.service');
const { successResponse } = require('../utils/response');

const createContract = async (req, res, next) => {
    try {
        const contract = await contractService.createContract(req.user.id, req.body);
        return successResponse(res, 'Tạo hợp đồng thành công', contract, 201);
    } catch (error) { next(error); }
};

const getLandlordContracts = async (req, res, next) => {
    try {
        const contracts = await contractService.getLandlordContracts(req.user.id);
        return successResponse(res, 'Fetched contracts', contracts, 200);
    } catch (error) { next(error); }
};

const getContractById = async (req, res, next) => {
    try {
        const contract = await contractService.getContractById(req.params.id, req.user.id);
        return successResponse(res, 'Fetched contract', contract, 200);
    } catch (error) { next(error); }
};

const updateContractStatus = async (req, res, next) => {
    try {
        const result = await contractService.updateContractStatus(req.params.id, req.user.id, req.body.status);
        return successResponse(res, 'Cập nhật trạng thái thành công', result, 200);
    } catch (error) { next(error); }
};

const deleteContract = async (req, res, next) => {
    try {
        await contractService.deleteContract(req.params.id, req.user.id);
        return successResponse(res, 'Đã xóa hợp đồng', null, 200);
    } catch (error) { next(error); }
};
const getTenantContracts = async (req, res, next) => {
    try {
        const contracts = await contractService.getTenantContracts(req.user.id);
        return successResponse(res, 'Fetched', contracts, 200);
    } catch (error) { next(error); }
};

const confirmContract = async (req, res, next) => {
    try {
        const result = await contractService.confirmContract(req.params.id, req.user.id);
        return successResponse(res, 'Ký hợp đồng thành công', result, 200);
    } catch (error) { next(error); }
};

module.exports = { createContract, getLandlordContracts, getContractById, updateContractStatus, deleteContract  , getTenantContracts, confirmContract };