import React, { useState, useContext } from 'react'; 
import { Routes, Route } from 'react-router-dom';
import { AuthContext } from "./context/AuthContext.jsx";
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navbar from './component/Navbar.jsx';
import Footer from './component/footer.jsx';
import ProtectedRoute from "./component/ProtectedRoute.jsx";
import Sidebar from "./component/sidebar.jsx";

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Checkout from './pages/Checkout.jsx';
import Products from './pages/Product.jsx';
import MyOrders from './pages/Myorders.jsx'; 
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminOrders from './pages/Adminorders.jsx'; 
import ProductManagement from './pages/ProductManagement.jsx';
import Profile from './pages/Profile.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';

function App() {
  const { user, logout } = useContext(AuthContext);
  // Sidebar state logic
  const [isSidebarOpen, setSidebarOpen] = useState(false); 

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* 1. FIXED NAVBAR */}
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-20 md:pt-24"> 
       
        {/* 2. SIDEBAR */}
        {user && (
          <Sidebar 
            user={user} 
            logout={logout} 
            isOpen={isSidebarOpen} 
            closeSidebar={() => setSidebarOpen(false)} 
          />
        )}

        {/* 3. NOTIFICATIONS: Top-Right with industrial theme */}
        <Toaster
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1e293b', 
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '16px 24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
            },
            success: {
              icon: null, 
              style: { borderLeft: '4px solid #3b82f6' }, 
            },
            error: {
              icon: null, 
              style: { borderLeft: '4px solid #ef4444' }, 
            },
          }}
        />
        
        {/* 4. MAIN CONTENT: Responsive Margin Adjustment */}
        {/* 'lg:ml-64' ensures margin only appears on desktop when sidebar is open */}
        <main className={`flex-1 transition-all duration-300 ease-in-out w-full ${user && isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
          <div className="p-3 sm:p-6 md:p-8 lg:p-12 min-h-[calc(100vh-160px)]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Buyer Routes */}
              <Route path="/checkout" element={
                <ProtectedRoute allowedRole="buyer"><Checkout /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              }/>
              <Route path="/my-orders" element={
                <ProtectedRoute allowedRole="buyer"><MyOrders /></ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute allowedRole="admin"><AdminOrders /></ProtectedRoute>
              } />
              <Route path="/admin/add-product" element={
                <ProtectedRoute allowedRole="admin"><ProductManagement /></ProtectedRoute>
              } />
              <Route path="/admin/edit-product/:id" element={
                <ProtectedRoute allowedRole="admin"><ProductManagement /></ProtectedRoute>
              } />
            </Routes>
          </div>
          
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default App;