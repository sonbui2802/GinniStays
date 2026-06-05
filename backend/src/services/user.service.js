const { pool: db } = require('../config/db');
const bcrypt = require('bcryptjs');
const { AppError } = require('../utils/response');

const updateProfile = async (userId, updateData) => {
    const { full_name, phone, avatar_url } = updateData;
    let query = 'UPDATE users SET full_name = ?, phone = ?';
    let params = [full_name, phone];

    // Nếu có avatar mới thì mới update cột avatar_url
    if (avatar_url) {
        query += ', avatar_url = ?';
        params.push(avatar_url);
    }
    query += ' WHERE id = ?';
    params.push(userId);

    await db.execute(query, params);

    // Trả về user mới để Frontend cập nhật Zustand
    const [[updatedUser]] = await db.execute(
        'SELECT id, email, full_name, phone, role, avatar_url FROM users WHERE id = ?', 
        [userId]
    );
    return updatedUser;
};

const changePassword = async (userId, oldPassword, newPassword) => {
    const [[user]] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
    
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) throw new AppError('Mật khẩu hiện tại không đúng', 400);

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, userId]);
};

module.exports = { updateProfile, changePassword };