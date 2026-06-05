const { pool: db } = require('../config/db');
const { AppError } = require('../utils/response');

const createContract = async (landlordId, contractData) => {
    const { property_id, viewing_request_id, tenant_name, tenant_cccd,
            tenant_address, tenant_phone, start_date, end_date,
            monthly_rent, deposit, terms } = contractData;

    if (!property_id || !tenant_name || !start_date || !end_date || !monthly_rent) {
        throw new AppError('Thiếu thông tin bắt buộc', 400);
    }

    let tenant_id = null;
    if (viewing_request_id) {
        const [vr] = await db.execute(
            'SELECT tenant_id FROM viewing_requests WHERE id = ? AND status = "approved"',
            [viewing_request_id]
        );
        if (vr.length > 0) tenant_id = vr[0].tenant_id;
    }

    const [props] = await db.execute(
        'SELECT id FROM properties WHERE id = ? AND landlord_id = ?',
        [property_id, landlordId]
    );
    if (props.length === 0) throw new AppError('Không tìm thấy phòng hoặc bạn không có quyền', 403);

    const [result] = await db.execute(
        `INSERT INTO contracts 
         (property_id, landlord_id, tenant_id, tenant_name, tenant_cccd,
          tenant_address, tenant_phone, start_date, end_date, monthly_rent, deposit, terms, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_tenant')`,
        [property_id, landlordId, tenant_id, tenant_name, tenant_cccd,
         tenant_address, tenant_phone, start_date, end_date,
         monthly_rent, deposit || 0, terms || null]
    );

    return { id: result.insertId, status: 'pending_tenant' };
};

const getLandlordContracts = async (landlordId) => {
    const [contracts] = await db.execute(`
        SELECT c.*, p.title as property_title, p.address as property_address,
               p.district, p.city
        FROM contracts c
        JOIN properties p ON c.property_id = p.id
        WHERE c.landlord_id = ?
        ORDER BY c.created_at DESC
    `, [landlordId]);
    return contracts;
};

const getContractById = async (contractId, userId) => {
    const [rows] = await db.execute(`
        SELECT c.*, 
               p.title as property_title, p.address as property_address,
               p.district, p.city, p.area,
               u.full_name as landlord_name, u.phone as landlord_phone,
               u.email as landlord_email
        FROM contracts c
        JOIN properties p ON c.property_id = p.id
        JOIN users u ON c.landlord_id = u.id
        WHERE c.id = ? AND (c.landlord_id = ? OR c.tenant_id = ?)
    `, [contractId, userId, userId]);

    if (rows.length === 0) throw new AppError('Không tìm thấy hợp đồng', 404);
    return rows[0];
};

const updateContractStatus = async (contractId, landlordId, status) => {
    if (!['active', 'expired', 'terminated'].includes(status)) {
        throw new AppError('Trạng thái không hợp lệ', 400);
    }
    // ✅ Block sửa HĐ đã active
    const [existing] = await db.execute(
        'SELECT status FROM contracts WHERE id = ? AND landlord_id = ?',
        [contractId, landlordId]
    );
    if (existing[0]?.status === 'active') {
        throw new AppError('Hợp đồng đã có hiệu lực, không thể thay đổi', 403);
    }
    const [result] = await db.execute(
        'UPDATE contracts SET status = ? WHERE id = ? AND landlord_id = ?',
        [status, contractId, landlordId]
    );
    if (result.affectedRows === 0) throw new AppError('Không tìm thấy hợp đồng', 404);
    return { id: contractId, status };
};

const deleteContract = async (contractId, landlordId) => {
    const [result] = await db.execute(
        'DELETE FROM contracts WHERE id = ? AND landlord_id = ?',
        [contractId, landlordId]
    );
    if (result.affectedRows === 0) throw new AppError('Không tìm thấy hợp đồng', 404);
    return true;
};

const getTenantContracts = async (tenantId) => {
    const [contracts] = await db.execute(`
        SELECT c.*, 
               p.title as property_title, p.address as property_address,
               p.district, p.city,
               u.full_name as landlord_name, u.phone as landlord_phone
        FROM contracts c
        JOIN properties p ON c.property_id = p.id
        JOIN users u ON c.landlord_id = u.id
        WHERE c.tenant_id = ?
        ORDER BY c.created_at DESC
    `, [tenantId]);
    return contracts;
};

const confirmContract = async (contractId, tenantId) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [rows] = await conn.execute(
            `SELECT id, property_id FROM contracts 
             WHERE id = ? AND tenant_id = ? AND status = 'pending_tenant'`,
            [contractId, tenantId]
        );
        if (rows.length === 0) throw new AppError('Không tìm thấy hợp đồng hoặc đã được ký', 404);

        const { property_id } = rows[0];

        await conn.execute(
            `UPDATE contracts SET status = 'active', signed_at = NOW() WHERE id = ?`,
            [contractId]
        );
        await conn.execute(
            `UPDATE properties SET rental_status = 'rented' WHERE id = ?`,
            [property_id]
        );

        await conn.commit();
        return { id: contractId, status: 'active' };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

module.exports = {
    createContract, getLandlordContracts, getContractById,
    updateContractStatus, deleteContract,
    getTenantContracts, confirmContract
};