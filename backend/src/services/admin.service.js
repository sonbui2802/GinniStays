const { pool: db } = require('../config/db');
const { AppError } = require('../utils/response');

/**
 * [ADMIN] Lấy danh sách tất cả người dùng (để quản lý)
 */
const getAllUsers = async () => {
    const [users] = await db.execute(
        'SELECT id, email, full_name, phone, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    return users;
};

/**
 * [ADMIN] Khóa / Mở khóa tài khoản người dùng (Soft Delete)
 */
const toggleUserStatus = async (userId, isActive) => {
    // Không cho phép Admin tự khóa chính mình
    // (Có thể thêm logic check role ở đây)
    
    const [result] = await db.execute(
        'UPDATE users SET is_active = ? WHERE id = ?',
        [isActive ? 1 : 0, userId]
    );

    if (result.affectedRows === 0) throw new AppError('Không tìm thấy người dùng', 404);
    
    return { user_id: userId, is_active: isActive };
};

/**
 * [ADMIN] Lấy danh sách các phòng trọ đang chờ duyệt
 */
const getPendingProperties = async () => {
    const [properties] = await db.execute(
        "SELECT * FROM properties WHERE status = 'pending' ORDER BY created_at ASC"
    );
    return properties;
};

/**
 * [ADMIN] Phê duyệt hoặc Từ chối phòng trọ vi phạm
 */
const moderateProperty = async (propertyId, newStatus) => {
    if (!['approved', 'rejected'].includes(newStatus)) {
        throw new AppError('Trạng thái kiểm duyệt không hợp lệ', 400);
    }

    const [result] = await db.execute(
        'UPDATE properties SET status = ? WHERE id = ?',
        [newStatus, propertyId]
    );

    if (result.affectedRows === 0) throw new AppError('Không tìm thấy phòng trọ', 404);

    return { property_id: propertyId, new_status: newStatus };
};

module.exports = {
    getAllUsers,
    toggleUserStatus,
    getPendingProperties,
    moderateProperty
};