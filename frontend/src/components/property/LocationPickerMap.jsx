import { useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// ✅ IMPORT THƯ VIỆN SEARCH CHUẨN ĐỒNG BỘ
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix lỗi mất Icon ghim của Leaflet trong React (Giữ nguyên của bạn)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ✅ THÀNH PHẦN MỚI 1: Hỗ trợ dịch chuyển ống kính bản đồ khi tọa độ thay đổi
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// ========================================================
// ✅ THÀNH PHẦN MỚI 2: Thanh tìm kiếm nhảy tọa độ ghim và di chuyển camera
// ========================================================
const SearchControl = ({ setPosition }) => {
  const map = useMap();
      
  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        'accept-language': 'vi', // Ưu tiên kết quả tiếng Việt
        countrycodes: 'vn',      // Chỉ tìm kiếm địa chỉ thuộc Việt Nam
      }
    });

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      placeholder: 'Gõ tìm nhanh địa chỉ nhà trọ...',
      showMarker: false,           // Không tự động tạo marker mặc định rác của thư viện
      showPopup: false,            // Không tự động bật popup rác
      autoClose: true,             
      retainZoomLevel: false,      
      animateZoom: true,           
      keepResult: true,            
    });

    map.addControl(searchControl);

    // Lắng nghe sự kiện khi người dùng chọn một địa điểm từ danh sách gợi ý
    map.on('geosearch/showlocation', (result) => {
      if (result && result.location) {
        // Cập nhật ngược tọa độ lat/lng về cho Component cha CreateProperty nhận dữ liệu
        setPosition({
          lat: Number(result.location.y),
          lng: Number(result.location.x)
        });
      }
    });

    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation');
    };
  }, [map, setPosition]);

  return null;
};

// Component Marker có thể kéo thả (Giữ nguyên 100% logic cũ của bạn)
const DraggableMarker = ({ position, setPosition }) => {
  const markerRef = useRef(null);
  
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition({ lat, lng }); // Bắn tọa độ mới ra ngoài Component cha
        }
      },
    }),
    [setPosition],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
    >
      <Popup>Kéo thả tôi đến đúng vị trí nhà bạn!</Popup>
    </Marker>
  );
};

const LocationPickerMap = ({ position, setPosition }) => {
  // Tọa độ trung tâm (Mặc định Hà Nội nếu chưa có data)
  const center = [position.lat || 21.0285, position.lng || 105.8542];

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-sm border border-gray-300 z-0 relative">
      <MapContainer 
        center={center} 
        zoom={14} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* ✅ NHÚNG BỘ ĐIỀU KHIỂN TÌM KIẾM ĐỊA CHỈ */}
        <SearchControl setPosition={setPosition} />

        {/* ✅ NHÚNG BỘ ĐIỀU KHIỂN ĐẨY CAMERA THEO GHIM */}
        <ChangeView center={[position.lat, position.lng]} />

        <DraggableMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
};

export default LocationPickerMap;