import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Đổi cổng này nếu Backend của bạn chạy cổng khác

});

// Tự động gắn Token vào mọi request nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;