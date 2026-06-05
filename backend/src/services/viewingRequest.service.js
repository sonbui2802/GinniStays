const { pool: db } = require('../config/db');
const { AppError } = require('../utils/response');
const propertyService = require('./property.service');

/**
 * [TENANT] Tạo yêu cầu xem phòng
 */
const createRequest = async (tenantId, requestData) => {
    // Thêm các chốt chặn an toàn || null để DB không bao giờ báo lỗi undefined
    const property_id = requestData.property_id || null;
    const preferred_date = requestData.preferred_date || null;
    const message = requestData.message || null;

    if (!property_id || !preferred_date) {
        throw new AppError('property_id và preferred_date là bắt buộc', 400);
    }
    // ✅ Thêm: chặn ngày quá khứ ở tầng Backend
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(preferred_date);
    selected.setHours(0, 0, 0, 0);
    
    if (selected < today) {
        throw new AppError('Không thể đặt lịch vào ngày đã qua', 400);
    }

    const availability = await propertyService.checkAvailability(property_id);
    
    if (!availability.exists) throw new AppError('Không tìm thấy phòng này', 404);
    if (!availability.available) throw new AppError('Phòng này đã có người thuê', 400);

    const [result] = await db.execute(
        `INSERT INTO viewing_requests (property_id, tenant_id, preferred_date, message, status) 
         VALUES (?, ?, ?, ?, 'pending')`,
        [property_id, tenantId, preferred_date, message]
    );

    return { id: result.insertId, property_id, preferred_date, status: 'pending' };
};

/**
 * [TENANT] Lấy danh sách các yêu cầu của chính mình
 */
const getTenantRequests = async (tenantId) => {
    const [requests] = await db.execute(
        `SELECT vr.id, vr.preferred_date, vr.message, vr.status, vr.created_at,
                p.id as property_id, p.title as property_title, p.price, p.address
         FROM viewing_requests vr
         JOIN properties p ON vr.property_id = p.id
         WHERE vr.tenant_id = ?
         ORDER BY vr.created_at DESC`,
        [tenantId]
    );
    
    // Gói data lại thành Object lồng nhau cho Frontend dễ xài
    return requests.map(req => ({
        id: req.id,
        property_id: req.property_id,
        preferred_date: req.preferred_date,
        message: req.message,
        status: req.status,
        created_at: req.created_at,
        property: {
            id: req.property_id,
            title: req.property_title,
            price: req.price,
            address: req.address
        }
    }));
};

/**
 * [LANDLORD] Lấy danh sách khách muốn xem phòng của mình
 */
const getLandlordRequests = async (landlordId) => {
    const [requests] = await db.execute(
        // Đổi vr.id as request_id thành vr.id để đồng bộ với FE
        `SELECT vr.id, vr.preferred_date, vr.message, vr.status, vr.created_at,
                p.id as property_id, p.title as property_title,
                u.full_name as tenant_name, u.phone as tenant_phone, u.email as tenant_email
         FROM viewing_requests vr
         JOIN properties p ON vr.property_id = p.id
         JOIN users u ON vr.tenant_id = u.id
         WHERE p.landlord_id = ?
         ORDER BY vr.created_at DESC`,
        [landlordId]
    );
    
    //      Gói data từ dạng phẳng (SQL) sang dạng phân cấp (JSON)
    return requests.map(req => ({
        id: req.id,
        property_id: req.property_id,
        preferred_date: req.preferred_date,
        message: req.message,
        status: req.status,
        created_at: req.created_at,
        property: {
            id: req.property_id,
            title: req.property_title
        },
        tenant: {
            name: req.tenant_name,
            phone: req.tenant_phone,
            email: req.tenant_email
        }
    }));
};

/**
 * [LANDLORD] Duyệt hoặc Từ chối yêu cầu
 */
const updateRequestStatus = async (requestId, landlordId, newStatus) => {
    if (!['approved', 'rejected', 'cancelled'].includes(newStatus)) {
        throw new AppError('Trạng thái không hợp lệ', 400);
    }

    const [existing] = await db.execute(
        `SELECT vr.id FROM viewing_requests vr
         JOIN properties p ON vr.property_id = p.id
         WHERE vr.id = ? AND p.landlord_id = ? LIMIT 1`,
        [requestId, landlordId]
    );

    if (existing.length === 0) {
        throw new AppError('Không tìm thấy yêu cầu hoặc bạn không có quyền sửa', 403);
    }

    await db.execute('UPDATE viewing_requests SET status = ? WHERE id = ?', [newStatus, requestId]);

    return { request_id: requestId, new_status: newStatus };
};

module.exports = { createRequest, getTenantRequests, getLandlordRequests, updateRequestStatus };