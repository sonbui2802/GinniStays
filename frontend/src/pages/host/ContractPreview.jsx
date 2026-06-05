    import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../../services/api';

const ContractPreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const printRef = useRef();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/contracts/${id}`);
                setContract(res.data.data);
            } catch (err) {
                alert('Không tìm thấy hợp đồng!');
                navigate('/host');
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [id]);

    const handlePrint = () => window.print();

    const formatDate = (dateStr) => {
        if (!dateStr) return '........';
        const d = new Date(dateStr);
        return `ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
    };

    const formatMoney = (num) => {
        if (!num) return '........';
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const toWords = (num) => {
        // Đơn giản — hiển thị số, bổ sung thư viện sau nếu cần
        return formatMoney(num) + ' đồng';
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="animate-spin text-pink-600" size={48} />
        </div>
    );

    if (!contract) return null;

    return (
        <>
            {/* Toolbar — ẩn khi print */}
            <div className="print:hidden flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
                <button
                    onClick={() => navigate('/host')}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                    <ArrowLeft size={18} /> Quay lại
                </button>
                <h1 className="font-bold text-gray-900">Xem trước hợp đồng #{contract.id}</h1>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition"
                >
                    <Printer size={16} /> In / Lưu PDF
                </button>
            </div>

            {/* Nội dung hợp đồng */}
            <div
                ref={printRef}
                className="max-w-3xl mx-auto my-8 px-16 py-12 bg-white shadow-lg print:shadow-none print:my-0 print:px-12 print:py-10"
                style={{ fontFamily: 'Times New Roman, serif', fontSize: '14px', lineHeight: '1.8' }}
            >
                {/* Tiêu đề */}
                <div className="text-center mb-8">
                    <p className="font-bold text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-sm">Độc lập – Tự do – Hạnh phúc</p>
                    <p className="text-center text-sm mt-1">―――――――――――</p>
                    <p className="font-bold text-xl mt-6 mb-2">HỢP ĐỒNG THUÊ PHÒNG TRỌ</p>
                    <p className="text-sm italic">
                        Hôm nay, {formatDate(contract.start_date)}, tại {contract.property_address}, {contract.district}, {contract.city}.
                        Chúng tôi ký tên dưới đây gồm có:
                    </p>
                </div>

                {/* Bên A */}
                <div className="mb-4">
                    <p className="font-bold">BÊN CHO THUÊ PHÒNG TRỌ (gọi tắt là Bên A):</p>
                    <p>Ông/bà: <span className="font-semibold">{contract.landlord_name || '................................'}</span></p>
                    <p>Số điện thoại: <span className="font-semibold">{contract.landlord_phone || '................................'}</span></p>
                    <p>Email: <span className="font-semibold">{contract.landlord_email || '................................'}</span></p>
                </div>

                {/* Bên B */}
                <div className="mb-6">
                    <p className="font-bold">BÊN THUÊ PHÒNG TRỌ (gọi tắt là Bên B):</p>
                    <p>Ông/bà: <span className="font-semibold">{contract.tenant_name || '................................'}</span></p>
                    <p>CMND/CCCD số: <span className="font-semibold">{contract.tenant_cccd || '................................'}</span></p>
                    <p>Số điện thoại: <span className="font-semibold">{contract.tenant_phone || '................................'}</span></p>
                    <p>Thường trú tại: <span className="font-semibold">{contract.tenant_address || '................................'}</span></p>
                </div>

                <p className="italic text-center mb-6">Sau khi thỏa thuận, hai bên thống nhất như sau:</p>

                {/* Điều 1 */}
                <div className="mb-4">
                    <p className="font-bold">1. Nội dung thuê phòng trọ</p>
                    <p>
                        Bên A cho Bên B thuê phòng tại: <strong>{contract.property_address}, {contract.district}, {contract.city}</strong>.
                    </p>
                    <p>
                        Thời hạn thuê từ <strong>{formatDate(contract.start_date)}</strong> đến <strong>{formatDate(contract.end_date)}</strong>.
                    </p>
                    <p>
                        Giá thuê: <strong>{formatMoney(contract.monthly_rent)} đồng/tháng</strong>
                        {' '}(Bằng chữ: {toWords(contract.monthly_rent)}).
                    </p>
                    <p>Chưa bao gồm chi phí điện sinh hoạt, nước.</p>
                </div>

                {/* Điều 2 */}
                <div className="mb-4">
                    <p className="font-bold">2. Trách nhiệm Bên A</p>
                    <p>Đảm bảo căn nhà cho thuê không có tranh chấp, khiếu kiện.</p>
                    <p>Đăng ký với chính quyền địa phương về thủ tục cho thuê phòng trọ.</p>
                </div>

                {/* Điều 3 */}
                <div className="mb-4">
                    <p className="font-bold">3. Trách nhiệm Bên B</p>
                    <p>
                        Đặt cọc với số tiền: <strong>{formatMoney(contract.deposit)} đồng</strong>
                        {' '}(Bằng chữ: {toWords(contract.deposit)}).
                    </p>
                    <p>Thanh toán tiền thuê phòng hàng tháng đúng hạn.</p>
                    <p>Đảm bảo các thiết bị và sửa chữa các hư hỏng trong phòng trong khi sử dụng.</p>
                    <p>Chỉ sử dụng phòng trọ vào mục đích ở; không chứa các thiết bị gây cháy nổ, hàng cấm; giữ gìn an ninh trật tự.</p>
                    <p>Không được tự ý cải tạo kiến trúc phòng khi chưa có sự đồng ý của Bên A.</p>
                </div>

                {/* Điều 4 */}
                <div className="mb-4">
                    <p className="font-bold">4. Điều khoản thực hiện</p>
                    <p>
                        Hai bên nghiêm túc thực hiện những quy định trên trong thời hạn cho thuê.
                        Nếu Bên A lấy phòng phải báo cho Bên B ít nhất 01 tháng, hoặc ngược lại.
                    </p>
                    {contract.terms && (
                        <p className="mt-2">
                            <strong>Điều khoản bổ sung:</strong> {contract.terms}
                        </p>
                    )}
                </div>

                {/* Ký tên */}
                <div className="mt-12 grid grid-cols-2 gap-8 text-center">
                    <div>
                        <p className="font-bold">Bên B</p>
                        <p className="text-sm italic">(Ký, ghi rõ họ tên)</p>
                        <div className="mt-16 border-t border-gray-400 pt-2">
                            <p className="font-semibold">{contract.tenant_name || ''}</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold">Bên A</p>
                        <p className="text-sm italic">(Ký, ghi rõ họ tên)</p>
                        <div className="mt-16 border-t border-gray-400 pt-2">
                            <p className="font-semibold">{contract.landlord_name || ''}</p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs italic mt-8 text-gray-400">
                    (Hợp đồng được lập trên nền tảng GinniStays)
                </p>
            </div>

            {/* CSS print */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
                    .print\\:shadow-none { position: absolute; left: 0; top: 0; width: 100%; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </>
    );
};

export default ContractPreview;