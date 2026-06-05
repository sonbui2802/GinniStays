import { Heart, Star, Bed } from 'lucide-react';
import { Link } from 'react-router-dom';
// ✅ IMPORT CÁC HOOK CẦN THIẾT VÀ SERVICE API
import { useState, useEffect } from 'react';
import api from '../../services/api'; 

const PropertyCard = ({ property, onHover }) => {
  // ✅ STATE VÀ LOGIC CHECK/TOGGLE WISHLIST ĐƯỢC THÊM VÀO
  const [isSaved, setIsSaved] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      try {
        const res = await api.get(`/wishlists/${property.id}/check`);
        setIsSaved(res.data.data.saved);
      } catch {}
    };
    check();
  }, [property.id]);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { alert('Vui lòng đăng nhập!'); return; }
    try {
      const res = await api.post(`/wishlists/${property.id}/toggle`);
      setIsSaved(res.data.data.saved);
    } catch {}
  };

  const priceToFormat = property.price || 0;
  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceToFormat);

  let imageUrl = property.images?.[0]?.image_url
    || property.thumbnail
    || `https://picsum.photos/seed/${property.id}/800/800`;

  if (imageUrl.includes('res.cloudinary.com')) {
    const parts = imageUrl.split('/upload/');
    if (parts.length === 2) {
      imageUrl = `${parts[0]}/upload/q_auto:good,f_auto,w_800,h_800,c_fill,g_auto/${parts[1]}`;
    }
  }

  const isRented = property.rental_status === 'rented';
  // isFull = đã cho thuê HOẶC số người đã đầy
  const isFull = isRented || (property.max_occupants && (property.current_occupants || 0) >= property.max_occupants);
  const bedroomsCount = property.bedrooms || 1;

  return (
    <Link 
      to={`/room/${property.id}`} 
      onMouseEnter={() => onHover && onHover(property.id)}
      onMouseLeave={() => onHover && onHover(null)}
      className="group cursor-pointer flex flex-col gap-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200">
        <img 
          src={imageUrl} 
          alt={property.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${isFull ? 'opacity-60' : 'group-hover:scale-105'}`}
        />
        
        {isFull && (
          <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm z-10">
            {isRented ? 'Đã cho thuê' : 'Đã kín chỗ'}
          </div>
        )}

        {/* ✅ THAY THẾ NÚT TIM CŨ BẰNG LOGIC WISHLIST MỚI */}
        <button
          className="absolute top-3 right-3 p-1.5 hover:scale-110 transition active:scale-95 z-10"
          onClick={handleToggleWishlist}
        >
          <Heart
            size={24}
            className={`drop-shadow-md transition-colors ${
              isSaved ? 'fill-pink-500 text-pink-500' : 'text-white hover:fill-pink-500 hover:text-pink-500'
            }`}
            strokeWidth={1.5}
          />
        </button>
      </div>

      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-semibold text-[15px] truncate ${isFull ? 'text-gray-500' : 'text-gray-900'}`}>
            {property.title || property.address || "Phòng trọ cao cấp"}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star size={14} className={`fill-current ${isFull ? 'text-gray-400' : 'text-gray-900'}`} />
            <span className={`text-sm font-medium ${isFull ? 'text-gray-400' : 'text-gray-900'}`}>
              {property.rating || '4.9'}
            </span>
          </div>
        </div>

        <p className="text-gray-500 text-sm truncate">
          {property.district ? `${property.district}, ${property.city}` : property.location || "Hà Nội, Việt Nam"}
        </p>
        
        <div className="flex items-center justify-between mt-1">
          <div className={`flex items-center gap-1.5 text-sm ${isFull ? 'text-gray-400' : 'text-gray-600'}`}>
            <Bed size={16} />
            <span>{bedroomsCount} Phòng ngủ</span>
          </div>
          <p className={`text-sm font-medium ${isFull ? 'text-red-500' : 'text-green-600'}`}>
            {isRented ? 'Đã cho thuê' : isFull ? 'Đã kín chỗ' : 'Đang trống'}
          </p>
        </div>

        <div className={`mt-1 flex items-center gap-1 ${isFull ? 'opacity-60' : ''}`}>
          <span className="font-semibold text-[15px] text-gray-900">{formattedPrice}</span>
          <span className="text-gray-900 text-sm">/ tháng</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;