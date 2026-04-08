const bcrypt = require('bcryptjs');
const { pool: db } = require('../config/db'); 
const { AppError } = require('../utils/response');

/**
 * Handles user registration logic
 */
const registerUser = async (fullName, email, password) => {
    // 1. Check if the user already exists
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
        throw new AppError('Email already exists', 400);
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert into the database (role defaults to 'tenant' as per schema)
    const [result] = await db.execute(
        'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
        [fullName, email, passwordHash]
    );

    // 4. Return the new user object (NEVER return the password_hash)
    return {
        id: result.insertId,
        full_name: fullName,
        email: email,
        role: 'tenant'
    };
};

/**
 * Handles user login logic
 */
const loginUser = async (email, password) => {
    // 1. Find user by email
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users;

    // 2. Check if user exists and password matches
    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    // 3. Check if account is active
    if (!user.is_active) {
        throw new AppError('Your account has been deactivated.', 403);
    }

    // 4. Return user object without sensitive data
    return {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
    };
};

module.exports = {
    registerUser,
    loginUser
};