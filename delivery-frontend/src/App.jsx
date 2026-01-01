import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Snowfall from 'react-snowfall';

// --- COMPOSANTS SECURITE ---
import ProtectedRoute from './components/ProtectedRoute';

// --- PAGES PUBLIQUES ---
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import TrackingPage from './pages/public/TrackingPage';

// --- PAGES CLIENT ---
import ClientLayout from './pages/client/ClientLayout';
import DashboardHome from './pages/client/DashboardHome';
import MyOrders from './pages/client/MyOrders';
import NewOrder from './pages/client/NewOrder';
import Settings from './pages/client/Settings';

// --- PAGES LIVREUR ---
import DriverLayout from './pages/driver/DriverLayout';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverDeliveries from './pages/driver/DriverDeliveries';
import DriverSettings from './pages/driver/DriverSettings';
import DriverHistory from './pages/driver/DriverHistory';

// --- PAGES ADMIN (NOUVEAU) ---
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <BrowserRouter>
    <Snowfall color="#82C3D9"/>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: '',
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
            fontSize: '14px',
            fontWeight: '600',
          },
          success: {
            style: {
              background: '#ECFDF5', // Vert très clair
              color: '#065F46', // Vert foncé
              border: '1px solid #A7F3D0',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#ECFDF5',
            },
          },
          error: {
            style: {
              background: '#FEF2F2', // Rouge très clair
              color: '#991B1B', // Rouge foncé
              border: '1px solid #FECACA',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FEF2F2',
            },
          },
        }}
      />
      <Routes>
        {/* ================= ROUTES PUBLIQUES ================= */}
        <Route path="/" element={<Landing />} />
        <Route path="/tracking/:trackingNumber" element={<TrackingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= ESPACE CLIENT ================= */}
        <Route 
          path="/client" 
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="orders/new" element={<NewOrder />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ================= ESPACE LIVREUR ================= */}
        <Route 
          path="/driver" 
          element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
               <DriverLayout />
            </ProtectedRoute>
          }
        >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DriverDashboard />} />
            <Route path="deliveries" element={<DriverDeliveries />} />
            <Route path="history" element={<DriverHistory />} />
            <Route path="settings" element={<DriverSettings />} />
        </Route>

        {/* ================= ESPACE ADMIN (AJOUTÉ) ================= */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
               <AdminLayout />
            </ProtectedRoute>
          }
        >
            <Route index element={<Navigate to="dashboard" replace />} />
            
            {/* Dashboard Global */}
            <Route path="dashboard" element={<AdminDashboard />} />
            
            {/* Gestion des Commandes & Assignation */}
            <Route path="orders" element={<AdminOrders />} />
            
            {/* Gestion des Livreurs */}
            <Route path="drivers" element={<AdminDrivers />} />
            
            {/* Gestion des Clients */}
            <Route path="customers" element={<AdminCustomers />} />
            
            {/* Gestion des Produits (Placeholder) */}
            <Route path="products" element={<AdminProducts />} />
            
            {/* Paramètres (Placeholder) */}
            <Route path="settings" element={<AdminSettings />} />

            <Route path="products" element={<AdminProducts />} />
            <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        {/* Route par défaut (404 ou redirection) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;