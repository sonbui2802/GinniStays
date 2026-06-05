import { create } from 'zustand';

// --- HÀM HỖ TRỢ: Lục tìm két sắt ngay khi web vừa load ---
const getInitialUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

const getInitialToken = () => {
  return localStorage.getItem('token') || null;
};
// --------------------------------------------------------

const useAuthStore = create((set) => ({
  // ĐÃ SỬA: Nạp thẳng dữ liệu từ két sắt vào state thay vì để null
  user: getInitialUser(), 
  token: getInitialToken(), 

  // Hàm gọi khi đăng nhập thành công
  login: (userData, token) => {
    localStorage.setItem('token', token); 
    localStorage.setItem('user', JSON.stringify(userData)); 
    set({ user: userData, token: token });
  },

  // Hàm gọi khi đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // ĐÃ SỬA: Bổ sung xóa sạch user khỏi két sắt
    set({ user: null, token: null });
  }
}));

export default useAuthStore;