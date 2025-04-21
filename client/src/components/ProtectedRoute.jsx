import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.isStoreOwner ? 'store_owner' : 'user';
    } catch (error) {
      return null;
    }
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = getUserRole();
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 'store_owner' ? '/store-dashboard' : '/user-dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;