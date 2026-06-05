import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryBar from '../components/home/CategoryBar';
import PropertyCard from '../components/property/PropertyCard';
import HomeMap from '../components/property/HomeMap';
import api from '../services/api';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('boarding_house');
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

  // Kiểm tra xem có đang search không
  const isSearchMode = searchParams.toString() !== '';

useEffect(() => { 
    const isSearching = searchParams.toString() !== ''; // ✅ tính trong effect
    
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let response;
        if (isSearching) {
          const url = `/properties/search?${searchParams.toString()}`;
          console.log('Calling API:', url); // ✅ xem URL có đúng không
          response = await api.get(url);
          console.log('Response:', response.data); // ✅ xem data trả về
          response = await api.get(`/properties/search?${searchParams.toString()}`);
        } else {
          response = await api.get('/properties');
        }
        const propertyData = response.data.data || response.data;
        setProperties(propertyData);
      } catch (err) {
        console.error('Fetch error:', err); // ✅ thêm để thấy lỗi cụ thể
        setError('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
}, [searchParams]);

  // Chỉ filter theo category khi KHÔNG ở search mode
  const filteredProperties = isSearchMode
    ? properties
    : properties.filter(p => p.property_type === selectedCategory);

  return (
    <div className="mt-2 pb-10">
      {/* Ẩn CategoryBar khi đang search */}
      {!isSearchMode && (
        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* Banner kết quả search */}
      {isSearchMode && (
        <div className="px-2 mt-4 mb-2">
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? 'Đang tìm...' : `${filteredProperties.length} kết quả`}
          </p>
          {searchParams.get('keyword') && (
            <p className="text-gray-500 text-sm mt-1">
              Từ khóa: <span className="font-medium text-gray-700">"{searchParams.get('keyword')}"</span>
              {searchParams.get('district') && ` · ${searchParams.get('district')}`}
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 mt-10">
          <Loader2 size={40} className="animate-spin text-pink-600 mb-4" />
          <p className="text-gray-500 font-medium">Đang tìm kiếm không gian phù hợp...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-20 mt-10 font-medium bg-red-50 rounded-xl max-w-2xl mx-auto">
          {error}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-20 mt-10">
          <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy phòng nào</h2>
          <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm!</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          <div className="w-full lg:w-[60%] xl:w-[65%]">
            {!isSearchMode && (
              <p className="font-semibold text-gray-800 mb-4 px-2 hidden lg:block">
                Hiển thị {filteredProperties.length} kết quả
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 gap-y-10 px-2">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onHover={setHoveredPropertyId}
                />
              ))}
            </div>
          </div>

          <div className="hidden lg:block lg:w-[40%] xl:w-[35%] relative">
            <div className="sticky top-28 h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <HomeMap
                properties={filteredProperties}
                hoveredPropertyId={hoveredPropertyId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;