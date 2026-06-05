const bcrypt = require('bcryptjs');
const { pool: db } = require('../config/db'); 
const { AppError } = require('../utils/response');

const registerUser = async (fullName, email, password, phone, role) => {
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
        throw new AppError('Email already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await db.execute(
        'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
        [fullName, email, passwordHash, phone || null, role]
    );

    return {
        id: result.insertId,
        full_name: fullName,
        email: email,
        phone: phone || null,
        role: role
    };
};

const loginUser = async (email, password) => {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0]; // ✅ lấy object, không phải array

    if (!user) { // ✅ giờ check đúng
        throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash); // ✅ đúng field
    if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    if (!user.is_active) {
        throw new AppError('Your account has been deactivated.', 403);
    }

    return {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url
    };
};

module.exports = { registerUser, loginUser };