import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login           from './pages/Login';
import MenuPage        from './pages/customer/MenuPage';
import CartPage        from './pages/customer/CartPage';
import OrderStatusPage from './pages/customer/OrderStatusPage';
import AdminDashboard  from './pages/admin/AdminDashboard';
import TablesManager   from './pages/admin/TablesManager';
import MenuManager     from './pages/admin/MenuManager';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public - Customer */}
        <Route path="/menu"         element={<MenuPage />} />
        <Route path="/cart"         element={<CartPage />} />
        <Route path="/order-status" element={<OrderStatusPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin Protected */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/tables" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TablesManager />
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MenuManager />
          </ProtectedRoute>
        } />

        {/* Kitchen Protected */}
        <Route path="/kitchen" element={
          <ProtectedRoute allowedRoles={['admin', 'kitchen']}>
            <KitchenDashboard />
          </ProtectedRoute>
        } />

        {/* Default */}
        <Route path="*" element={<Navigate to="/menu" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;