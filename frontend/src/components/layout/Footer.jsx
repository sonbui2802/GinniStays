import { Link } from 'react-router-dom';
import {
  Globe, Phone, Mail, MapPin, HelpCircle,
  Home, Heart, FileText, Calendar,
  Building2, Shield, Users, BookOpen, 
  Info, CheckCircle, Newspaper, Briefcase
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: 'Về GinniStays',
      items: [
        { label: 'Giới thiệu về chúng tôi', to: '/about', icon: Info },
        { label: 'Xác thực an toàn', to: '/safety', icon: CheckCircle },
        { label: 'Tin tức & Cập nhật', to: '/news', icon: Newspaper },
        { label: 'Cơ hội nghề nghiệp', to: '/careers', icon: Briefcase },
        { label: 'Điều khoản dịch vụ', to: '/terms', icon: FileText },
        { label: 'Chính sách bảo mật', to: '/privacy', icon: Shield },
      ],
    },
    {
      title: 'Dành cho Người thuê',
      items: [
        { label: 'Cách thuê phòng', to: '/how-to-rent', icon: BookOpen },
        { label: 'Đặt lịch xem phòng', to: '/', icon: Calendar },
        { label: 'Danh sách yêu thích', to: '/wishlist', icon: Heart },
        { label: 'Hợp đồng của tôi', to: '/my-contracts', icon: FileText },
        { label: 'Hướng dẫn người thuê', to: '/tenant-guide', icon: Users },
        { label: 'Câu hỏi thường gặp', to: '/faq', icon: HelpCircle },
      ],
    },
    {
      title: 'Dành cho Chủ nhà',
      items: [
        { label: 'Đăng phòng mới', to: '/host/create', icon: Home },
        { label: 'Quản lý phòng trọ', to: '/host', icon: Building2 },
        { label: 'An toàn & Uy tín', to: '/host-safety', icon: Shield },
        { label: 'Diễn đàn cộng đồng', to: '/community', icon: Users },
        { label: 'Hướng dẫn chủ nhà', to: '/host-guide', icon: BookOpen },
        { label: 'Tài nguyên cho chủ nhà', to: '/host-resources', icon: Briefcase },
      ],
    },
    {
      title: 'Liên hệ & Hỗ trợ',
      items: [
        { label: 'Trung tâm trợ giúp', to: '/help', icon: HelpCircle },
        { label: '1800 6868', href: 'tel:18006868', icon: Phone },
        { label: 'support@ginnistays.vn', href: 'mailto:support@ginnistays.vn', icon: Mail },
        { label: '144 Xuân Thủy, Cầu Giấy, Hà Nội', to: null, icon: MapPin },
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-gray-200 bg-white mt-auto shrink-0">
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 py-12">
        {/* Logo */}
        <div className="mb-10">
          <Link to="/" className="flex items-center gap-2 text-pink-600 w-fit">
            <Globe size={28} strokeWidth={2.5} />
            <span className="font-bold text-xl tracking-tight">GinniStays</span>
          </Link>
          <p className="text-sm text-gray-500 mt-2 max-w-xs">
            Nền tảng kết nối người thuê và chủ trọ — nhanh chóng, an toàn, minh bạch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.items.map((item) => {
                  const Icon = item.icon;
                  const baseClass =
                    'flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 transition-colors duration-200';

                  if (item.href) {
                    return (
                      <li key={item.label}>
                        <a href={item.href} className={baseClass}>
                          <Icon size={14} className="shrink-0" />
                          {item.label}
                        </a>
                      </li>
                    );
                  }

                  if (!item.to) {
                    return (
                      <li key={item.label} className="flex items-start gap-2 text-sm text-gray-500">
                        <Icon size={14} className="shrink-0 mt-0.5" />
                        <span>{item.label}</span>
                      </li>
                    );
                  }

                  return (
                    <li key={item.label}>
                      <Link to={item.to} className={baseClass}>
                        <Icon size={14} className="shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 w-full bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p className="text-xs text-gray-400 text-center sm:text-left">
            © {currentYear} GinniStays. An IT Engineering Capstone Project.
          </p>

          {/* Language & Currency */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 cursor-pointer transition">
            <Globe size={14} />
            <span>Tiếng Việt</span>
            <span className="text-gray-300">·</span>
            <span>VND</span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;