import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiBell } from 'react-icons/bi';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const Navigation = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isStoreOwner = token ? JSON.parse(atob(token.split('.')[1])).isStoreOwner : false;
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      
      try {
        const response = await axios.get(
          `${API_URL}/appointments/recent`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [token]);

  const handleAppointmentAction = async (appointmentId, status) => {
    try {
      await axios.patch(
        `${API_URL}/appointments/${appointmentId}/status`,
        { status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Refresh notifications
      const response = await axios.get(
        `${API_URL}/appointments/recent`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setNotifications(response.data);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Appointments101</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {isStoreOwner ? (
              <>
                <Link
                  to="/store-dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/store-settings"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Store Settings
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Browse Stores
                </Link>
                <Link
                  to="/appointments"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Appointments
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
              </>
            )}

            {/* Notifications Bell Icon with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-full relative"
              >
                <BiBell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-700">
                      No new notifications
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-2 hover:bg-gray-100 border-b border-gray-200"
                        >
                          <div className="text-sm text-gray-700">
                            {isStoreOwner ? (
                              <>
                                <p className="font-medium">New appointment request</p>
                                <p>From: {notification.User?.full_name}</p>
                                <p>Date: {new Date(notification.appointment_time).toLocaleDateString()}</p>
                                <p>Time: {new Date(notification.appointment_time).toLocaleTimeString()}</p>
                                <div className="mt-2 flex space-x-2">
                                  <button
                                    onClick={() => handleAppointmentAction(notification.id, 'approved')}
                                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleAppointmentAction(notification.id, 'rejected')}
                                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="font-medium">Upcoming Appointment</p>
                                <p>Store: {notification.Store?.name}</p>
                                <p>Date: {new Date(notification.appointment_time).toLocaleDateString()}</p>
                                <p>Time: {new Date(notification.appointment_time).toLocaleTimeString()}</p>
                                <p>Status: {notification.status}</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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