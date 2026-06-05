import { Search, Globe, Menu, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthModal from '../common/AuthModal';
import useAuthStore from '../../store/authStore';
import SearchBar from '../home/SearchBar';

const Navbar = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // STATE MỚI: Truyền tín hiệu người dùng muốn Đăng nhập, Đăng ký thường, hay Đăng ký Chủ trọ
  const [authMode, setAuthMode] = useState('login'); 

  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();               
    setIsMenuOpen(false);   
    navigate('/'); 
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 sm:px-10 lg:px-20 h-20">
          
          <Link to="/" className="flex items-center gap-2 text-pink-600">
            <Globe size={32} strokeWidth={2.5} />
            <span className="font-bold text-2xl tracking-tight hidden md:block">GinniStays</span>
          </Link>

          <SearchBar />

          <div className="flex items-center gap-2 sm:gap-4 relative">
            
            {user?.role === 'admin' ? (
              <Link to="/admin" className="hidden lg:block text-sm font-semibold hover:bg-purple-50 text-purple-600 px-4 py-2 rounded-full transition">
                🛡️ Quản trị hệ thống
              </Link>
            ) : user?.role === 'landlord' ? (
              <Link to="/host" className="hidden lg:block text-sm font-semibold hover:bg-gray-100 px-4 py-2 rounded-full transition">
                Quản lý phòng trọ
              </Link>
            ) : !user ? (
              /* ✅ SỬA: Ẩn hoàn toàn nút nếu đã đăng nhập hệ thống (cho dù là tenant) */
              <div 
                onClick={() => openAuth('register-landlord')} 
                className="hidden lg:block text-sm font-semibold hover:bg-gray-100 px-4 py-2 rounded-full cursor-pointer transition"
              >
                Trở thành Chủ trọ
              </div>
            ) : null}

            <div className="hover:bg-gray-100 p-2 rounded-full cursor-pointer transition hidden sm:block">
              <Globe size={20} className="text-gray-700" />
            </div>
            
            <div 
              onClick={() => {
                if (user) {
                  setIsMenuOpen(!isMenuOpen);
                } else {
                  // CẬP NHẬT: Default mở lên là Login
                  openAuth('login');
                }
              }} 
              className="flex items-center gap-2 border border-gray-300 rounded-full p-2 hover:shadow-md transition cursor-pointer bg-white ml-2"
            >
              <Menu size={20} className="text-gray-500 ml-1" />
              
              {user ? (
                <img 
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=FF385C&color=fff&rounded=true&bold=true`} 
                  alt="avatar" 
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
                />
              ) : (
                <UserCircle size={30} className="text-gray-500" />
              )}
            </div>

            {user && isMenuOpen && (
              <div className="absolute top-[120%] right-0 w-60 bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.12)] border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-sm text-gray-800">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                
                <Link to="/profile" className="block px-4 py-3 hover:bg-gray-50 text-sm font-semibold transition" onClick={() => setIsMenuOpen(false)}>
                  Hồ sơ cá nhân
                </Link>
                <Link to="/trips" className="block px-4 py-3 hover:bg-gray-50 text-sm font-semibold transition" onClick={() => setIsMenuOpen(false)}>
                  Phòng đã đặt
                </Link>

                {/* ✅ THÊM LINK DANH SÁCH YÊU THÍCH VÀO ĐÂY THEO CHỈ DẪN */}
                <Link
                  to="/wishlist"
                  className="block px-4 py-3 hover:bg-gray-50 text-sm font-semibold transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Danh sách yêu thích
                </Link>

                {user?.role === 'tenant' && (
                  <Link
                    to="/my-contracts"
                    className="block px-4 py-3 hover:bg-gray-50 text-sm font-semibold transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Hợp đồng của tôi
                  </Link>
                )}
                
                <div className="h-[1px] bg-gray-100 my-1"></div>
                
                <div 
                  onClick={handleLogout}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold text-pink-600 transition"
                >
                  Đăng xuất
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        // TRUYỀN STATE XUỐNG MODAL
        initialMode={authMode} 
      />
    </>
  );
};

export default Navbar;