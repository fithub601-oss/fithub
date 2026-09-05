import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Subscriptions from './pages/Subscriptions';
import Checkout from './pages/Checkout';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembers from './pages/admin/AdminMembers';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBanners from './pages/admin/AdminBanners';
import AdminPayments from './pages/admin/AdminPayments';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminProtected from './components/AdminProtected';

const PublicLayout = () => (
  <>
    <Navbar />
    <main className="flex-grow">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </main>
    <Footer />
  </>
);

const AdminLayout = () => (
  <AdminProtected>
    <Navbar />
    <main className="flex-grow">
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="*" element={<AdminDashboard />} />
      </Routes>
    </main>
    <Footer />
  </AdminProtected>
);

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-dark-900">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      />
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
    </div>
  );
}

export default App;
