import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Eye, Loader2, X } from 'lucide-react';
import api from '../services/api';

const TenantContracts = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmingId, setConfirmingId] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/contracts/my-contracts');
                setContracts(res.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    const handleConfirm = async (id) => {
        try {
            setConfirmingId(id);
            await api.patch(`/contracts/${id}/confirm`);
            setContracts(prev => prev.map(c =>
                c.id === id ? { ...c, status: 'active', signed_at: new Date().toISOString() } : c
            ));
            alert('🎉 Ký hợp đồng thành công! Chúc mừng bạn đã có chỗ ở mới.');
        } catch (err) {
            alert(err.response?.data?.message || '❌ Có lỗi xảy ra!');
        } finally {
            setConfirmingId(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn từ chối hợp đồng này?')) return;
        try {
            await api.patch(`/contracts/${id}/status`, { status: 'terminated' });
            setContracts(prev => prev.map(c =>
                c.id === id ? { ...c, status: 'terminated' } : c
            ));
        } catch (err) {
            alert('❌ Có lỗi xảy ra!');
        }
    };

    const statusConfig = {
        pending_tenant: { label: '⏳ Chờ bạn ký', cls: 'bg-yellow-100 text-yellow-700' },
        active:         { label: '✅ Đang hiệu lực', cls: 'bg-green-100 text-green-700' },
        expired:        { label: 'Hết hạn', cls: 'bg-gray-100 text-gray-600' },
        terminated:     { label: 'Đã hủy', cls: 'bg-red-100 text-red-600' },
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-pink-600" size={40} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Hợp đồng của tôi</h1>
                <p className="text-gray-500 mt-1">Xem và ký kết các hợp đồng thuê phòng.</p>
            </div>

            {contracts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500">Bạn chưa có hợp đồng nào.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {contracts.map(c => {
                        const status = statusConfig[c.status] || statusConfig.terminated;
                        return (
                            <div key={c.id} className={`bg-white rounded-2xl border p-6 shadow-sm transition ${
                                c.status === 'pending_tenant' ? 'border-yellow-200' : 'border-gray-100'
                            }`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{c.property_title}</h3>
                                        <p className="text-gray-500 text-sm mt-0.5">
                                            {c.property_address}, {c.district}, {c.city}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ml-4 ${status.cls}`}>
                                        {status.label}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <p className="text-gray-400 mb-0.5">Giá thuê</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Intl.NumberFormat('vi-VN').format(c.monthly_rent)}đ/tháng
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-0.5">Tiền cọc</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Intl.NumberFormat('vi-VN').format(c.deposit)}đ
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-0.5">Bắt đầu</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(c.start_date).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-0.5">Kết thúc</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(c.end_date).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-500 mb-1">
                                    Chủ nhà: <span className="font-medium text-gray-700">{c.landlord_name}</span>
                                    {c.landlord_phone && <span className="ml-2 text-gray-400">· {c.landlord_phone}</span>}
                                </div>

                                {c.signed_at && (
                                    <p className="text-xs text-green-600 mt-1">
                                        Đã ký lúc {new Date(c.signed_at).toLocaleString('vi-VN')}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                                    <button
                                        onClick={() => navigate(`/contract/${c.id}`)}
                                        className="flex items-center gap-2 text-sm border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition font-medium"
                                    >
                                        <Eye size={16} /> Xem hợp đồng
                                    </button>

                                    {c.status === 'pending_tenant' && (
                                        <>
                                            <button
                                                onClick={() => handleConfirm(c.id)}
                                                disabled={confirmingId === c.id}
                                                className="flex items-center gap-2 text-sm bg-pink-600 text-white px-6 py-2 rounded-xl hover:bg-pink-700 transition font-semibold disabled:bg-gray-300"
                                            >
                                                {confirmingId === c.id
                                                    ? <Loader2 size={16} className="animate-spin" />
                                                    : <CheckCircle size={16} />
                                                }
                                                Đồng ý ký kết
                                            </button>
                                            <button
                                                onClick={() => handleReject(c.id)}
                                                className="flex items-center gap-2 text-sm border border-red-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition font-medium"
                                            >
                                                <X size={16} /> Từ chối
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TenantContracts;