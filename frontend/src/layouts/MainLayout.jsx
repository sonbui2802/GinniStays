import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Phần nội dung chính. 
        pt-24 (padding-top) đẩy nội dung xuống để không bị Navbar đè lên. 
      */}
      <main className="flex-grow pt-24 pb-10 px-4 sm:px-10 lg:px-20">
        <Outlet /> 
      </main>
        <Footer /> {/* Footer được đặt ở đây, bên ngoài main để luôn nằm dưới cùng */}
      {/* Sau này Footer sẽ được đặt ở đây */}
    </div>
  );
};

export default MainLayout;