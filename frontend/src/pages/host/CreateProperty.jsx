import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Loader2, X, MapPin, Info, CheckSquare, DollarSign } from 'lucide-react';
import api from '../../services/api'; 
import LocationPickerMap from '../../components/property/LocationPickerMap';

const CreateProperty = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]); 
  const [previewUrls, setPreviewUrls] = useState([]); 
  
  // State lưu tọa độ của Bản đồ (Mặc định trung tâm Hà Nội)
  const [location, setLocation] = useState({ lat: 21.0285, lng: 105.8542 });
  
  const AMENITIES_LIST = ['Wifi', 'Điều hòa', 'Nóng lạnh', 'Máy giặt', 'Chỗ để xe', 'Tủ lạnh', 'Giường tủ', 'Bếp', 'Thang máy', 'Bảo vệ 24/7'];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',           
    area: '',            
    bedrooms: '', // Đã thêm state lưu số phòng ngủ           
    max_occupants: '',   
    property_type: 'boarding_house',
    city: '',
    district: '',
    ward: '',
    address: '',
    amenities: [] 
  });

  const handleAmenityChange = (amenity) => {
    setFormData(prev => {
      const isSelected = prev.amenities.includes(amenity);
      if (isSelected) {
        return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...prev.amenities, amenity] };
      }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 8) {
      alert("Bạn chỉ được tải lên tối đa 8 ảnh!");
      e.target.value = null; 
      return;
    }
    
    const newImages = [...images, ...files];
    setImages(newImages);
    setPreviewUrls(newImages.map(file => URL.createObjectURL(file)));
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
    setPreviewUrls(previewUrls.filter((_, index) => index !== indexToRemove));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length < 5 || images.length > 8) {
        alert("Vui lòng tải lên từ 5 đến 8 ảnh để tiếp tục!");
        return;
    }

    setIsLoading(true);

    // Gộp dữ liệu form và Tọa độ bản đồ thành 1 cục Payload
    const payload = {
        ...formData,
        price: Number(formData.price),
        area: formData.area ? Number(formData.area) : null,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : 1, // Xử lý biến bedrooms gửi xuống Backend
        max_occupants: formData.max_occupants ? Number(formData.max_occupants) : null,
        latitude: location.lat,  // Lấy từ State của Bản đồ
        longitude: location.lng  // Lấy từ State của Bản đồ
    };

    try {
      const propResponse = await api.post('/properties', payload);
      const newPropertyId = propResponse.data.data.id;

      if (images.length > 0) {
        const imageFormData = new FormData();
        images.forEach((file) => {
          imageFormData.append('images', file);
        });
        await api.post(`/properties/${newPropertyId}/images`, imageFormData);
      }

      alert("🎉 Đăng phòng thành công! Đang chờ Admin duyệt.");
      navigate('/host'); 
      
    } catch (error) {
      console.error("Lỗi đăng phòng:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi đăng phòng");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidImageCount = images.length >= 5 && images.length <= 8;

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-16 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold mb-2">Đăng phòng cho thuê mới</h1>
      <p className="text-gray-500 mb-8">Điền đầy đủ thông tin để thu hút khách thuê nhanh chóng.</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. THÔNG TIN CƠ BẢN */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Info size={20} className="text-pink-600"/> Thông tin cơ bản</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Tiêu đề bài đăng <span className="text-red-500">*</span></label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder="VD: Phòng trọ khép kín mới xây Cầu Giấy..." />
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
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Mô tả về diện tích, giờ giấc, chi phí điện nước..."></textarea>
            </div>
          </div>
        </section>

        {/* 2. CHI PHÍ & THÔNG SỐ */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><DollarSign size={20} className="text-pink-600"/> Chi phí & Thông số</h2>
          {/* Đã đổi grid thành 4 cột để chứa đủ Giá, Diện tích, Phòng ngủ, Người ở */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">Giá thuê <span className="text-red-500">*</span></label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder="VNĐ/Tháng" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">Diện tích (m²)</label>
              <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder="VD: 25" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">Số phòng ngủ <span className="text-red-500">*</span></label>
              <input required type="number" min="1" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder="VD: 1" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">Số người ở tối đa</label>
              <input type="number" name="max_occupants" value={formData.max_occupants} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder="VD: 2" />
            </div>
          </div>
        </section>

        {/* 3. VỊ TRÍ & ĐỊA CHỈ */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><MapPin size={20} className="text-pink-600"/> Vị trí & Địa chỉ</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
              <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Hà Nội" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
              <input required type="text" name="district" value={formData.district} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Cầu Giấy" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phường/Xã</label>
              <input type="text" name="ward" value={formData.ward} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Dịch Vọng" />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium mb-1">Số nhà, Tên đường <span className="text-red-500">*</span></label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Số 10, Ngõ 123 Xuân Thủy" />
            </div>
          </div>

          {/* BẢN ĐỒ TỌA ĐỘ */}
          <div className="col-span-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
             <label className="block font-semibold text-gray-900 mb-1">
                Ghim vị trí trên bản đồ <span className="text-red-500">*</span>
             </label>
             <p className="text-sm text-gray-500 mb-4">
                Kéo thả biểu tượng ghim màu xanh vào đúng vị trí nhà bạn để khách hàng dễ dàng tìm kiếm.
             </p>
             <LocationPickerMap 
                position={location} 
                setPosition={setLocation} 
             />
             <p className="text-xs text-gray-400 mt-2 text-right">
                Tọa độ hiện tại: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
             </p>
          </div>
        </section>

        {/* 4. TIỆN ÍCH */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CheckSquare size={20} className="text-pink-600"/> Tiện ích có sẵn</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AMENITIES_LIST.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 transition">
                <input 
                  type="checkbox" 
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                  className="w-4 h-4 text-pink-600 focus:ring-pink-500 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 5. HÌNH ẢNH */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><UploadCloud size={20} className="text-pink-600"/> Hình ảnh (Từ 5 - 8 ảnh)</h2>
            <span className={`text-sm font-bold ${images.length < 5 ? 'text-red-500' : 'text-green-600'}`}>
              Đã tải lên: {images.length}/8
            </span>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
            <input 
               type="file" 
               multiple 
               accept="image/*" 
               onChange={handleImageChange} 
               disabled={images.length >= 8}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
            />
            <UploadCloud className={`mx-auto h-12 w-12 mb-3 ${images.length >= 8 ? 'text-gray-200' : 'text-gray-400'}`} />
            <p className="text-gray-600 font-medium">Kéo thả hoặc click để chọn ảnh</p>
            {images.length < 5 && <p className="text-red-500 text-sm mt-2">Vui lòng tải lên thêm ít nhất {5 - images.length} ảnh nữa.</p>}
          </div>

          {previewUrls.length > 0 && (
            <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative shrink-0 group">
                  <img src={url} alt="preview" className="w-28 h-28 object-cover rounded-lg border shadow-sm" />
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {index === 0 ? 'Ảnh bìa' : `Ảnh ${index + 1}`}
                  </div>
                  <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-600">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* NÚT SUBMIT */}
        <button 
          type="submit" 
          disabled={isLoading || !isValidImageCount} 
          className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-pink-700 transition flex justify-center items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
        >
          {isLoading ? (
            <><Loader2 className="animate-spin" size={24} /> Đang xử lý...</>
          ) : !isValidImageCount ? (
            'Vui lòng tải đủ 5 - 8 ảnh để đăng bài'
          ) : (
            'Đăng tin cho thuê'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateProperty;  