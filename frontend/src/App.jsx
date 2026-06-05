import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import HostDashboard from './pages/host/HostDashboard';
import CreateProperty from './pages/host/CreateProperty';
import ProtectedRoute from './components/common/ProtectedRoute';
import EditProperty from './pages/host/EditProperty'; 
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import PropertyDetail from './pages/PropertyDetail'; 
import ContractPreview from './pages/host/ContractPreview';
import TenantContracts from './pages/TenantContracts';
import Wishlist from './pages/Wishlist';
import Trips from './pages/Trips';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout chính bọc mọi trang */}
        <Route path="/" element={<MainLayout />}>
          
          {/* PUBLIC ROUTES */}
          <Route index element={<Home />} />
          <Route path="room/:id" element={<PropertyDetail />} />

          {/* PROTECTED ROUTES - DÀNH CHO TẤT CẢ USER ĐÃ ĐĂNG NHẬP */}
          <Route element={<ProtectedRoute allowedRoles={['tenant', 'landlord', 'admin']} />}>
            <Route path="profile" element={<Profile />} />
            
            {/* ✅ Trang Trips (Phòng đã hẹn + Wishlist) */}
            <Route path="trips" element={<Trips />} />
            
            <Route path="my-contracts" element={<TenantContracts />} />
            <Route path="contract/:id" element={<ContractPreview />} />
            <Route path="wishlist" element={<Wishlist />} />
          </Route>

          {/* PROTECTED ROUTES - CHỈ LANDLORD */}
          <Route element={<ProtectedRoute allowedRoles={['landlord']} />}>
            <Route path="host" element={<HostDashboard />} />
            <Route path="host/create" element={<CreateProperty />} />
            <Route path="host/edit/:id" element={<EditProperty />} />
            <Route path="host/contract/:id" element={<ContractPreview />} />
          </Route>
          
          {/* PROTECTED ROUTES - CHỈ ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;