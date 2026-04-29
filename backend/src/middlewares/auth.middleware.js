const { verifyToken } = require('../utils/jwt');
const { AppError } = require('../utils/response');

/**
 * Middleware to protect routes. Checks for a valid JWT token.
 */
const protect = (req, res, next) => {
    let token;

    // 1. Check if auth header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; // Extract token
    }

    // 2. If no token is found
    if (!token) {
        return next(new AppError('Access denied. No token provided.', 401));
    }

    try {
        // 3. Verify token
        const decoded = verifyToken(token);

        // 4. Attach the decoded payload to the request object
        req.user = decoded;
        next(); // Move to the next middleware or controller
    } catch (error) {
        // Token is invalid or expired
        return next(new AppError('Invalid or expired token', 401));
    }
};

/**
 * Middleware for Role-Based Access Control (RBAC).
 * Must be used AFTER the `protect` middleware.
 * @param  {...String} roles - Allowed roles (e.g., 'admin', 'landlord')
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Ensure user exists on request (from `protect` middleware)
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to access this resource', 403));
        }
        next();
    };
};

module.exports = {
    protect,
    authorizeRoles
};