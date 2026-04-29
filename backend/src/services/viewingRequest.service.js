const { pool: db } = require('../config/db');
const { AppError } = require('../utils/response');

/**
 * [TENANT] Tạo yêu cầu xem phòng
 */
const createRequest = async (tenantId, requestData) => {
    const { room_id, preferred_date, message } = requestData;

    if (!room_id || !preferred_date) {
        throw new AppError('room_id and preferred_date are required', 400);
    }

    // 1. Kiểm tra xem phòng có tồn tại và đang trống không
    const [room] = await db.execute('SELECT id, status FROM rooms WHERE id = ? LIMIT 1', [room_id]);
    if (room.length === 0) throw new AppError('Room not found', 404);
    if (room.status === 'rented') throw new AppError('This room is already rented', 400);

    // 2. Tạo yêu cầu
    const [result] = await db.execute(
        `INSERT INTO viewing_requests (room_id, tenant_id, preferred_date, message, status) 
         VALUES (?, ?, ?, ?, 'pending')`,
        [room_id, tenantId, preferred_date, message]
    );

    return { id: result.insertId, room_id, preferred_date, status: 'pending' };
};

/**
 * [TENANT] Lấy danh sách các yêu cầu của chính mình (Kèm thông tin phòng)
 */
const getTenantRequests = async (tenantId) => {
    const [requests] = await db.execute(
        `SELECT vr.id, vr.preferred_date, vr.message, vr.status, vr.created_at,
                r.room_number, r.price, p.title as property_title, p.address
         FROM viewing_requests vr
         JOIN rooms r ON vr.room_id = r.id
         JOIN properties p ON r.property_id = p.id
         WHERE vr.tenant_id = ?
         ORDER BY vr.created_at DESC`,
        [tenantId]
    );
    return requests;
};

/**
 * [LANDLORD] Lấy danh sách khách muốn xem các phòng của mình (Kèm thông tin khách)
 */
const getLandlordRequests = async (landlordId) => {
    const [requests] = await db.execute(
        `SELECT vr.id as request_id, vr.preferred_date, vr.message, vr.status, vr.created_at,
                r.room_number, p.title as property_title,
                u.full_name as tenant_name, u.phone as tenant_phone, u.email as tenant_email
         FROM viewing_requests vr
         JOIN rooms r ON vr.room_id = r.id
         JOIN properties p ON r.property_id = p.id
         JOIN users u ON vr.tenant_id = u.id
         WHERE p.landlord_id = ?
         ORDER BY vr.created_at DESC`,
        [landlordId]
    );
    return requests;
};

/**
 * [LANDLORD] Duyệt hoặc Từ chối yêu cầu xem phòng
 */
const updateRequestStatus = async (requestId, landlordId, newStatus) => {
    if (!['approved', 'rejected', 'cancelled'].includes(newStatus)) {
        throw new AppError('Invalid status', 400);
    }

    // 1. BẢO MẬT: Kiểm tra xem cái Request này có đụng vào cái Phòng thuộc Tòa nhà của ông Landlord này không?
    const [existing] = await db.execute(
        `SELECT vr.id FROM viewing_requests vr
         JOIN rooms r ON vr.room_id = r.id
         JOIN properties p ON r.property_id = p.id
         WHERE vr.id = ? AND p.landlord_id = ? LIMIT 1`,
        [requestId, landlordId]
    );

    if (existing.length === 0) {
        throw new AppError('Request not found or you do not have permission to update it', 403);
    }

    // 2. Cập nhật trạng thái
    await db.execute('UPDATE viewing_requests SET status = ? WHERE id = ?', [newStatus, requestId]);

    return { request_id: requestId, new_status: newStatus };
};

module.exports = { createRequest, getTenantRequests, getLandlordRequests, updateRequestStatus };