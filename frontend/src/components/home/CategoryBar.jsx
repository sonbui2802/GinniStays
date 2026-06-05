import { Home, Building2, Building, Tent, Store, Key } from 'lucide-react';

// ĐÃ THÊM: Trường 'id' khớp chuẩn 100% với enum 'property_type' trong Database
const categories = [
  { id: 'boarding_house', label: 'Phòng trọ', icon: Home },
  { id: 'apartment_building', label: 'Chung cư mini', icon: Building2 },
  { id: 'single_apartment', label: 'Căn hộ (Apartment)', icon: Building },
  { id: 'whole_house', label: 'Nhà nguyên căn', icon: Key },
  { id: 'sleepbox', label: 'Ở ghép (Sleepbox)', icon: Tent },
  { id: 'commercial_space', label: 'Mặt bằng', icon: Store },
];

// ĐÃ SỬA: Nhận state và hàm set state từ Component cha (Home.jsx) truyền xuống
const CategoryBar = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center gap-8 overflow-x-auto py-4 scrollbar-hide border-b border-gray-100 mb-6">
      {categories.map((item) => {
        const Icon = item.icon;
        
        // Kiểm tra xem tab hiện tại có khớp với state của Home không (so sánh bằng id)
        const isActive = selectedCategory === item.id;
        
        return (
          <div 
            key={item.id} // Dùng id làm key cho chuẩn chỉnh
            // Khi click, báo cho cha (Home) biết là tao vừa chọn cái id này
            onClick={() => onSelectCategory(item.id)}
            className={`flex flex-col items-center gap-2 cursor-pointer min-w-max transition 
              ${isActive ? 'text-black border-b-2 border-black pb-2' : 'text-gray-500 hover:text-black hover:border-b-2 hover:border-gray-300 pb-2 border-b-2 border-transparent'}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryBar;