import React, { useState, useEffect } from 'react';
import { getRecentAppointments } from '../services/notificationService';
import { jwtDecode } from 'jwt-decode';
import { FiClock, FiUser, FiMapPin } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStoreOwner, setIsStoreOwner] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setIsStoreOwner(decoded.isStoreOwner);
    }

    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getRecentAppointments();
      setNotifications(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg p-8 text-white mb-8">
        <h1 className="text-3xl font-extrabold">Recent Appointments</h1>
        <p className="mt-2 text-blue-100">Track and manage your appointment history</p>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FiUser className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {isStoreOwner ? notification.User.full_name : notification.Store.name}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <FiClock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm">{formatDateTime(notification.appointment_time)}</p>
                      <p className="text-sm">Duration: {notification.duration_minutes} minutes</p>
                    </div>
                  </div>

                  {!isStoreOwner && (
                    <div className="flex items-center space-x-3 text-gray-600">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <FiMapPin className="h-5 w-5 text-gray-600" />
                      </div>
                      <p className="text-sm">{notification.Store.location}</p>
                    </div>
                  )}
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    notification.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : notification.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {notifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              <FiClock className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No appointments yet</h3>
            <p className="mt-2 text-sm text-gray-500">When you make appointments, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;