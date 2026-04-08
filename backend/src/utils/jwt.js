const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a user
 * @param {Object} payload - Data to encode in the token (e.g., id, email, role)
 * @returns {String} Signed JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

/**
 * Verifies a JWT token
 * @param {String} token - The JWT token to verify
 * @returns {Object} Decoded payload if valid
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken
};