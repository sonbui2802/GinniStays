import { X, Mail, Lock, Phone, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { createPortal } from 'react-dom';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  // Đồng bộ view dựa trên tín hiệu từ Navbar truyền xuống
  const [isLoginView, setIsLoginView] = useState(initialMode === 'login');
  const [isLandlord, setIsLandlord] = useState(initialMode === 'register-landlord');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const loginAction = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Reset và setup lại View mỗi khi Modal được mở ra với mode mới
  useEffect(() => {
    setIsLoginView(initialMode === 'login');
    setIsLandlord(initialMode === 'register-landlord');
    setErrorMessage('');
    reset();
  }, [initialMode, isOpen, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isLoginView) {
        const response = await api.post('/auth/login', {
          email: data.email,
          password: data.password
        });
        
        loginAction(response.data.data.user, response.data.data.token);
        onClose(); 

      } else {
        const response = await api.post('/auth/register', {
          full_name: data.fullName,
          email: data.email,
          password: data.password,
          phone: data.phone, // TRUYỀN SĐT
          role: isLandlord ? 'landlord' : 'tenant' // GÁN ROLE TỰ ĐỘNG
        });

        loginAction(response.data.data.user, response.data.data.token);
        onClose();
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    // Khi tự bấm chuyển đổi ở Footer, mặc định là Tenant
    setIsLandlord(false);
    setErrorMessage('');
    reset();
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{ zIndex: 99999 }} 
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-[560px] rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-700" />
          </button>
          <h2 className="font-bold text-base">
            {isLoginView ? 'Log in to GinniStays' : (isLandlord ? 'Become a GinniStays Host' : 'Sign up for GinniStays')}
          </h2>
          <div className="w-9" /> 
        </div>
        
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <h3 className="text-[22px] font-semibold mb-4">
            {isLandlord && !isLoginView ? 'Tham gia cộng đồng Chủ trọ' : 'Welcome to GinniStays'}
          </h3>

          {errorMessage && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm font-semibold border border-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            
            {!isLoginView && (
              <div className="relative mt-2">
                 <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-500 font-semibold uppercase">Họ và tên</label>
                 <input 
                    type="text" 
                    placeholder="Nguyễn Văn A" 
                    className={`w-full border rounded-lg px-4 py-3 outline-none transition-all ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-gray-400 focus:border-black focus:border-2'}`}
                    {...register("fullName", { required: !isLoginView ? "Vui lòng nhập họ tên" : false })}
                 />
              </div>
            )}

            {/* Ô NHẬP SĐT (Chỉ hiển thị khi Đăng ký) */}
            {!isLoginView && (
              <div className="relative mt-4">
                 <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-500 font-semibold uppercase">Số điện thoại</label>
                 <div className={`flex items-center border rounded-lg overflow-hidden transition-all ${errors.phone ? 'border-red-500 focus-within:border-red-500' : 'border-gray-400 focus-within:border-black focus-within:border-2'}`}>
                    <div className="pl-4 text-gray-400"><Phone size={18} /></div>
                    <input 
                      type="tel" 
                      placeholder="VD : 0912345678" 
                      className="w-full px-3 py-3 outline-none text-base"
                      {...register("phone", { 
                        required: !isLoginView ? "Vui lòng nhập số điện thoại" : false,
                        pattern: { value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/, message: "Số điện thoại không hợp lệ" }
                      })}
                    />
                 </div>
                 {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone.message}</p>}
              </div>
            )}

            <div className="relative mt-4">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-500 font-semibold uppercase">Địa chỉ Email </label>
              <div className={`flex items-center border rounded-lg overflow-hidden transition-all ${errors.email ? 'border-red-500 focus-within:border-red-500' : 'border-gray-400 focus-within:border-black focus-within:border-2'}`}>
                <div className="pl-4 text-gray-400"><Mail size={18} /></div>
                <input 
                  type="email" 
                  placeholder="Nhập email của bạn" 
                  className="w-full px-3 py-3 outline-none text-base"
                  {...register("email", { required: "Email is required" })}
                />
              </div>
            </div>

             <div className="relative mt-4">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-500 font-semibold uppercase">Password</label>
              <div className={`flex items-center border rounded-lg overflow-hidden transition-all ${errors.password ? 'border-red-500 focus-within:border-red-500' : 'border-gray-400 focus-within:border-black focus-within:border-2'}`}>
                <div className="pl-4 text-gray-400"><Lock size={18} /></div>
                <input 
                  type="password" 
                  placeholder="Nhập password" 
                  className="w-full px-3 py-3 outline-none text-base"
                  {...register("password", { required: "Password is required", minLength: 6 })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-pink-600 text-white font-semibold py-3.5 rounded-lg hover:bg-pink-700 transition mt-4 flex justify-center items-center gap-2 disabled:bg-opacity-70"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoginView ? 'Đăng nhập' : (isLandlord ? 'Đăng ký Chủ trọ' : 'Đăng ký')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
             {isLoginView ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
             <span className="font-semibold underline cursor-pointer hover:text-pink-600 transition" onClick={toggleView}>
               {isLoginView ? 'Đăng ký ngay' : 'Đăng nhập'}
             </span>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;