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

  // STATE PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 6
  });

  // Kiểm tra xem có đang search không
  const isSearchMode = searchParams.toString() !== '';

  // Mỗi khi đổi danh mục (Category), reset trang hiện tại về 1
  useEffect(() => {
    if (!isSearchMode) {
      setCurrentPage(1);
    }
  }, [selectedCategory, isSearchMode]);

  useEffect(() => {
    const isSearching = searchParams.toString() !== '';

    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let response;
        if (isSearching) {
          // Giữ nguyên cơ chế search cũ (không phân trang để map hiển thị đủ pin)
          response = await api.get(`/properties/search?${searchParams.toString()}`);
          const propertyData = response.data.data || response.data;
          setProperties(propertyData);
          // Reset pagination về mặc định khi ở search mode
          setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 6 });
        } else {
          // ✅ FIX: Truyền property_type lên backend để filter đúng,
          //         không filter client-side nữa vì backend đã paginate sẵn
          response = await api.get(
            `/properties?page=${currentPage}&limit=6&property_type=${selectedCategory}`
          );

          const propertyData = response.data.data || response.data;
          setProperties(propertyData);

          // Lưu thông tin phân trang từ backend
          if (response.data.pagination) {
            setPagination(response.data.pagination);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams, currentPage, selectedCategory]); // ✅ Thêm selectedCategory làm dependency

  // Hàm click chuyển trang và cuộn mượt lên đầu
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ FIX: Bỏ hoàn toàn filter client-side theo category
  //         Backend đã lọc đúng category rồi, dùng thẳng properties
  const displayedProperties = isSearchMode ? properties : properties;

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
            {isLoading ? 'Đang tìm...' : `${displayedProperties.length} kết quả`}
          </p>
          {searchParams.get('keyword') && (
            <p className="text-gray-500 text-sm mt-1">
              Từ khóa:{' '}
              <span className="font-medium text-gray-700">
                "{searchParams.get('keyword')}"
              </span>
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
      ) : displayedProperties.length === 0 ? (
        <div className="text-center py-20 mt-10">
          <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy phòng nào</h2>
          <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm!</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          <div className="w-full lg:w-[60%] xl:w-[65%]">
            {!isSearchMode && (
              <p className="font-semibold text-gray-800 mb-4 px-2 hidden lg:block">
                {/* ✅ FIX: Dùng totalItems từ pagination thay vì length của mảng hiện tại */}
                Hiển thị {pagination.totalItems} phòng thuộc danh mục này
              </p>
            )}

            {/* Grid hiển thị danh sách phòng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 gap-y-10 px-2">
              {displayedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onHover={setHoveredPropertyId}
                />
              ))}
            </div>

            {/* THANH ĐIỀU HƯỚNG PHÂN TRANG
                Chỉ hiện khi không ở Search Mode và tổng số trang > 1 */}
            {!isSearchMode && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14 py-4">
                {/* Nút Trước */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-sm text-gray-600 hover:border-pink-500 hover:text-pink-600 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition duration-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  Trước
                </button>

                {/* Danh sách các số trang */}
                {Array.from({ length: pagination.totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition duration-200 cursor-pointer ${
                        currentPage === pageNumber
                          ? 'bg-pink-600 text-white shadow-md'
                          : 'border border-gray-200 text-gray-600 hover:border-pink-500 hover:text-pink-600'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Nút Sau */}
                <button
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-sm text-gray-600 hover:border-pink-500 hover:text-pink-600 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition duration-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </div>

          {/* Bản đồ bên phải */}
          <div className="hidden lg:block lg:w-[40%] xl:w-[35%] relative">
            <div className="sticky top-28 h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <HomeMap
                properties={displayedProperties}
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