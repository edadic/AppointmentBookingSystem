import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isStoreOwner = token ? jwtDecode(token).isStoreOwner : false;

  // Don't show navigation on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Appointments101</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isStoreOwner ? (
              // Store Owner Navigation
              <>
                <button
                  onClick={() => navigate('/store-dashboard')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/store-appointments')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Store Appointments
                </button>
                <button
                  onClick={() => navigate('/store-settings')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Store Settings
                </button>
              </>
            ) : (
              // Regular User Navigation
              <>
                <button
                  onClick={() => navigate('/')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Browse Stores
                </button>
                <button
                  onClick={() => navigate('/appointments')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  My Appointments
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Profile
                </button>
              </>
            )}
            
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;