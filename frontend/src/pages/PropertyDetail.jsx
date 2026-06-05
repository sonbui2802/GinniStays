import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Star, Share, Heart, Medal, MapPin, Shield, ChevronDown, CheckSquare, Calendar, Phone, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const [viewerIndex, setViewerIndex] = useState(null); 
  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingForm, setViewingForm] = useState({
    viewing_date: '',
    viewing_time: '',
    notes: ''
  });

  // State lưu trạng thái wishlist
  const [isSaved, setIsSaved] = useState(false);

  // ✅ 1. FETCH PROPERTY TRƯỚC: Lấy dữ liệu chi tiết phòng trọ khi mount component
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        const data = res?.data?.data || res?.data; // Fix an toàn hơn khi parse data
        setProperty(Array.isArray(data) ? data : data);
      } catch (error) {
        console.error("Lỗi lấy chi tiết phòng:", error);
      } finally {
        // 🛠️ ĐÃ SỬA LỖI 1: Xóa hoàn toàn dòng setImageIsLoading(false) không tồn tại
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // ✅ 2. CHECK WISHLIST SAU: Chạy sau khi property đã có dữ liệu hợp lệ
  useEffect(() => {
    if (!user || !property) return;
    const check = async () => {
        try {
            const res = await api.get(`/wishlists/${property.id}/check`);
            setIsSaved(res.data.data.saved);
        } catch {}
    };
    check();
  }, [property?.id]); // Khớp dependency theo sự thay đổi của property id

  const handleToggleWishlist = async () => {
    if (!user) { alert('Vui lòng đăng nhập!'); return; }
    try {
        const res = await api.post(`/wishlists/${property.id}/toggle`);
        setIsSaved(res.data.data.saved);
    } catch {}
  };

  const isFull = property && (
      property.rental_status === 'rented' || 
      (property.max_occupants && (property.current_occupants || 0) >= property.max_occupants)
  );

  const handleOpenViewingModal = () => {
    if (isFull) {
        alert("Phòng này đã kín chỗ hoặc đã cho thuê, không thể đặt lịch hẹn xem!");
        return;
    }
    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng tính năng Hẹn xem phòng!");
      return;
    }
    if (user.role === 'landlord' && property.landlord_id === user.id) {
      alert("Bạn không thể tự đặt lịch xem phòng do chính mình đăng tải!");
      return;
    }
    setIsViewingModalOpen(true);
  };

  const handleSubmitViewing = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const today = new Date();
      const selectedDate = new Date(viewingForm.viewing_date);
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const selectedMidnight = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

      if (selectedMidnight < todayMidnight) {
        alert("Không thể đặt lịch vào ngày đã qua. Vui lòng chọn ngày từ hôm nay trở đi!");
        setIsSubmitting(false);
        return;
      }

      if (selectedMidnight.getTime() === todayMidnight.getTime()) {
        const match = viewingForm.viewing_time.match(/- (\d{2}):/); 
        if (match) {
          const endHour = parseInt(match[1], 10);
          if (today.getHours() >= endHour) {
            alert("Khung giờ này đã trôi qua trong ngày hôm nay. Vui lòng chọn khung giờ khác!");
            setIsSubmitting(false);
            return; 
          }
        }
      }

      const finalMessage = `Khung giờ hẹn: ${viewingForm.viewing_time}. Lời nhắn: ${viewingForm.notes || 'Không có'}`;
      const payload = {
        property_id: Number(id),
        preferred_date: viewingForm.viewing_date,
        message: finalMessage 
      };

      await api.post('/viewing-requests', payload);
      alert("🎉 Đặt lịch xem phòng thành công! Chủ nhà sẽ sớm liên hệ với bạn.");
      setIsViewingModalOpen(false); 
      setViewingForm({ viewing_date: '', viewing_time: '', notes: '' }); 
    } catch (error) {
      console.error("Lỗi đặt lịch:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setViewerIndex((prev) => (prev > 0 ? prev - 1 : 4)); 
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setViewerIndex((prev) => (prev < 4 ? prev + 1 : 0)); 
  };

  const todayDate = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-pink-600" size={48} /></div>;
  }

  if (!property) {
    return <div className="text-center mt-20 text-2xl font-bold">Không tìm thấy phòng!</div>;
  }

  // Bọc an toàn để tránh lỗi sập web nếu JSON format bị sai
  let amenitiesList = [];
  try {
    amenitiesList = typeof property.amenities === 'string' 
      ? JSON.parse(property.amenities || '[]') 
      : (property.amenities || []);
  } catch (err) {
    console.error("Lỗi parse amenities JSON:", err);
    amenitiesList = [];
  }

  const fallbackImages = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=80", 
    "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?w=800&q=80", 
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", 
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80", 
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80"  
  ];

  const getImageUrl = (index, isLightbox = false) => {
    let rawUrl = fallbackImages[index];
    if (property?.images && property.images.length > index) {
      rawUrl = property.images[index].image_url;
    }
    if (!rawUrl.includes('res.cloudinary.com')) return rawUrl;
    const parts = rawUrl.split('/upload/');
    if (parts.length !== 2) return rawUrl;

    let transformation = '';
    if (isLightbox) {
      transformation = 'q_auto:good,f_auto,dpr_2.0,c_limit,w_1920,h_1080';
    } else {
      const gridDims = [
        { w: 1000, h: 1000 }, 
        { w: 800, h: 800 },   
        { w: 800, h: 800 },   
        { w: 800, h: 800 },   
        { w: 800, h: 800 },   
      ];
      const dim = gridDims[index] || { w: 800, h: 800 };
      transformation = `q_auto:good,f_auto,w_${dim.w},h_${dim.h},c_fill,g_auto`;
    }
    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* 1. HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">{property.title}</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
            <span className="flex items-center gap-1"><Star size={16} className="fill-black" /> 4.9</span>
            <span className="underline cursor-pointer">128 đánh giá</span>
            <span className="flex items-center gap-1"><Medal size={16} className="text-pink-600"/> Chủ nhà siêu cấp</span>
            <span className="underline cursor-pointer">{property.address}, {property.district}, {property.city}</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition"><Share size={18}/> Chia sẻ</button>
            
            <button
              onClick={handleToggleWishlist}
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition"
            >
              <Heart
                size={18}
                className={isSaved ? 'fill-pink-500 text-pink-500' : ''}
              />
              {isSaved ? 'Đã lưu' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. THƯ VIỆN ẢNH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-2xl relative mb-12">
        <div onClick={() => setViewerIndex(0)} className="md:col-span-2 h-full cursor-pointer overflow-hidden relative">
          <img src={getImageUrl(0)} alt="Main Room" className="w-full h-full object-cover brightness-100 hover:brightness-90 transition duration-300" />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2 h-full col-span-1">
          {Array.from({ length: 2 }, (_, idx) => idx + 1).map((idx) => (
            <div key={idx} onClick={() => setViewerIndex(idx)} className="cursor-pointer overflow-hidden relative">
              <img src={getImageUrl(idx)} alt={`Room ${idx}`} className="w-full h-full object-cover brightness-100 hover:brightness-90 transition duration-300" />
            </div>
          ))}
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2 h-full col-span-1">
          {Array.from({ length: 2 }, (_, idx) => idx + 3).map((idx) => (
            <div key={idx} onClick={() => setViewerIndex(idx)} className="cursor-pointer overflow-hidden relative">
              <img src={getImageUrl(idx)} alt={`Room ${idx}`} className="w-full h-full object-cover brightness-100 hover:brightness-90 transition duration-300" />
            </div>
          ))}
        </div>
        <button onClick={() => setViewerIndex(0)} className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg font-semibold border border-black shadow-md hover:bg-gray-100 transition z-10 text-sm text-gray-900">
          Hiển thị tất cả ảnh
        </button>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
        <div className="col-span-2 space-y-8">
          <div className="flex justify-between items-center pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-semibold mb-1 text-gray-900">
                {property.property_type === 'boarding_house' ? 'Phòng trọ' : 
                 property.property_type === 'apartment_building' ? 'Chung cư mini' : 
                 property.property_type === 'single_apartment' ? 'Căn hộ (Apartment)' :
                 property.property_type === 'whole_house' ? 'Nhà nguyên căn' :
                 'Không gian cho thuê'} - Chủ nhà: {property.landlord_name || 'Hệ thống'}
              </h2>
              <p className="text-gray-600">
                {property.max_occupants ? `Phù hợp tối đa ${property.max_occupants} người` : 'Chưa cập nhật số người ở'} · 
                {property.area ? ` Diện tích ${property.area} m²` : ' Chưa cập nhật diện tích'}
              </p>
            </div>
            <div className="w-14 h-14 bg-gray-300 rounded-full overflow-hidden shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(property.landlord_name || 'Host')}&background=FF385C&color=fff&bold=true`}
                alt="Host Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6 pb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <Shield size={28} className="text-gray-700 shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Thông tin đã xác thực</h3>
                <p className="text-gray-500 text-sm">GinniStays đã kiểm tra tính xác thực của thông tin và hình ảnh phòng trọ này.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin size={28} className="text-gray-700 shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Vị trí thuận tiện</h3>
                <p className="text-gray-500 text-sm">Gần trạm xe buýt, chợ và các trường đại học lớn trong khu vực.</p>
              </div>
            </div>
          </div>

          <div className="pb-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Giới thiệu về không gian này</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description || "Phòng trọ khép kín, sạch sẽ, thoáng mát. Nằm trong khu vực an ninh tốt, yên tĩnh, phù hợp cho sinh viên và người đi làm.\n\nĐiện nước giá dân, tính theo đồng hồ riêng. Không chung chủ, tự do giờ giấc."}
            </p>
            <button className="font-semibold underline mt-4 flex items-center gap-1 text-gray-900">Hiển thị thêm <ChevronDown size={16}/></button>
          </div>

          <div className="pb-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Tiện ích nơi này cung cấp</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {amenitiesList.length > 0 ? amenitiesList.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-700">
                  <CheckSquare size={24} className="text-gray-400" />
                  <span>{item}</span>
                </div>
              )) : (
                <p className="text-gray-500 col-span-2">Chủ nhà chưa cập nhật tiện ích.</p>
              )}
            </div>
          </div>
        </div>

        {/* 4. CỘT ĐẶT LỊCH */}
        <div className="col-span-1">
          <div className="sticky top-28 border border-gray-200 rounded-2xl p-6 shadow-xl bg-white transition hover:shadow-2xl">
            <div className="flex items-end gap-1 mb-6 pb-6 border-b border-gray-200">
              <span className="text-3xl font-bold text-gray-900">
                {property.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(property.price) : 'Đang cập nhật'}
              </span>
              {property.price && <span className="text-gray-500 mb-1">/ tháng</span>}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium text-gray-500">Diện tích</span>
                <span className="font-semibold">{property.area ? `${property.area} m²` : '--'}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium text-gray-500">Số người hiện tại</span>
                <span className="font-semibold">{property.current_occupants || 0} / {property.max_occupants || '--'}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium text-gray-500">Trạng thái</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${isFull ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                  {isFull ? 'Đã kín chỗ' : 'Còn trống'}
                </span>
              </div>
            </div>

            <button 
              onClick={handleOpenViewingModal}
              disabled={isFull}
              className={`w-full font-bold text-lg py-3.5 rounded-xl transition shadow-md mb-3 flex justify-center items-center gap-2 
                ${isFull 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-pink-600 text-white hover:bg-pink-700 active:scale-[0.98]'
                }`}
            >
              <Calendar size={20} /> 
              {isFull ? 'Phòng đã hết chỗ' : 'Hẹn xem phòng'}
            </button>

            <button
              onClick={() => setIsContactOpen(true)}
              className="w-full bg-white text-gray-900 border-2 border-gray-900 font-bold text-lg py-3.5 rounded-xl hover:bg-gray-50 transition flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              <Phone size={20} /> Liên hệ Chủ trọ
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">Cam kết không thu phí môi giới</p>
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {viewerIndex !== null && createPortal(
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 sm:p-8 animate-in fade-in" onClick={() => setViewerIndex(null)}>
          <button onClick={() => setViewerIndex(null)} className="absolute top-6 right-6 text-gray-300 hover:text-white transition p-2 bg-black/30 rounded-full z-50">
            <X size={32} />
          </button>
          <button onClick={handlePrevImage} className="absolute left-6 text-white transition p-4 bg-black/40 rounded-full hover:bg-black/60 shadow-lg z-50">
            <ChevronLeft size={36} strokeWidth={2} />
          </button>
          <button onClick={handleNextImage} className="absolute right-6 text-white transition p-4 bg-black/40 rounded-full hover:bg-black/60 shadow-lg z-50">
            <ChevronRight size={36} strokeWidth={2} />
          </button>
          <div className="max-w-7xl max-h-[90vh] flex items-center justify-center relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img 
              src={getImageUrl(viewerIndex, true)} 
              alt={`Viewer Room ${viewerIndex + 1}`} 
              className="w-auto h-auto max-w-full max-h-[90vh] rounded-lg object-contain select-none shadow-inner" 
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white font-medium text-sm px-4 py-1.5 rounded-full z-50">
              {viewerIndex + 1} / 5
            </div>
          </div>
        </div>,
        document.body 
      )}

      {/* MODAL HẸN LỊCH */}
      {isViewingModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Hẹn lịch xem phòng</h3>
              <button onClick={() => setIsViewingModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition p-1 bg-gray-100 hover:bg-gray-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitViewing} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày muốn xem <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  required 
                  min={todayDate}
                  value={viewingForm.viewing_date}
                  onChange={(e) => setViewingForm({...viewingForm, viewing_date: e.target.value})}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khung giờ dự kiến <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={viewingForm.viewing_time}
                  onChange={(e) => setViewingForm({...viewingForm, viewing_time: e.target.value})}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                >
                  <option value="" disabled>-- Chọn khung giờ --</option>
                  <option value="08:00 - 10:00">Sáng: 08:00 - 10:00</option>
                  <option value="10:00 - 12:00">Trưa: 10:00 - 12:00</option>
                  <option value="14:00 - 16:00">Chiều: 14:00 - 16:00</option>
                  <option value="16:00 - 18:00">Chiều muộn: 16:00 - 18:00</option>
                  <option value="18:00 - 20:00">Tối: 18:00 - 20:00</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lời nhắn cho Chủ nhà (Không bắt buộc)</label>
                <textarea 
                  rows="3"
                  value={viewingForm.notes}
                  onChange={(e) => setViewingForm({...viewingForm, notes: e.target.value})}
                  placeholder="Ví dụ: Mình là sinh viên, mình muốn xem phòng trọ này để chuyển vào đầu tháng sau..."
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-pink-600 text-white font-bold py-3.5 rounded-xl hover:bg-pink-700 transition shadow-md flex justify-center items-center gap-2 disabled:bg-gray-400 mt-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Gửi yêu cầu ngay'}
              </button>
              <p className="text-xs text-center text-gray-500 mt-3">Cam kết bảo mật thông tin cá nhân của bạn.</p>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL LIÊN HỆ CHỦ TRỌ */}
      {isContactOpen && createPortal(
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsContactOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Thông tin Chủ trọ</h3>
              <button
                onClick={() => setIsContactOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition p-1 bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(property.landlord_name || 'Host')}&background=FF385C&color=fff&bold=true&size=64`}
                  alt="avatar"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-gray-900 text-lg">{property.landlord_name || 'Chủ nhà'}</p>
                  <p className="text-sm text-gray-500">Chủ trọ GinniStays</p>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 rounded-xl">
                    <Phone size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Số điện thoại</p>
                    <p className="font-semibold text-gray-900">
                      {property.landlord_phone || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                {property.landlord_phone && (
                  <a
                    href={`tel:${property.landlord_phone}`}
                    className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-600 transition"
                  >
                    Gọi ngay
                  </a>
                )}
              </div>

              {property.landlord_phone && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl">
                      <span className="text-blue-600 font-extrabold text-sm w-5 h-5 flex items-center justify-center">Z</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Zalo</p>
                      <p className="font-semibold text-gray-900">{property.landlord_phone}</p>
                    </div>
                  </div>
                  
                  <a
                    href={`https://zalo.me/${property.landlord_phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-600 transition"
                  >
                    Nhắn Zalo
                  </a>
                </div>
              )}

              <p className="text-xs text-center text-gray-400 pt-2">
                Vui lòng đặt lịch xem phòng trước khi liên hệ trực tiếp.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PropertyDetail;