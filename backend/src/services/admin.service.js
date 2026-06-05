const { pool: db } = require('../config/db');
const { AppError } = require('../utils/response');

/**
 * Lấy thống kê tổng quan
 */
const getStats = async () => {
    const [[userStats]] = await db.execute(`
        SELECT
            COUNT(*) as total_users,
            SUM(role = 'tenant') as total_tenants,
            SUM(role = 'landlord') as total_landlords
        FROM users WHERE is_active = 1
    `);

    const [[propertyStats]] = await db.execute(`
        SELECT
            COUNT(*) as total_properties,
            SUM(status = 'pending') as pending_properties,
            SUM(status = 'approved') as approved_properties,
            SUM(status = 'rejected') as rejected_properties,
            SUM(rental_status = 'available') as available_properties,
            SUM(rental_status = 'rented') as rented_properties
        FROM properties
    `);

    const [[requestStats]] = await db.execute(`
        SELECT COUNT(*) as total_requests,
               SUM(status = 'pending') as pending_requests
        FROM viewing_requests
    `);

    const [topDistricts] = await db.execute(`
        SELECT district, city, COUNT(*) as count
        FROM properties
        WHERE status = 'approved' AND district IS NOT NULL
        GROUP BY city, district
        ORDER BY count DESC
        LIMIT 5
    `);

    const [newProperties] = await db.execute(`
        SELECT COUNT(*) as count
        FROM properties
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    return {
        users: userStats,
        properties: { ...propertyStats, new_this_week: newProperties[0].count },
        requests: requestStats,
        top_districts: topDistricts
    };
};

/**
 * Lấy danh sách tất cả phòng (kèm filter)
 */
const getAllProperties = async (status) => {
    let sql = `
        SELECT p.*, u.full_name as landlord_name, u.email as landlord_email,
               pi.image_url as thumbnail
        FROM properties p
        LEFT JOIN users u ON p.landlord_id = u.id
        LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_thumbnail = 1
    `;
    const params = [];

    if (status) {
        sql += ` WHERE p.status = ?`;
        params.push(status);
    }

    sql += ` ORDER BY p.created_at DESC`;
    const [properties] = await db.execute(sql, params);
    return properties;
};

/**
 * Duyệt phòng
 */
const approveProperty = async (propertyId) => {
    const [result] = await db.execute(
        `UPDATE properties SET status = 'approved' WHERE id = ?`,
        [propertyId]
    );
    if (result.affectedRows === 0) throw new AppError('Không tìm thấy phòng', 404);
    return { id: propertyId, status: 'approved' };
};

/**
 * Từ chối phòng
 */
const rejectProperty = async (propertyId, reason) => {
    const [result] = await db.execute(
        `UPDATE properties SET status = 'rejected' WHERE id = ?`,
        [propertyId]
    );
    if (result.affectedRows === 0) throw new AppError('Không tìm thấy phòng', 404);
    return { id: propertyId, status: 'rejected', reason };
};

/**
 * Xóa phòng
 */
const deleteProperty = async (propertyId) => {
    const [result] = await db.execute(
        `DELETE FROM properties WHERE id = ?`,
        [propertyId]
    );
    if (result.affectedRows === 0) throw new AppError('Không tìm thấy phòng', 404);
    return true;
};

/**
 * Lấy danh sách tất cả users
 */
const getAllUsers = async (role) => {
    let sql = `
        SELECT id, full_name, email, phone, role, is_active, created_at,
               (SELECT COUNT(*) FROM properties WHERE landlord_id = users.id) as property_count
        FROM users
    `;
    const params = [];

    if (role) {
        sql += ` WHERE role = ?`;
        params.push(role);
    }

    sql += ` ORDER BY created_at DESC`;
    const [users] = await db.execute(sql, params);
    return users;
};

/**
 * Xóa user
 */
const deleteUser = async (userId) => {
    const [existing] = await db.execute(
        `SELECT role FROM users WHERE id = ?`, [userId]
    );
    if (existing.length === 0) throw new AppError('Không tìm thấy user', 404);
    if (existing[0].role === 'admin') throw new AppError('Không thể xóa tài khoản Admin', 403);

    await db.execute(`DELETE FROM users WHERE id = ?`, [userId]);
    return true;
};

/**
 * Toggle trạng thái active/inactive của user
 */
const toggleUserStatus = async (userId) => {
    const [existing] = await db.execute(
        `SELECT is_active, role FROM users WHERE id = ?`, [userId]
    );
    if (existing.length === 0) throw new AppError('Không tìm thấy user', 404);
    if (existing[0].role === 'admin') throw new AppError('Không thể khóa tài khoản Admin', 403);

    const newStatus = existing[0].is_active ? 0 : 1;
    await db.execute(`UPDATE users SET is_active = ? WHERE id = ?`, [newStatus, userId]);
    return { id: userId, is_active: newStatus };
};

module.exports = {
    getStats, getAllProperties, approveProperty, rejectProperty,
    deleteProperty, getAllUsers, deleteUser, toggleUserStatus
};