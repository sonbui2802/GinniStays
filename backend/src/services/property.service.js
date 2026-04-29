const { pool: db } = require('../config/db');
const { AppError } = require('../utils/response');

/**
 * Tạo một Bài đăng / Phòng mới (Landlord)
 */
const createProperty = async (landlordId, propertyData) => {
    const { 
        title, description, price, area, max_occupants, property_type, 
        address, ward, district, city, amenities 
    } = propertyData;

    // Validate bắt buộc phải có giá
    if (!price) throw new AppError('Vui lòng nhập giá thuê phòng (price)', 400);

    const amenitiesJson = amenities ? JSON.stringify(amenities) : null;

    const [result] = await db.execute(
        `INSERT INTO properties 
        (landlord_id, title, description, price, area, max_occupants, property_type, address, ward, district, city, amenities, status, rental_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'available')`,
        [landlordId, title, description, price, area || null, max_occupants || null, property_type || 'boarding_house', address, ward, district, city, amenitiesJson]
    );

    return {
        id: result.insertId,
        title,
        price,
        status: 'pending',
        rental_status: 'available'
    };
};

/**
 * Lấy tất cả Phòng đang trống (Public)
 */
const getAllProperties = async () => {
    const [properties] = await db.execute(`
        SELECT p.*, pi.image_url AS thumbnail 
        FROM properties p 
        LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_thumbnail = 1 
        WHERE p.status = 'approved' AND p.rental_status = 'available'
        ORDER BY p.created_at DESC
    `);
    return properties;
};

/**
 * Lấy danh sách Bài đăng của chính Landlord này
 */
const getMyProperties = async (landlordId) => {
    const [properties] = await db.execute(
        'SELECT * FROM properties WHERE landlord_id = ? ORDER BY created_at DESC', 
        [landlordId]
    );
    return properties;
};

/**
 * Lấy chi tiết 1 Phòng (Kèm theo toàn bộ ảnh)
 */
const getPropertyById = async (propertyId) => {
    // 1. Lấy thông tin phòng (ĐÃ FIX LỖI mảng)
    const [properties] = await db.execute('SELECT * FROM properties WHERE id = ?', [propertyId]);
    const property = properties; 

    if (!property) throw new AppError('Không tìm thấy phòng này', 404);

    // 2. Lấy luôn mảng ảnh của phòng này ghép vào object trả về
    const [images] = await db.execute('SELECT image_url, is_thumbnail FROM property_images WHERE property_id = ?', [propertyId]);
    property.images = images;

    return property;
};

/**
 * Sửa thông tin Phòng (Chỉ chủ sở hữu)
 */
const updateProperty = async (propertyId, landlordId, propertyData) => {
    const { 
        title, description, price, area, max_occupants, property_type, 
        address, ward, district, city, amenities, rental_status 
    } = propertyData;

    // 1. Kiểm tra quyền sở hữu
    const [existing] = await db.execute('SELECT id FROM properties WHERE id = ? AND landlord_id = ?', [propertyId, landlordId]);
    if (existing.length === 0) {
        throw new AppError('Không tìm thấy phòng hoặc bạn không có quyền chỉnh sửa', 403);
    }

    const amenitiesJson = amenities ? JSON.stringify(amenities) : null;

    // 2. Cập nhật
    await db.execute(
        `UPDATE properties 
         SET title = ?, description = ?, price = ?, area = ?, max_occupants = ?, property_type = ?, 
             address = ?, ward = ?, district = ?, city = ?, amenities = ?, rental_status = ?
         WHERE id = ?`,
        [title, description, price, area || null, max_occupants || null, property_type, address, ward, district, city, amenitiesJson, rental_status || 'available', propertyId]
    );

    return { id: propertyId, title, updated: true };
};

/**
 * Xóa Phòng (Chỉ chủ sở hữu)
 */
const deleteProperty = async (propertyId, landlordId) => {
    const [result] = await db.execute('DELETE FROM properties WHERE id = ? AND landlord_id = ?', [propertyId, landlordId]);
    if (result.affectedRows === 0) {
        throw new AppError('Không tìm thấy phòng hoặc bạn không có quyền xóa', 403);
    }
    return true;
};

/**
 * Upload nhiều ảnh cho Phòng
 */
const uploadPropertyImages = async (propertyId, landlordId, files) => {
    const [existing] = await db.execute('SELECT id FROM properties WHERE id = ? AND landlord_id = ?', [propertyId, landlordId]);
    if (existing.length === 0) {
        throw new AppError('Không tìm thấy phòng hoặc bạn không có quyền thêm ảnh!', 403);
    }

    const imageData = files.map((file, index) => [
        propertyId,
        file.path, 
        index === 0 ? true : false 
    ]);

    const sql = "INSERT INTO property_images (property_id, image_url, is_thumbnail) VALUES ?";
    await db.query(sql, [imageData]);

    return files.map(f => f.path);
};

module.exports = { 
    createProperty, 
    getAllProperties, 
    getMyProperties, 
    getPropertyById, 
    updateProperty, 
    deleteProperty,
    uploadPropertyImages 
};