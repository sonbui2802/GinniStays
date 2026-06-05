import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PropertyCard from '../components/property/PropertyCard';   // ← sửa import nếu cần

const Trips = () => {
  const [viewingRequests, setViewingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/viewing-requests/my-requests').catch(() => ({ data: { data: [] } }));
        setViewingRequests(res?.data?.data || []);
      } catch (error) {
        console.error("Lỗi lấy lịch hẹn:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-semibold border border-amber-200">
            <Clock size={14} /> Chờ chủ nhà duyệt
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
            <CheckCircle2 size={14} /> Đã xác nhận
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
            <XCircle size={14} /> Đã hủy/Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <Loader2 className="animate-spin text-pink-600" size={40} />
        <p className="text-gray-500 text-sm font-medium">Đang tải lịch hẹn...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-20 py-8 min-h-[70vh]">
      {/* Tiêu đề */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lịch hẹn của tôi</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý các cuộc hẹn xem phòng trọ</p>
      </div>

      {/* Nội dung chính */}
      {viewingRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {viewingRequests.map((request) => (
            <div
              key={request.id}
              className="border border-gray-200 rounded-2xl p-5 shadow-sm bg-white hover:shadow-md transition duration-200 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg truncate hover:text-pink-600 transition">
                    <Link to={`/room/${request.property_id}`}>
                      {request.property_title || 'Phòng trọ'}
                    </Link>
                  </h3>
                  {renderStatusBadge(request.status)}
                </div>

                <div className="space-y-2 text-sm text-gray-600 mt-4">
                  <p className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-800">Ngày hẹn:</span>{' '}
                    {new Date(request.preferred_date).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="flex items-start gap-2">
                    <Clock size={16} className="text-gray-400 mt-0.5" />
                    <span>
                      <span className="font-medium text-gray-800">Chi tiết:</span>{' '}
                      {request.message || 'Không có lời nhắn.'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  Gửi lúc: {new Date(request.created_at || request.createdAt).toLocaleDateString('vi-VN')}
                </p>
                <Link
                  to={`/room/${request.property_id}`}
                  className="text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 group"
                >
                  Xem phòng <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium text-base">Bạn chưa có lịch hẹn nào.</p>
          <p className="text-gray-400 text-sm mt-1">Hãy đi khám phá và đặt lịch xem phòng ngay nhé!</p>
          <Link
            to="/"
            className="inline-block mt-4 bg-pink-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-pink-700 transition"
          >
            Tìm phòng trọ
          </Link>
        </div>
      )}
    </div>
  );
};

export default Trips;