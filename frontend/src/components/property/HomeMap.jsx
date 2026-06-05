import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const FlyToMarker = ({ properties, hoveredPropertyId }) => {
  const map = useMap();

  useEffect(() => {
    if (!hoveredPropertyId) return;
    const target = properties.find(p => p.id === hoveredPropertyId);
    if (target?.latitude && target?.longitude) {
      map.flyTo([target.latitude, target.longitude], 15, { duration: 0.8 });
    }
  }, [hoveredPropertyId, properties, map]);

  return null;
};

// ✅ THÀNH PHẦN MỚI ĐƯỢC THÊM VÀO: Bộ điều khiển tìm kiếm trên bản đồ
const SearchControl = () => {
  const map = useMap();
      
  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        'accept-language': 'vi', // Kết quả trả về ưu tiên tiếng Việt
        countrycodes: 'vn',      // Giới hạn phạm vi tìm kiếm chỉ ở Việt Nam
      }
    });

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      placeholder: 'Tìm địa chỉ...',
      showMarker: false,           // Không tự động thêm marker mặc định mới
      showPopup: false,            // Không tự động mở popup mặc định
      autoClose: true,             // Tự động đóng thanh gợi ý sau khi chọn xong
      retainZoomLevel: false,      // Cho phép thay đổi mức zoom để khớp với địa điểm tìm được
      animateZoom: true,           // Hiệu ứng mượt mà khi di chuyển ống kính
      keepResult: true,            // Giữ lại chuỗi ký tự đã gõ trên thanh tìm kiếm
    });

    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
};

const HomeMap = ({ properties, hoveredPropertyId }) => {
  const center = [21.0285, 105.8542];

  // Pin đỏ dùng SVG inline — không cần CDN ngoài
  const createRedIcon = (size = 32) => L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${size}" height="${size * 1.5}">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#e11d48"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>
    `,
    className: '',
    iconSize: [size, size * 1.5],
    iconAnchor: [size / 2, size * 1.5],
    popupAnchor: [0, -(size * 1.5)],
  });

  const normalIcon = createRedIcon(28);
  const hoveredIcon = createRedIcon(38); // To hơn khi hover

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {/* ✅ ĐẶT COMPONENT TÌM KIẾM VÀO ĐÂY */}
      <SearchControl />

      <FlyToMarker properties={properties} hoveredPropertyId={hoveredPropertyId} />

      {properties.map((prop) => {
        if (!prop.latitude || !prop.longitude) return null;
        const isHovered = hoveredPropertyId === prop.id;

        return (
          <Marker
            key={`${prop.id}-${isHovered}`}
            position={[prop.latitude, prop.longitude]}
            icon={isHovered ? hoveredIcon : normalIcon}
            zIndexOffset={isHovered ? 1000 : 0}
          >
            <Popup className="rounded-xl overflow-hidden">
              <div className="w-48 p-0">
                <img
                  src={prop.images?.[0]?.image_url || prop.thumbnail || `https://picsum.photos/seed/${prop.id}/300/200`}
                  alt={prop.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <h4 className="font-bold text-sm text-gray-900 truncate mb-1">
                    {prop.title}
                  </h4>
                  <p className="text-pink-600 font-bold text-sm mb-2">
                    {new Intl.NumberFormat('vi-VN').format(prop.price)}đ/tháng
                  </p>
                  <Link
                    to={`/room/${prop.id}`}
                    className="block text-center w-full bg-gray-900 text-white text-xs font-semibold py-2 rounded-lg hover:bg-gray-800"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default HomeMap;