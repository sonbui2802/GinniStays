const { pool: db } = require('../config/db');
const { AppError } = require('../utils/response');

const getWishlist = async (tenantId) => {
    const [rows] = await db.execute(`
        SELECT w.id as wishlist_id, w.created_at as saved_at,
               p.id, p.title, p.price, p.district, p.city,
               p.area, p.property_type, p.rental_status,
               pi.image_url as thumbnail
        FROM wishlists w
        JOIN properties p ON w.property_id = p.id
        LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_thumbnail = 1
        WHERE w.tenant_id = ?
        ORDER BY w.created_at DESC
    `, [tenantId]);
    return rows;
};

const toggleWishlist = async (tenantId, propertyId) => {
    const [existing] = await db.execute(
        'SELECT id FROM wishlists WHERE tenant_id = ? AND property_id = ?',
        [tenantId, propertyId]
    );

    if (existing.length > 0) {
        await db.execute('DELETE FROM wishlists WHERE tenant_id = ? AND property_id = ?', [tenantId, propertyId]);
        return { saved: false };
    } else {
        await db.execute('INSERT INTO wishlists (tenant_id, property_id) VALUES (?, ?)', [tenantId, propertyId]);
        return { saved: true };
    }
};

const checkWishlist = async (tenantId, propertyId) => {
    const [rows] = await db.execute(
        'SELECT id FROM wishlists WHERE tenant_id = ? AND property_id = ?',
        [tenantId, propertyId]
    );
    return { saved: rows.length > 0 };
};

module.exports = { getWishlist, toggleWishlist, checkWishlist };