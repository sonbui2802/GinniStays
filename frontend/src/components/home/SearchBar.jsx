import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../../services/api';

const AMENITIES_LIST = [
  'Wifi','Điều hòa','Máy giặt','Bãi đỗ xe','Ban công',
  'Bếp','Tủ lạnh','Giường','Nhà vệ sinh riêng','Camera an ninh',
];

const PROPERTY_TYPE_LABELS = {
  boarding_house: 'Phòng trọ',
  apartment_building: 'Chung cư mini',
  single_apartment: 'Căn hộ',
  whole_house: 'Nhà nguyên căn',
  sleepbox: 'Ở ghép (Sleepbox)',
  commercial_space: 'Mặt bằng',
};

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const wrapperRef = useRef(null);

  const [availableLocations, setAvailableLocations] = useState({});

  // ✅ State cho autocomplete địa điểm
  const [districtInput, setDistrictInput] = useState(searchParams.get('district') || '');
  const [districtSuggestions, setDistrictSuggestions] = useState([]);

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [filters, setFilters] = useState({
    district: searchParams.get('district') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    property_type: searchParams.get('property_type') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    amenities: searchParams.getAll('amenities') || [],
  });

  const activeFilterCount = [
    filters.district, filters.minPrice, filters.maxPrice,
    filters.minArea, filters.maxArea, filters.property_type, filters.bedrooms
  ].filter(Boolean).length + filters.amenities.length;

  // Fetch locations từ DB
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/properties/locations');
        setAvailableLocations(res.data.data || {});
      } catch (err) {
        console.error('Lỗi lấy danh sách địa điểm:', err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsExpanded(false);
        setDistrictSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Autocomplete: gõ thì lọc từ availableLocations
  const handleDistrictInput = (val) => {
    setDistrictInput(val);
    setFilters(p => ({ ...p, district: val }));

    if (val.length >= 1) {
      // Flatten tất cả districts từ mọi city
      const allDistricts = Object.values(availableLocations).flat();
      const matched = allDistricts.filter(d =>
        d.toLowerCase().includes(val.toLowerCase())
      );
      setDistrictSuggestions(matched.slice(0, 6));
    } else {
      setDistrictSuggestions([]);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (filters.district) params.set('district', filters.district);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.minArea) params.set('minArea', filters.minArea);
    if (filters.maxArea) params.set('maxArea', filters.maxArea);
    if (filters.property_type) params.set('property_type', filters.property_type);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    filters.amenities.forEach(a => params.append('amenities', a));

    navigate(`/?${params.toString()}`);
    setIsExpanded(false);
    setIsFilterOpen(false);
    setDistrictSuggestions([]);
  };

  const handleClearAll = () => {
    setKeyword('');
    setDistrictInput('');
    setFilters({
      district: '', minPrice: '', maxPrice: '',
      minArea: '', maxArea: '', property_type: '', bedrooms: '', amenities: [],
    });
    navigate('/');
  };

  const toggleAmenity = (a) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a]
    }));
  };

  return (
    <>
      {isExpanded && (
        <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setIsExpanded(false)} />
      )}

      <div ref={wrapperRef} className="relative z-40">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <Search size={16} className="text-gray-500" />
            <span className="text-sm text-gray-500 pr-3 border-r border-gray-300">
              {keyword || 'Tìm kiếm...'}
            </span>
            <span className="text-sm text-gray-400">
              {filters.district || 'Bất kỳ quận'}
            </span>
            {activeFilterCount > 0 && (
              <span className="bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[600px] overflow-hidden">
            {/* Input keyword */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Search size={20} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Tên phòng, địa chỉ, mô tả..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-base"
              />
              {keyword && (
                <button onClick={() => setKeyword('')}>
                  <X size={18} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Quick filters */}
            <div className="px-5 py-4 flex flex-wrap gap-3">

              {/* ✅ Quận/Huyện — autocomplete gõ tự do */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Quận/Huyện, Tỉnh/Thành..."
                  value={districtInput}
                  onChange={(e) => handleDistrictInput(e.target.value)}
                  className="text-sm border border-gray-200 rounded-full px-3 py-1.5 outline-none bg-white text-gray-700 hover:border-gray-400 transition w-48"
                />
                {districtSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-56 overflow-hidden">
                    {districtSuggestions.map(d => (
                      <button
                        key={d}
                        onClick={() => {
                          setDistrictInput(d);
                          setFilters(p => ({ ...p, district: d }));
                          setDistrictSuggestions([]);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Loại phòng */}
              <select
                value={filters.property_type}
                onChange={(e) => setFilters(p => ({ ...p, property_type: e.target.value }))}
                className="text-sm border border-gray-200 rounded-full px-3 py-1.5 outline-none bg-white text-gray-700 cursor-pointer hover:border-gray-400 transition"
              >
                <option value="">Tất cả loại</option>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>

              {/* ✅ Số phòng ngủ — fix lỗi thiếu array */}
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters(p => ({ ...p, bedrooms: e.target.value }))}
                className="text-sm border border-gray-200 rounded-full px-3 py-1.5 outline-none bg-white text-gray-700 cursor-pointer hover:border-gray-400 transition"
              >
                <option value="">Số phòng ngủ</option>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} phòng ngủ</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <button onClick={handleClearAll} className="text-sm text-gray-500 underline hover:text-gray-800">
                Xóa tất cả
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2 text-sm border border-gray-300 rounded-full px-4 py-2 hover:border-gray-500 transition"
                >
                  <SlidersHorizontal size={15} />
                  Bộ lọc
                  {activeFilterCount > 0 && (
                    <span className="bg-gray-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 bg-pink-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-pink-700 transition"
                >
                  <Search size={15} />
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL BỘ LỌC */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">Bộ lọc</h2>
              <button onClick={() => setIsFilterOpen(false)}>
                <X size={22} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Khoảng giá */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Khoảng giá (VNĐ/tháng)</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Tối thiểu</label>
                    <input
                      type="number" placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(p => ({ ...p, minPrice: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                  <span className="text-gray-400 mt-4">—</span>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Tối đa</label>
                    <input
                      type="number" placeholder="Không giới hạn"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(p => ({ ...p, maxPrice: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { label: 'Dưới 3 triệu', min: '', max: '3000000' },
                    { label: '3 - 6 triệu', min: '3000000', max: '6000000' },
                    { label: '6 - 10 triệu', min: '6000000', max: '10000000' },
                    { label: 'Trên 10 triệu', min: '10000000', max: '' },
                  ].map(chip => (
                    <button
                      key={chip.label}
                      onClick={() => setFilters(p => ({ ...p, minPrice: chip.min, maxPrice: chip.max }))}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        filters.minPrice === chip.min && filters.maxPrice === chip.max
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diện tích */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Diện tích (m²)</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Tối thiểu</label>
                    <input
                      type="number" placeholder="0"
                      value={filters.minArea}
                      onChange={(e) => setFilters(p => ({ ...p, minArea: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                  <span className="text-gray-400 mt-4">—</span>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Tối đa</label>
                    <input
                      type="number" placeholder="Không giới hạn"
                      value={filters.maxArea}
                      onChange={(e) => setFilters(p => ({ ...p, maxArea: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Tiện ích */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Tiện ích</h3>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITIES_LIST.map(a => (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`text-sm px-3 py-2.5 rounded-xl border text-left transition ${
                        filters.amenities.includes(a)
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setFilters(p => ({
                  ...p, minPrice: '', maxPrice: '', minArea: '', maxArea: '', amenities: []
                }))}
                className="text-sm text-gray-500 underline hover:text-gray-800"
              >
                Xóa bộ lọc
              </button>
              <button
                onClick={() => { setIsFilterOpen(false); handleSearch(); }}
                className="bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition"
              >
                Hiển thị kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;