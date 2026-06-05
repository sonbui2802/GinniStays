import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, MapPin, Info, CheckSquare, Save } from 'lucide-react';
import api from '../../services/api'; 

const EditProperty = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const AMENITIES_LIST = ['Wifi', 'Điều hòa', 'Nóng lạnh', 'Máy giặt', 'Chỗ để xe', 'Tủ lạnh', 'Giường tủ', 'Bếp', 'Thang máy', 'Bảo vệ 24/7'];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'boarding_house',
    city: '',
    district: '',
    ward: '',
    address: '',
    latitude: '',
    longitude: '',
    shared_amenities: [] 
  });

  // GỌI API LẤY DỮ LIỆU CŨ KHI VỪA VÀO TRANG
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        // Tùy vào backend trả về object hay array (thường là mảng 1 phần tử do lỗi query DB)
        const data = Array.isArray(res.data.data) ? res.data.data : res.data.data;
        
        if (data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            property_type: data.property_type || 'boarding_house',
            city: data.city || '',
            district: data.district || '',
            ward: data.ward || '',
            address: data.address || '',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
            // Xử lý cẩn thận nếu backend trả về JSON string
            shared_amenities: typeof data.shared_amenities === 'string' 
                ? JSON.parse(data.shared_amenities) 
                : (data.shared_amenities || [])
          });
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin phòng:", error);
        alert("Không thể tải dữ liệu phòng. Có thể phòng không tồn tại!");
        navigate('/host');
      } finally {
        setIsFetching(false);
      }
    };

    fetchPropertyData();
  }, [id, navigate]);

  const handleAmenityChange = (amenity) => {
    setFormData(prev => {
      const isSelected = prev.shared_amenities.includes(amenity);
      if (isSelected) {
        return { ...prev, shared_amenities: prev.shared_amenities.filter(a => a !== amenity) };
      } else {
        return { ...prev, shared_amenities: [...prev.shared_amenities, amenity] };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("Trình duyệt không hỗ trợ vị trí!");
    alert("Đang lấy tọa độ...");
    navigator.geolocation.getCurrentPosition(
      (position) => setFormData(prev => ({ ...prev, latitude: position.coords.latitude, longitude: position.coords.longitude })),
      () => alert("❌ Không thể lấy vị trí.")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Dùng method PUT để cập nhật
      await api.put(`/properties/${id}`, formData);
      alert("✅ Cập nhật thông tin phòng thành công!");
      navigate('/host'); 
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-pink-600" size={48} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-16 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold mb-2">Chỉnh sửa thông tin phòng</h1>
      <p className="text-gray-500 mb-8">Cập nhật thông tin mới nhất cho bài đăng của bạn.</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. THÔNG TIN CƠ BẢN */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Info size={20} className="text-pink-600"/> Thông tin cơ bản</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Tiêu đề bài đăng <span className="text-red-500">*</span></label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">Loại hình <span className="text-red-500">*</span></label>
              <select name="property_type" value={formData.property_type} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white">
                <option value="boarding_house">Phòng trọ</option>
                <option value="apartment_building">Chung cư mini</option>
                <option value="single_apartment">Căn hộ (Apartment)</option>
                <option value="whole_house">Nhà nguyên căn</option>
                <option value="sleepbox">Ở ghép (Sleepbox)</option>
                <option value="commercial_space">Mặt bằng kinh doanh</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"></textarea>
            </div>
          </div>
        </section>

        {/* 2. VỊ TRÍ & ĐỊA CHỈ */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><MapPin size={20} className="text-pink-600"/> Vị trí & Địa chỉ</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Tỉnh/Thành phố</label><input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Quận/Huyện</label><input required type="text" name="district" value={formData.district} onChange={handleChange} className="w-full p-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Phường/Xã</label><input type="text" name="ward" value={formData.ward} onChange={handleChange} className="w-full p-3 border rounded-lg" /></div>
            <div className="col-span-3"><label className="block text-sm font-medium mb-1">Số nhà, Tên đường</label><input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-lg" /></div>
            
            <div className="col-span-3 flex items-end gap-4 mt-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Vĩ độ (Latitude)</label>
                <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" readOnly />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Kinh độ (Longitude)</label>
                <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" readOnly />
              </div>
              <button type="button" onClick={handleGetLocation} className="bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-semibold hover:bg-blue-200 transition">📍 Cập nhật vị trí</button>
            </div>
          </div>
        </section>

        {/* 3. TIỆN ÍCH DÙNG CHUNG */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CheckSquare size={20} className="text-pink-600"/> Tiện ích có sẵn</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AMENITIES_LIST.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 transition">
                <input 
                  type="checkbox" 
                  checked={formData.shared_amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                  className="w-4 h-4 text-pink-600 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </section>

        {/* GHI CHÚ VỀ ẢNH */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          💡 <b>Lưu ý:</b> Tính năng chỉnh sửa hình ảnh hiện đang được khóa để đảm bảo tính xác thực. Nếu muốn đổi ảnh, vui lòng liên hệ Admin hoặc xóa bài đăng lại.
        </div>

        {/* NÚT SUBMIT */}
        <button type="submit" disabled={isLoading} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition flex justify-center items-center gap-2 disabled:bg-gray-400">
          {isLoading ? <><Loader2 className="animate-spin" size={24} /> Đang lưu...</> : <><Save size={20}/> Lưu thay đổi</>}
        </button>
      </form>
    </div>
  );
};

export default EditProperty;