const { pool: db } = require('../config/db');
const { AppError } = require('../utils/response');

/**
 * Tạo một Bài đăng / Phòng mới (Landlord)
 */
const createProperty = async (landlordId, propertyData) => {
    const { 
        title, description, price, area, bedrooms, max_occupants, property_type,
        address, ward, district, city, amenities, latitude, longitude 
    } = propertyData;

    if (!price) throw new AppError('Vui lòng nhập giá thuê phòng (price)', 400);

    const amenitiesJson = amenities ? JSON.stringify(amenities) : null;

    const [result] = await db.execute(
        `INSERT INTO properties 
        (landlord_id, title, description, price, area, bedrooms, max_occupants, property_type, address, ward, district, city, latitude, longitude, amenities, status, rental_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'available')`, 
        [landlordId, title, description, price, area || null, bedrooms || 1, max_occupants || null, property_type || 'boarding_house', address, ward, district, city, latitude || null, longitude || null, amenitiesJson]
    );

    return {
        id: result.insertId,
        title,
        price,
        bedrooms: bedrooms || 1,
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
    const [rows] = await db.execute(`
        SELECT p.*, u.full_name as landlord_name, u.phone as landlord_phone, u.email as landlord_email
        FROM properties p
        JOIN users u ON p.landlord_id = u.id
        WHERE p.id = ?
    `, [propertyId]);

    if (rows.length === 0) throw new AppError('Không tìm thấy phòng này', 404);
    const property = rows[0]; // ✅ đã fix lỗi cũ luôn

    const [images] = await db.execute(
        'SELECT image_url, is_thumbnail FROM property_images WHERE property_id = ?', 
        [propertyId]
    );
    property.images = images;
    return property;
};

/**
 * Sửa thông tin Phòng (Chỉ chủ sở hữu)
 */
const updateProperty = async (propertyId, landlordId, propertyData) => {
    const { 
        title, description, price, area, bedrooms, max_occupants, property_type,
        address, ward, district, city, amenities, rental_status, latitude, longitude
    } = propertyData;

    const [existing] = await db.execute('SELECT id FROM properties WHERE id = ? AND landlord_id = ?', [propertyId, landlordId]);
    if (existing.length === 0) {
        throw new AppError('Không tìm thấy phòng hoặc bạn không có quyền chỉnh sửa', 403);
    }
    if (existing[0].rental_status === 'rented') {
        throw new AppError('Không thể sửa phòng đang có hợp đồng hiệu lực', 403);
    }
    const amenitiesJson = amenities ? JSON.stringify(amenities) : null;

    await db.execute(
        `UPDATE properties 
         SET title = ?, description = ?, price = ?, area = ?, bedrooms = ?, max_occupants = ?, property_type = ?, 
             address = ?, ward = ?, district = ?, city = ?, latitude = ?, longitude = ?, amenities = ?, rental_status = ?
         WHERE id = ?`,
        [title, description, price, area || null, bedrooms || 1, max_occupants || null, property_type, address, ward, district, city, latitude || null, longitude || null, amenitiesJson, rental_status || 'available', propertyId]
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

/**
 * Kiểm tra xem phòng có tồn tại và đang trống không (Dành cho Viewing Request)
 */
const checkAvailability = async (propertyId) => {
    const [properties] = await db.execute('SELECT id, rental_status FROM properties WHERE id = ? LIMIT 1', [propertyId]);
    if (properties.length === 0) return { exists: false };
    if (properties.rental_status === 'rented') return { exists: true, available: false };
    return { exists: true, available: true };
};

/**
 * Cập nhật số người ở hiện tại (Tự động tính toán trạng thái Full phòng)
 */
const updateOccupants = async (propertyId, landlordId, newOccupantsCount) => {
    const [rows] = await db.execute(
        'SELECT max_occupants FROM properties WHERE id = ? AND landlord_id = ?', 
        [propertyId, landlordId]
    );
    
    if (rows.length === 0) {
        throw new AppError('Không tìm thấy phòng hoặc bạn không có quyền!', 403);
    }

    const maxOccupants = rows[0].max_occupants || 99; // ✅ thêm [0]
    const validCount = Math.max(0, Math.min(newOccupantsCount, maxOccupants));
    
    // ✅ Sửa logic: có người ở (>0) là rented, không người (=0) là available
    const rentalStatus = validCount > 0 ? 'rented' : 'available';

    await db.execute(
        'UPDATE properties SET current_occupants = ?, rental_status = ? WHERE id = ?',
        [validCount, rentalStatus, propertyId]
    );

    return { id: propertyId, current_occupants: validCount, rental_status: rentalStatus };
};
/**
 * Tìm kiếm + Lọc phòng (Public)
 */
const searchProperties = async (filters) => {
    const { keyword, district, city, minPrice, maxPrice, minArea, maxArea, property_type, bedrooms, amenities } = filters;

    let sql = `
        SELECT p.*, pi.image_url AS thumbnail
        FROM properties p
        LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_thumbnail = 1
        WHERE p.status = 'approved' AND p.rental_status = 'available'
    `;
    const params = [];

    if (keyword) {
        sql += ` AND (p.title LIKE ? OR p.address LIKE ? OR p.description LIKE ?)`;
        const kw = `%${keyword}%`;
        params.push(kw, kw, kw);
    }
    if (district) {
        sql += ` AND p.district = ?`;
        params.push(district);
    }
    if (city) {
        sql += ` AND p.city = ?`;
        params.push(city);
    }
    if (minPrice) {
        sql += ` AND p.price >= ?`;
        params.push(Number(minPrice));
    }
    if (maxPrice) {
        sql += ` AND p.price <= ?`;
        params.push(Number(maxPrice));
    }
    if (minArea) {
        sql += ` AND p.area >= ?`;
        params.push(Number(minArea));
    }
    if (maxArea) {
        sql += ` AND p.area <= ?`;
        params.push(Number(maxArea));
    }
    if (property_type) {
        sql += ` AND p.property_type = ?`;
        params.push(property_type);
    }
    if (bedrooms) {
        sql += ` AND p.bedrooms = ?`;
        params.push(Number(bedrooms));
    }
    if (amenities && amenities.length > 0) {
        const amenityList = Array.isArray(amenities) ? amenities : [amenities];
        amenityList.forEach(a => {
            sql += ` AND JSON_CONTAINS(p.amenities, ?)`;
            params.push(JSON.stringify(a));
        });
    }

    sql += ` ORDER BY p.created_at DESC`;
    const [properties] = await db.execute(sql, params);
    return properties;
};

// ✅ TÍNH NĂNG MỚI: Quét Database lấy Thành phố / Quận động
const getAvailableLocations = async () => {
    const [rows] = await db.execute(`
        SELECT DISTINCT city, district 
        FROM properties 
        WHERE status = 'approved' AND city IS NOT NULL AND district IS NOT NULL
    `);

    // Gom nhóm data trả về dạng: { "Hà Nội": ["Cầu Giấy", "Đống Đa"], "Hồ Chí Minh": ["Thủ Đức"] }
    const locations = rows.reduce((acc, curr) => {
        if (!acc[curr.city]) acc[curr.city] = [];
        if (curr.district && !acc[curr.city].includes(curr.district)) {
            acc[curr.city].push(curr.district);
        }
        return acc;
    }, {});

    return locations;
};

module.exports = { 
    createProperty, getAllProperties, getMyProperties, getPropertyById, 
    updateProperty, deleteProperty, checkAvailability, uploadPropertyImages,
    updateOccupants, searchProperties, getAvailableLocations // ✅ export thêm
};