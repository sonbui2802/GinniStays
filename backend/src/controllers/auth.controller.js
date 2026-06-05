const authService = require('../services/auth.service');
const { generateToken } = require('../utils/jwt');
const { AppError, successResponse } = require('../utils/response');

const register = async (req, res, next) => {
    try {
        // CẬP NHẬT: Nhận thêm phone và role từ body
        const { full_name, email, password, phone, role } = req.body;

        // Validation
        if (!full_name) throw new AppError('full_name is required', 400);
        if (!email) throw new AppError('email is required', 400);
        if (!password) throw new AppError('password is required', 400);
        if (password.length < 6) throw new AppError('password must be at least 6 characters long', 400);

        // BẢO MẬT: Kiểm soát Role chặt chẽ, chống hack quyền Admin
        let assignedRole = 'tenant'; 
        if (role === 'landlord') {
            assignedRole = 'landlord';
        } else if (role === 'admin') {
            // Ai cố tình gọi API truyền lên role admin sẽ bị tống cổ ra ngay
            throw new AppError('Bạn không có quyền đăng ký tài khoản Quản trị viên', 403);
        }

        // Call service
        const user = await authService.registerUser(full_name, email, password, phone, assignedRole);

        // Generate JWT Token (Tự động đăng nhập luôn sau khi đăng ký)
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        // Send response
        return successResponse(res, 'User registered successfully', { token, user }, 201);
    } catch (error) {
        next(error); 
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        const user = await authService.loginUser(email, password);

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        return successResponse(res, 'Login successful', { token, user }, 200);
    } catch (error) {
        next(error);
    }
};

const getCurrentUser = async (req, res, next) => {
    try {
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