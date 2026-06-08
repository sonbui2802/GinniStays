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
 * Lấy tất cả Phòng đang trống (Public) - Dùng db.query thay db.execute để tránh lỗi mysql2 prepared statement với LIMIT/OFFSET
 */
const getAllProperties = async (page = 1, limit = 6, propertyType = null) => {
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 6;
    const offset = (parsedPage - 1) * parsedLimit;

    let total = 0;
    let properties = [];

    if (propertyType) {
        // db.query dùng string interpolation an toàn cho LIMIT/OFFSET (integer, không có SQL injection risk)
        // propertyType vẫn dùng ? để tránh SQL injection
        const [countRows] = await db.query(
            `SELECT COUNT(*) as total 
             FROM properties 
             WHERE status = 'approved' 
               AND rental_status = 'available' 
               AND property_type = ?`,
            [propertyType]
        );
        total = countRows[0].total;

        const [rows] = await db.query(
            `SELECT p.*, pi.image_url AS thumbnail 
             FROM properties p 
             LEFT JOIN property_images pi 
               ON p.id = pi.property_id AND pi.is_thumbnail = 1 
             WHERE p.status = 'approved' 
               AND p.rental_status = 'available' 
               AND p.property_type = ?
             ORDER BY p.created_at DESC
             LIMIT ${parsedLimit} OFFSET ${offset}`,
            [propertyType]
        );
        properties = rows;

    } else {
        const [countRows] = await db.query(
            `SELECT COUNT(*) as total 
             FROM properties 
             WHERE status = 'approved' 
               AND rental_status = 'available'`
        );
        total = countRows[0].total;

        const [rows] = await db.query(
            `SELECT p.*, pi.image_url AS thumbnail 
             FROM properties p 
             LEFT JOIN property_images pi 
               ON p.id = pi.property_id AND pi.is_thumbnail = 1 
             WHERE p.status = 'approved' 
               AND p.rental_status = 'available'
             ORDER BY p.created_at DESC
             LIMIT ${parsedLimit} OFFSET ${offset}`
        );
        properties = rows;
    }

    const totalPages = Math.ceil(total / parsedLimit);

    return {
        properties,
        pagination: {
            currentPage: parsedPage,
            limit: parsedLimit,
            totalItems: total,
            totalPages
        }
    };
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
    const property = rows[0];

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

    // ✅ FIX: SELECT thêm rental_status để check được bên dưới
    const [existing] = await db.execute(
        'SELECT id, rental_status FROM properties WHERE id = ? AND landlord_id = ?',
        [propertyId, landlordId]
    );
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
    const [result] = await db.execute(
        'DELETE FROM properties WHERE id = ? AND landlord_id = ?',
        [propertyId, landlordId]
    );
    if (result.affectedRows === 0) {
        throw new AppError('Không tìm thấy phòng hoặc bạn không có quyền xóa', 403);
    }
    return true;
};

/**
 * Upload nhiều ảnh cho Phòng
 */
const uploadPropertyImages = async (propertyId, landlordId, files) => {
    const [existing] = await db.execute(
        'SELECT id FROM properties WHERE id = ? AND landlord_id = ?',
        [propertyId, landlordId]
    );
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
    const [properties] = await db.execute(
        'SELECT id, rental_status FROM properties WHERE id = ? LIMIT 1',
        [propertyId]
    );
    if (properties.length === 0) return { exists: false };
    // ✅ FIX: phải dùng properties[0] thay vì properties trực tiếp
    if (properties[0].rental_status === 'rented') return { exists: true, available: false };
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

    const maxOccupants = rows[0].max_occupants || 99;
    const validCount = Math.max(0, Math.min(newOccupantsCount, maxOccupants));
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
    const { 
        keyword, district, city, minPrice, maxPrice, 
        minArea, maxArea, property_type, bedrooms, amenities 
    } = filters;

    let sql = `
        SELECT p.*, pi.image_url AS thumbnail
        FROM properties p
        LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_thumbnail = 1
        WHERE p.status = 'approved' AND p.rental_status = 'available'
    `;
    const params = [];

    if (keyword) {
        const cleanKeyword = keyword.trim().replace(/\s+/g, ' ');
        sql += ` AND (p.title LIKE ? OR p.address LIKE ? OR p.description LIKE ?)`;
        const kw = `%${cleanKeyword}%`;
        params.push(kw, kw, kw);
    }

    if (district) {
        const cleanDistrict = district.trim().replace(/\s+/g, ' ');
        sql += ` AND p.district LIKE ?`;
        params.push(`%${cleanDistrict}%`);
    }

    if (city) {
        const cleanCity = city.trim().replace(/\s+/g, ' ');
        sql += ` AND p.city LIKE ?`;
        params.push(`%${cleanCity}%`);
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

/**
 * Quét Database lấy Thành phố / Quận động
 */
const getAvailableLocations = async () => {
    const [rows] = await db.execute(`
        SELECT DISTINCT city, district 
        FROM properties 
        WHERE status = 'approved' AND city IS NOT NULL AND district IS NOT NULL
    `);

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
    updateOccupants, searchProperties, getAvailableLocations
};