const userService = require('../services/user.service');

const updateProfile = async (req, res, next) => {
    try {
        const { full_name, phone } = req.body;
        const userId = req.user.id;
        let avatar_url = req.body.avatar_url; 

        // Nếu có up file thì gán link local
        if (req.file) {
            avatar_url = `http://localhost:5000/uploads/avatars/${req.file.filename}`;
        }

        const updatedUser = await userService.updateProfile(userId, { full_name, phone, avatar_url });
        
        res.status(200).json({ success: true, data: updatedUser, message: "Cập nhật thành công" });
    } catch (error) {
        next(error); // Đẩy lỗi ra cho error.middleware xử lý
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        await userService.changePassword(userId, oldPassword, newPassword);
        
        res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        next(error);
    }
};

module.exports = { updateProfile, changePassword };