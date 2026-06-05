import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Plus, Minus, Home, MessageSquare, FileText, DollarSign, Edit, Trash2, Check, X as XIcon, Eye } from 'lucide-react';
import api from '../../services/api';

const HostDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('properties');
  const [myProperties, setMyProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageModal, setMessageModal] = useState({ isOpen: false, text: '', time: '', tenant: '' });
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  
  const [approvedRequests, setApprovedRequests] = useState([]);

  const [contractForm, setContractForm] = useState({
    viewing_request_id: '',
    property_id: '',
    tenant_name: '',
    tenant_cccd: '',
    tenant_address: '',
    tenant_phone: '',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    deposit: '',
    terms: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [propsRes, reqsRes, contractsRes] = await Promise.all([
          api.get('/properties/landlord/my-properties'),
          api.get('/viewing-requests/landlord'),
          api.get('/contracts')
        ]);
        setMyProperties(propsRes.data.data || []);
        setRequests(reqsRes.data.data || []);
        setContracts(contractsRes.data.data || []);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isContractModalOpen) {
      setApprovedRequests(requests.filter(r => r.status === 'approved'));
    }
  }, [isContractModalOpen, requests]);

  const handleEdit = (id) => navigate(`/host/edit/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm('🚨 Bạn có chắc chắn muốn xóa vĩnh viễn phòng này không?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setMyProperties(prev => prev.filter(prop => prop.id !== id));
      alert("✅ Đã xóa phòng thành công!");
    } catch (error) {
      console.error("Lỗi xóa phòng:", error);
      alert("❌ Có lỗi xảy ra khi xóa phòng!");
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await api.patch(`/viewing-requests/${requestId}/status`, { status: newStatus });
      setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
      alert(`Đã ${newStatus === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu thành công!`);
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleUpdateOccupants = async (propertyId, currentCount, maxCount, change) => {
    const newCount = currentCount + change;
    if (newCount < 0 || (maxCount && newCount > maxCount)) return;
    try {
      await api.patch(`/properties/${propertyId}/occupants`, { current_occupants: newCount });
      setMyProperties(prevProps =>
        prevProps.map(prop =>
          prop.id === propertyId
            ? { ...prop, current_occupants: newCount, rental_status: (maxCount && newCount >= maxCount) ? 'rented' : 'available' }
            : prop
        )
      );
    } catch (error) {
      console.error("Lỗi cập nhật số người:", error);
      alert("Có lỗi xảy ra khi cập nhật!");
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/contracts', contractForm);
      const newContract = res.data.data;
      setContracts(prev => [newContract, ...prev]);
      setIsContractModalOpen(false);
      setContractForm({
        viewing_request_id: '', property_id: '', tenant_name: '', tenant_cccd: '',
        tenant_address: '', tenant_phone: '', start_date: '',
        end_date: '', monthly_rent: '', deposit: '', terms: ''
      });
      alert('✅ Tạo hợp đồng thành công!');
      navigate(`/host/contract/${newContract.id}`);
    } catch (err) {
      alert(err.response?.data?.message || '❌ Có lỗi xảy ra!');
    }
  };

  const handleDeleteContract = async (id) => {
    if (!window.confirm('Xóa hợp đồng này?')) return;
    try {
      await api.delete(`/contracts/${id}`);
      setContracts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('❌ Có lỗi xảy ra!');
    }
  };

  const parseMessage = (rawMsg) => {
    if (!rawMsg) return { time: 'Không rõ', text: 'Không có lời nhắn' };
    const strMsg = String(rawMsg);
    const timeMatch = strMsg.match(/Khung giờ hẹn:\s*(.*?)\./);
    const textMatch = strMsg.match(/Lời nhắn:\s*(.*)/);
    return {
      time: timeMatch ? timeMatch[1].trim() : 'Không rõ',
      text: textMatch ? textMatch[1].trim() : strMsg
    };
  };

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
  const totalRevenue = myProperties
    .filter(prop => prop.rental_status === 'rented')
    .reduce((sum, prop) => sum + (Number(prop.price) || 0), 0);

  const stats = [
    { label: 'Phòng đang hoạt động', value: myProperties.length.toString(), icon: Home },
    { label: 'Yêu cầu chờ duyệt', value: pendingRequestsCount.toString(), icon: MessageSquare },
    {
      label: 'Tổng doanh thu',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue),
      icon: DollarSign
    },
    { label: 'Hợp đồng hiệu lực', value: contracts.filter(c => c.status === 'active').length.toString(), icon: FileText },
  ];

  const tabNames = {
    'overview': 'Tổng quan',
    'properties': 'Phòng trọ',
    'requests': 'Yêu cầu',
    'contracts': 'Hợp đồng',
    'earnings': 'Doanh thu'
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Chủ trọ</h1>
          <p className="text-gray-500 mt-1">Quản lý phòng trọ, yêu cầu đặt phòng và doanh thu của bạn.</p>
        </div>
        <Link
          to="/host/create"
          className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 transition"
        >
          <Plus size={20} />
          Đăng phòng mới
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-lg"><stat.icon className="text-gray-600" size={24} /></div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {Object.keys(tabNames).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tabNames[tab]}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 min-h-[300px]">

        {/* TAB PHÒNG TRỌ */}
        {activeTab === 'properties' ? (
          <div>
            <h2 className="text-xl font-bold mb-6">Danh sách phòng của bạn</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-500">Đang tải dữ liệu...</p>
              </div>
            ) : myProperties.length === 0 ? (
              <div className="text-center py-10">
                <Home size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 mb-4">Bạn chưa có bài đăng nào.</p>
                <Link to="/host/create" className="text-pink-600 font-medium hover:underline">Đăng phòng ngay</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-sm text-gray-500">
                      <th className="pb-3 font-medium px-4">PHÒNG TRỌ</th>
                      <th className="pb-3 font-medium px-4">ĐỊA CHỈ</th>
                      <th className="pb-3 font-medium px-4">KIỂM DUYỆT</th>
                      <th className="pb-3 font-medium px-4">TÌNH TRẠNG THUÊ</th>
                      <th className="pb-3 font-medium px-4 text-right">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProperties.map((prop) => {
                      const isFull = prop.rental_status === 'rented' || (prop.max_occupants && (prop.current_occupants || 0) >= prop.max_occupants);
                      return (
                        <tr key={prop.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-medium text-gray-900">{prop.title}</td>
                          <td className="py-4 px-4 text-gray-500">{prop.district}, {prop.city}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              prop.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {prop.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col items-start gap-2">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                isFull ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {isFull ? 'Đã cho thuê / Kín chỗ' : 'Còn trống'}
                              </span>
                              <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                <span>Số người:</span>
                                <div className="flex items-center border rounded-md bg-white shadow-sm">
                                  <button
                                    onClick={() => handleUpdateOccupants(prop.id, prop.current_occupants || 0, prop.max_occupants, -1)}
                                    disabled={(prop.current_occupants || 0) <= 0}
                                    className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition rounded-l-md"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="px-2 font-medium min-w-[2.5rem] text-center text-gray-900">
                                    {prop.current_occupants || 0} / {prop.max_occupants || '∞'}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateOccupants(prop.id, prop.current_occupants || 0, prop.max_occupants, 1)}
                                    disabled={prop.max_occupants && (prop.current_occupants || 0) >= prop.max_occupants}
                                    className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 disabled:opacity-30 disabled:hover:bg-transparent transition rounded-r-md"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 flex justify-end gap-3">
                            <button onClick={() => handleEdit(prop.id)} className="p-2 text-gray-400 hover:text-blue-600 transition" title="Chỉnh sửa">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(prop.id)} className="p-2 text-gray-400 hover:text-red-600 transition" title="Xóa">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        ) : activeTab === 'requests' ? (
          <div>
            <h2 className="text-xl font-bold mb-6">Yêu cầu hẹn xem phòng</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-500">Đang tải dữ liệu...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500">Bạn chưa có yêu cầu xem phòng nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-sm text-gray-500">
                      <th className="pb-3 font-medium px-4 min-w-[150px]">KHÁCH THUÊ</th>
                      <th className="pb-3 font-medium px-4 min-w-[200px]">PHÒNG QUAN TÂM</th>
                      <th className="pb-3 font-medium px-4">NGÀY HẸN</th>
                      <th className="pb-3 font-medium px-4">KHUNG GIỜ</th>
                      <th className="pb-3 font-medium px-4">LỜI NHẮN</th>
                      <th className="pb-3 font-medium px-4">TRẠNG THÁI</th>
                      <th className="pb-3 font-medium px-4 text-right">PHÊ DUYỆT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => {
                      const targetProp = req.property || myProperties.find(p => p.id === req.property_id);
                      const isFull = targetProp && (
                        targetProp.rental_status === 'rented' ||
                        (targetProp.max_occupants && targetProp.current_occupants >= targetProp.max_occupants)
                      );
                      const msgData = parseMessage(req.message);
                      return (
                        <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-medium text-gray-900">{req.tenant?.name || 'Khách thuê'}</td>
                          <td className="py-4 px-4 text-pink-600 font-medium truncate max-w-[200px]" title={targetProp?.title}>
                            {targetProp ? targetProp.title : `Phòng ID: ${req.property_id}`}
                          </td>
                          <td className="py-4 px-4 text-gray-900">{new Date(req.preferred_date).toLocaleDateString('vi-VN')}</td>
                          <td className="py-4 px-4 text-gray-900 font-medium">{msgData.time}</td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => setMessageModal({ isOpen: true, text: msgData.text, time: msgData.time, tenant: req.tenant?.name || 'Khách thuê' })}
                              className="text-sm text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-4 flex items-center gap-1"
                            >
                              <FileText size={16} /> Xem chi tiết
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              req.status === 'approved' ? 'bg-green-100 text-green-700' :
                              req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {req.status === 'approved' ? 'Đã duyệt' : req.status === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt'}
                            </span>
                          </td>
                          <td className="py-4 px-4 flex justify-end gap-2">
                            {req.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'approved')}
                                  disabled={isFull}
                                  title={isFull ? 'Phòng đã hết chỗ / Đã cho thuê' : 'Duyệt yêu cầu'}
                                  className={`p-2 rounded-lg transition ${isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                >
                                  <Check size={18} strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                  title="Từ chối yêu cầu"
                                  className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition"
                                >
                                  <XIcon size={18} strokeWidth={2.5} />
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm italic">Đã xử lý</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        ) : activeTab === 'contracts' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Hợp đồng thuê phòng</h2>
              <button
                onClick={() => setIsContractModalOpen(true)}
                className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-pink-700 transition"
              >
                <Plus size={16} /> Tạo hợp đồng
              </button>
            </div>

            {contracts.length === 0 ? (
              <div className="text-center py-10">
                <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500">Chưa có hợp đồng nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-xs text-gray-500">
                      <th className="pb-3 px-4 font-medium">PHÒNG</th>
                      <th className="pb-3 px-4 font-medium">KHÁCH THUÊ</th>
                      <th className="pb-3 px-4 font-medium">THỜI HẠN</th>
                      <th className="pb-3 px-4 font-medium">GIÁ THUÊ</th>
                      <th className="pb-3 px-4 font-medium">TRẠNG THÁI</th>
                      <th className="pb-3 px-4 font-medium text-right">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map(c => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900 max-w-[180px] truncate">{c.property_title}</td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{c.tenant_name}</p>
                          <p className="text-xs text-gray-400">{c.tenant_phone}</p>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <p>{new Date(c.start_date).toLocaleDateString('vi-VN')}</p>
                          <p className="text-xs text-gray-400">→ {new Date(c.end_date).toLocaleDateString('vi-VN')}</p>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-800">
                          {new Intl.NumberFormat('vi-VN').format(c.monthly_rent)}đ
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            c.status === 'active' ? 'bg-green-100 text-green-700'
                            : c.status === 'expired' ? 'bg-gray-100 text-gray-600'
                            : 'bg-red-100 text-red-600'
                          }`}>
                            {c.status === 'active' ? 'Hiệu lực' : c.status === 'expired' ? 'Hết hạn' : 'Đã hủy'}
                          </span>
                        </td>
                        <td className="py-4 px-4 flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/host/contract/${c.id}`)}
                            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition"
                            title="Xem / In hợp đồng"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteContract(c.id)}
                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        ) : (
          <div className="flex flex-col items-center justify-center h-48 gap-4">
            <FileText size={48} className="text-gray-200" />
            <p className="text-gray-500">Chưa có dữ liệu cho mục này.</p>
          </div>
        )}
      </div>

      {/* MODAL TẠO HỢP ĐỒNG */}
      {isContractModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">Tạo hợp đồng mới</h3>
              <button onClick={() => setIsContractModalOpen(false)}>
                <XIcon size={22} className="text-gray-400 hover:text-gray-800" />
              </button>
            </div>
            <form onSubmit={handleCreateContract} className="p-6 space-y-6">
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">
                    Chọn từ yêu cầu xem phòng đã duyệt
                </h4>
                <select
                    value={contractForm.viewing_request_id}
                    onChange={e => {
                        const reqId = Number(e.target.value);
                        const req = approvedRequests.find(r => r.id === reqId);
                        if (req) {
                            const prop = myProperties.find(p => p.id === (req.property_id || req.property?.id));
                            setContractForm(p => ({
                                ...p,
                                viewing_request_id: reqId,
                                property_id: prop?.id || '',
                                tenant_name: req.tenant?.name || '',
                                tenant_phone: req.tenant?.phone || '',
                                monthly_rent: prop?.price || '',
                            }));
                        }
                    }}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-white"
                >
                    <option value="">-- Chọn yêu cầu xem phòng đã duyệt (tùy chọn) --</option>
                    {approvedRequests.map(r => (
                        <option key={r.id} value={r.id}>
                            {r.tenant?.name} — {r.property?.title || `Phòng ID: ${r.property_id}`}
                            {' '}— {new Date(r.preferred_date).toLocaleDateString('vi-VN')}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                    Chọn để tự động điền thông tin tenant và phòng
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Thông tin phòng</h4>
                <select
                  required
                  value={contractForm.property_id}
                  onChange={e => setContractForm(p => ({ ...p, property_id: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-white"
                >
                  <option value="">-- Chọn phòng --</option>
                  {myProperties.filter(p => p.status === 'approved').map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Thông tin Bên B (Khách thuê)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Họ và tên <span className="text-red-500">*</span></label>
                    <input required type="text" placeholder="Nguyễn Văn A"
                      value={contractForm.tenant_name}
                      onChange={e => setContractForm(p => ({ ...p, tenant_name: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">CMND/CCCD</label>
                    <input type="text" placeholder="012345678901"
                      value={contractForm.tenant_cccd}
                      onChange={e => setContractForm(p => ({ ...p, tenant_cccd: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Số điện thoại</label>
                    <input type="text" placeholder="0912345678"
                      value={contractForm.tenant_phone}
                      onChange={e => setContractForm(p => ({ ...p, tenant_phone: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Địa chỉ thường trú</label>
                    <input type="text" placeholder="123 Đường ABC, Hà Nội"
                      value={contractForm.tenant_address}
                      onChange={e => setContractForm(p => ({ ...p, tenant_address: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Điều khoản hợp đồng</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ngày bắt đầu <span className="text-red-500">*</span></label>
                    <input required type="date"
                      value={contractForm.start_date}
                      onChange={e => setContractForm(p => ({ ...p, start_date: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ngày kết thúc <span className="text-red-500">*</span></label>
                    <input required type="date"
                      value={contractForm.end_date}
                      onChange={e => setContractForm(p => ({ ...p, end_date: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Giá thuê/tháng (VNĐ) <span className="text-red-500">*</span></label>
                    <input required type="number" placeholder="5000000"
                      value={contractForm.monthly_rent}
                      onChange={e => setContractForm(p => ({ ...p, monthly_rent: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Tiền đặt cọc (VNĐ)</label>
                    <input type="number" placeholder="5000000"
                      value={contractForm.deposit}
                      onChange={e => setContractForm(p => ({ ...p, deposit: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-xs text-gray-500 mb-1 block">Điều khoản bổ sung (không bắt buộc)</label>
                  <textarea rows="3"
                    placeholder="Ví dụ: không nuôi thú cưng, không hút thuốc trong phòng..."
                    value={contractForm.terms}
                    onChange={e => setContractForm(p => ({ ...p, terms: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsContractModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-pink-600 text-white rounded-xl text-sm font-semibold hover:bg-pink-700 transition"
                >
                  Tạo & Xem hợp đồng
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL XEM CHI TIẾT LỜI NHẮN */}
      {messageModal.isOpen && createPortal(
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setMessageModal({ isOpen: false, text: '', time: '', tenant: '' })}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Lời nhắn từ {messageModal.tenant}</h3>
              <button
                onClick={() => setMessageModal({ isOpen: false, text: '', time: '', tenant: '' })}
                className="text-gray-400 hover:text-gray-900 transition p-1 bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                <XIcon size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500 block mb-1">Khung giờ hẹn:</span>
                <span className="text-gray-900 font-semibold bg-gray-100 px-3 py-1.5 rounded-lg inline-block">{messageModal.time}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-2">Nội dung chi tiết:</span>
                <div className="bg-blue-50 text-blue-900 p-4 rounded-xl whitespace-pre-wrap leading-relaxed border border-blue-100">
                  {messageModal.text}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HostDashboard;