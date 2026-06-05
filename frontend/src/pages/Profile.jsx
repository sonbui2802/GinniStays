import { useState, useRef } from 'react';
import { User, Lock, Upload, Loader2, Save } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const Profile = () => {
  const { user, login } = useAuthStore(); // Lấy hàm login để cập nhật lại user vô Zustand
  const [activeTab, setActiveTab] = useState('info');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // State Tab 1
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url);

  // State Tab 2
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // Handle Tab 1 (Update Profile)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Hiển thị tạm ảnh
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Dùng FormData vì có đính kèm File ảnh
      const data = new FormData();
      data.append('full_name', formData.full_name);
      data.append('phone', formData.phone);
      if (avatarFile) data.append('avatar', avatarFile);

      const res = await api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // MẸO: Nạp đè lại user mới vào Zustand, token giữ nguyên từ localStorage
      login(res.data.data, localStorage.getItem('token')); 
      alert('Cập nhật hồ sơ thành công!');
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Tab 2 (Change Password)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) return alert("Mật khẩu xác nhận không khớp!");
    
    setIsLoading(true);
    try {
      await api.put('/users/password', {
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword
      });
      alert('Đổi mật khẩu thành công!');
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 pt-28">
      <h1 className="text-3xl font-bold mb-8">Cài đặt tài khoản</h1>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'info' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <User size={20} /> Thông tin cá nhân
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'security' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Lock size={20} /> Đăng nhập và bảo mật
              </button>
            </li>
          </ul>
        </div>

        {/* Content */}
        <div className="w-full md:w-3/4 max-w-2xl">
          
          {/* TAB 1: THÔNG TIN */}
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-6 pb-6 border-b">
                <img 
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=FF385C&color=fff`} 
                  alt="avatar" 
                  className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm"
                />
                <div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
                    <Upload size={18} /> Đổi ảnh đại diện
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  <p className="text-sm text-gray-500 mt-2">Định dạng JPEG, PNG.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Tên pháp lý</label>
                <input 
                  type="text" 
                  value={formData.full_name} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Số điện thoại</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-500">Địa chỉ email (Không thể thay đổi)</label>
                <input type="email" value={user?.email || ''} disabled className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-4 py-3 outline-none cursor-not-allowed" />
              </div>

              <button type="submit" disabled={isLoading} className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center gap-2">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Cập nhật thông tin
              </button>
            </form>
          )}

          {/* TAB 2: BẢO MẬT */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold border-b pb-4">Đổi mật khẩu</h2>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  required
                  value={passData.oldPassword} 
                  onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Mật khẩu mới</label>
                <input 
                  type="password" 
                  required minLength={6}
                  value={passData.newPassword} 
                  onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  required minLength={6}
                  value={passData.confirmPassword} 
                  onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <button type="submit" disabled={isLoading} className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />} Lưu mật khẩu
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;