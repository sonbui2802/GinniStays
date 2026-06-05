import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2, MapPin, Trash2 } from 'lucide-react';
import api from '../services/api';

const Wishlist = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/wishlists');
                setItems(res.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    const handleRemove = async (propertyId) => {
        try {
            await api.post(`/wishlists/${propertyId}/toggle`);
            setItems(prev => prev.filter(i => i.id !== propertyId));
        } catch (err) {
            alert('❌ Có lỗi xảy ra!');
        }
    };

    const getImageUrl = (url) => {
        if (!url) return `https://picsum.photos/seed/room/400/300`;
        if (!url.includes('res.cloudinary.com')) return url;
        const parts = url.split('/upload/');
        if (parts.length !== 2) return url;
        return `${parts[0]}/upload/q_auto:good,f_auto,w_400,h_300,c_fill,g_auto/${parts[1]}`;
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-pink-600" size={40} />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Danh sách yêu thích</h1>
                <p className="text-gray-500 mt-1">{items.length} phòng đã lưu</p>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <Heart size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 mb-4">Bạn chưa lưu phòng nào.</p>
                    <Link to="/" className="text-pink-600 font-medium hover:underline">
                        Khám phá phòng trọ
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map(item => {
                        const isFull = item.rental_status === 'rented';
                        return (
                            <div key={item.wishlist_id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                                <Link to={`/room/${item.id}`} className="block relative">
                                    <img
                                        src={getImageUrl(item.thumbnail)}
                                        alt={item.title}
                                        className={`w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 ${isFull ? 'grayscale opacity-60' : ''}`}
                                    />
                                    {isFull && (
                                        <div className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                                            Đã cho thuê
                                        </div>
                                    )}
                                </Link>

                                <div className="p-4">
                                    <Link to={`/room/${item.id}`}>
                                        <h3 className="font-semibold text-gray-900 truncate hover:text-pink-600 transition">
                                            {item.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin size={13} /> {item.district}, {item.city}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="font-bold text-gray-900 text-sm">
                                            {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                                            <span className="text-gray-400 font-normal">/tháng</span>
                                        </span>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Bỏ lưu"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Wishlist;