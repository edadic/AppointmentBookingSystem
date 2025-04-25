import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import StoreDashboard from './pages/StoreDashboard';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import BookAppointment from './pages/BookAppointment';
import StoreSettings from './pages/StoreSettings';
import EditStore from './pages/EditStore'; 
import Profile from './pages/Profile';
import Notifications from './components/Notifications';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/store-dashboard"
          element={
            <ProtectedRoute allowedRoles={['store_owner']}>
              <StoreDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/store-settings"
          element={
            <ProtectedRoute allowedRoles={['store_owner']}>
              <StoreSettings />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/edit-store/:storeId"
          element={
            <ProtectedRoute allowedRoles={['store_owner']}>
              <EditStore />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/book/:storeId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['user', 'store_owner']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['user', 'store_owner']}>
              <Notifications />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
