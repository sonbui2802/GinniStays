const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/avatars'); // Lưu local
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Chỗ này sau này chỉ cần đổi storage thành CloudinaryStorage là xong Hybrid
const uploadAvatar = multer({ storage: storage }); 

module.exports = { uploadAvatar };