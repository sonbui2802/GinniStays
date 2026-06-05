const express = require('express');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');
const {
    createContract, getLandlordContracts, getContractById,
    updateContractStatus, deleteContract,
    getTenantContracts, confirmContract
} = require('../controllers/contract.controller');

const router = express.Router();

router.use(protect); // tất cả đều cần đăng nhập

// ✅ Tenant routes — không cần authorizeRoles, ai đăng nhập cũng vào được
router.get('/my-contracts', getTenantContracts);
router.patch('/:id/confirm', confirmContract);

// ✅ Landlord routes — gắn authorizeRoles trực tiếp vào từng route
router.get('/', authorizeRoles('landlord', 'admin'), getLandlordContracts);
router.post('/', authorizeRoles('landlord', 'admin'), createContract);
router.get('/:id', getContractById); // tenant cũng cần xem HĐ
router.patch('/:id/status', authorizeRoles('landlord', 'admin'), updateContractStatus);
router.delete('/:id', authorizeRoles('landlord', 'admin'), deleteContract);

module.exports = router;