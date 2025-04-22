import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import StoreDashboard from './pages/StoreDashboard';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

function App() {
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
      </Routes>
    </Router>
  );
}

export default App;
