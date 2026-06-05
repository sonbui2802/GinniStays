import { useState, useEffect } from 'react';
import { 
    Users, Home, Clock, CheckCircle, XCircle, 
    Trash2, Ban, Check, BarChart2, RefreshCw, Eye
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [properties, setProperties] = useState([]);
    const [users, setUsers] = useState([]);
    const [propertyFilter, setPropertyFilter] = useState('pending');
    const [userFilter, setUserFilter] = useState('');

    const tabNames = {
        overview: 'Tổng quan',
        properties: 'Phòng trọ',
        users: 'Người dùng',
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data.data);
        } catch (err) { console.error('Lỗi lấy stats:', err); }
    };

    const fetchProperties = async (status) => {
        setIsLoading(true);
        try {
            const res = await api.get(`/admin/properties?status=${status}`);
            setProperties(res.data.data || []);
        } catch (err) { console.error('Lỗi lấy properties:', err); }
        finally { setIsLoading(false); }
    };

    const fetchUsers = async (role) => {
        setIsLoading(true);
        try {
            const res = await api.get(`/admin/users${role ? `?role=${role}` : ''}`);
            setUsers(res.data.data || []);
        } catch (err) { console.error('Lỗi lấy users:', err); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { if (activeTab === 'properties') fetchProperties(propertyFilter); }, [activeTab, propertyFilter]);
    useEffect(() => { if (activeTab === 'users') fetchUsers(userFilter); }, [activeTab, userFilter]);

    const handleApprove = async (id) => {
        if (!window.confirm('Duyệt phòng này?')) return;
        try {
            await api.patch(`/admin/properties/${id}/approve`);
            setProperties(prev => prev.filter(p => p.id !== id));
            fetchStats();
            alert('✅ Đã duyệt phòng!');
        } catch (err) { alert('❌ Có lỗi xảy ra!'); }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Lý do từ chối (không bắt buộc):');
        if (reason === null) return;
        try {
            await api.patch(`/admin/properties/${id}/reject`, { reason });
            setProperties(prev => prev.filter(p => p.id !== id));
            fetchStats();
            alert('✅ Đã từ chối phòng!');
        } catch (err) { alert('❌ Có lỗi xảy ra!'); }
    };

    const handleDeleteProperty = async (id) => {
        if (!window.confirm('🚨 Xóa vĩnh viễn phòng này?')) return;
        try {
            await api.delete(`/admin/properties/${id}`);
            setProperties(prev => prev.filter(p => p.id !== id));
            fetchStats();
            alert('✅ Đã xóa phòng!');
        } catch (err) { alert('❌ Có lỗi xảy ra!'); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('🚨 Xóa vĩnh viễn tài khoản này? Toàn bộ phòng trọ sẽ bị xóa theo!')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
            fetchStats();
            alert('✅ Đã xóa tài khoản!');
        } catch (err) { alert(err.response?.data?.message || '❌ Có lỗi xảy ra!'); }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        if (!window.confirm(`${currentStatus ? 'Khóa' : 'Mở khóa'} tài khoản này?`)) return;
        try {
            await api.patch(`/admin/users/${id}/toggle-status`);
            setUsers(prev => prev.map(u =>
                u.id === id ? { ...u, is_active: currentStatus ? 0 : 1 } : u
            ));
        } catch (err) { alert(err.response?.data?.message || '❌ Có lỗi xảy ra!'); }
    };

    const statCards = stats ? [
        { label: 'Tổng người dùng', value: stats.users.total_users, sub: `${stats.users.total_landlords} chủ trọ · ${stats.users.total_tenants} khách`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Phòng chờ duyệt', value: stats.properties.pending_properties, sub: `${stats.properties.approved_properties} đã duyệt`, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'Phòng đang hiển thị', value: stats.properties.approved_properties, sub: `${stats.properties.rented_properties} đã cho thuê`, icon: Home, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Phòng mới (7 ngày)', value: stats.properties.new_this_week, sub: `${stats.requests?.pending_requests || 0} yêu cầu chờ`, icon: BarChart2, color: 'text-pink-600', bg: 'bg-pink-50' },
    ] : [];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Quản lý toàn bộ hệ thống GinniStays.</p>
                </div>
                <button
                    onClick={() => { fetchStats(); if (activeTab === 'properties') fetchProperties(propertyFilter); if (activeTab === 'users') fetchUsers(userFilter); }}
                    className="flex items-center gap-2 text-sm border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                >
                    <RefreshCw size={16} /> Làm mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 ${card.bg} rounded-lg`}>
                                <card.icon className={card.color} size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{card.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-8">
                    {Object.entries(tabNames).map(([key, label]) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === key ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {label}
                            {activeTab === key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8 min-h-[300px]">

                {/* TAB TỔNG QUAN */}
                {activeTab === 'overview' && stats && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4">Tỷ lệ lấp đầy</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div className="bg-pink-500 h-4 rounded-full transition-all" style={{ width: `${stats.properties.approved_properties ? (stats.properties.rented_properties / stats.properties.approved_properties * 100) : 0}%` }} />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 shrink-0">
                                    {stats.properties.approved_properties ? Math.round(stats.properties.rented_properties / stats.properties.approved_properties * 100) : 0}% đã cho thuê
                                </span>
                            </div>
                            <div className="flex gap-6 mt-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-pink-500 inline-block" />Đã cho thuê: {stats.properties.rented_properties}</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-200 inline-block" />Còn trống: {stats.properties.available_properties}</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-4">Top quận có nhiều phòng nhất</h2>
                            <div className="space-y-3">
                                {stats.top_districts.map((d, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <span className="text-sm text-gray-500 w-4">{idx + 1}</span>
                                        <span className="text-sm font-medium text-gray-800 w-40">{d.district}, {d.city}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(d.count / stats.top_districts.count) * 100}%` }} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 w-8 text-right">{d.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB PHÒNG TRỌ */}
                {activeTab === 'properties' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Quản lý phòng trọ</h2>
                            <div className="flex gap-2">
                                {['pending', 'approved', 'rejected'].map(s => (
                                    <button key={s} onClick={() => setPropertyFilter(s)}
                                        className={`text-sm px-4 py-1.5 rounded-full border transition ${propertyFilter === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                                    >
                                        {s === 'pending' ? 'Chờ duyệt' : s === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isLoading ? (
                            <p className="text-center text-gray-400 py-10">Đang tải...</p>
                        ) : properties.length === 0 ? (
                            <p className="text-center text-gray-400 py-10">Không có phòng nào.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b text-xs text-gray-500">
                                            <th className="pb-3 px-4 font-medium">PHÒNG TRỌ</th>
                                            <th className="pb-3 px-4 font-medium">CHỦ NHÀ</th>
                                            <th className="pb-3 px-4 font-medium">GIÁ</th>
                                            <th className="pb-3 px-4 font-medium">ĐỊA CHỈ</th>
                                            <th className="pb-3 px-4 font-medium text-right">HÀNH ĐỘNG</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {properties.map(prop => (
                                            <tr key={prop.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={prop.thumbnail || `https://picsum.photos/seed/${prop.id}/60/60`} alt={prop.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                                        <span className="font-medium text-gray-900 text-sm line-clamp-2 max-w-[200px]">{prop.title}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="text-sm font-medium text-gray-800">{prop.landlord_name}</p>
                                                    <p className="text-xs text-gray-400">{prop.landlord_email}</p>
                                                </td>
                                                <td className="py-4 px-4 text-sm font-semibold text-gray-800">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prop.price)}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-500">{prop.district}, {prop.city}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex justify-end gap-2">
                                                        {/* Đã sửa thẻ a tại đây */}
                                                        <a
                                                            href={`/room/${prop.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                                                            title="Xem trang chi tiết"
                                                        >
                                                            <Eye size={18} />
                                                        </a>
                                                        {prop.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => handleApprove(prop.id)} className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition" title="Duyệt">
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                                <button onClick={() => handleReject(prop.id)} className="p-2 bg-yellow-100 text-yellow-600 hover:bg-yellow-200 rounded-lg transition" title="Từ chối">
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button onClick={() => handleDeleteProperty(prop.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition" title="Xóa">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB NGƯỜI DÙNG */}
                {activeTab === 'users' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Quản lý người dùng</h2>
                            <div className="flex gap-2">
                                {[{ value: '', label: 'Tất cả' }, { value: 'landlord', label: 'Chủ trọ' }, { value: 'tenant', label: 'Khách thuê' }].map(f => (
                                    <button key={f.value} onClick={() => setUserFilter(f.value)}
                                        className={`text-sm px-4 py-1.5 rounded-full border transition ${userFilter === f.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isLoading ? (
                            <p className="text-center text-gray-400 py-10">Đang tải...</p>
                        ) : users.length === 0 ? (
                            <p className="text-center text-gray-400 py-10">Không có người dùng nào.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b text-xs text-gray-500">
                                            <th className="pb-3 px-4 font-medium">NGƯỜI DÙNG</th>
                                            <th className="pb-3 px-4 font-medium">ROLE</th>
                                            <th className="pb-3 px-4 font-medium">SỐ ĐIỆN THOẠI</th>
                                            <th className="pb-3 px-4 font-medium">PHÒNG ĐĂNG</th>
                                            <th className="pb-3 px-4 font-medium">TRẠNG THÁI</th>
                                            <th className="pb-3 px-4 font-medium text-right">HÀNH ĐỘNG</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=FF385C&color=fff&bold=true`} alt={u.full_name} className="w-9 h-9 rounded-full object-cover" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                                                            <p className="text-xs text-gray-400">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'landlord' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {u.role === 'admin' ? 'Admin' : u.role === 'landlord' ? 'Chủ trọ' : 'Khách thuê'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-600">{u.phone || '—'}</td>
                                                <td className="py-4 px-4 text-sm font-semibold text-gray-800">{u.property_count || 0}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {u.is_active ? 'Hoạt động' : 'Đã khóa'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex justify-end gap-2">
                                                        {u.role !== 'admin' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleToggleStatus(u.id, u.is_active)}
                                                                    className={`p-2 rounded-lg transition ${u.is_active ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                                                    title={u.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                                                                >
                                                                    {u.is_active ? <Ban size={18} /> : <Check size={18} />}
                                                                </button>
                                                                <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition" title="Xóa tài khoản">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;