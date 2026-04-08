const authService = require('../services/auth.service');
const { generateToken } = require('../utils/jwt');
const { AppError, successResponse } = require('../utils/response');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
    try {
        const { full_name, email, password } = req.body;

        // Validation
        if (!full_name) throw new AppError('full_name is required', 400);
        if (!email) throw new AppError('email is required', 400);
        if (!password) throw new AppError('password is required', 400);
        if (password.length < 6) throw new AppError('password must be at least 6 characters long', 400);

        // Call service
        const user = await authService.registerUser(full_name, email, password);

        // Send response
        return successResponse(res, 'User registered successfully', user, 201);
    } catch (error) {
        next(error); // Pass error to global error handler
    }
};

/**
 * Login an existing user
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        // Call service to verify credentials and get user
        const user = await authService.loginUser(email, password);

        // Generate JWT Token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        // Send response
        return successResponse(res, 'Login successful', { token, user }, 200);
    } catch (error) {
        next(error);
    }
};

/**
 * Get the currently logged-in user profile
 */
const getCurrentUser = async (req, res, next) => {
    try {
        // req.user is populated by the authMiddleware (protect)
        return successResponse(res, 'User profile fetched successfully', req.user, 200);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getCurrentUser
};