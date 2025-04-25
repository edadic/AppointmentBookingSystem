import React, { useState, useEffect } from 'react';
import { getRecentAppointments } from '../services/notificationService';
import { jwtDecode } from 'jwt-decode';

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
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Recent Appointments</h2>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow ${
              notification.status === 'pending'
                ? 'bg-yellow-50 border-yellow-500'
                : notification.status === 'approved'
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            } border`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {isStoreOwner ? notification.User.full_name : notification.Store.name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(notification.appointment_time)}
                </p>
                <p className="text-sm mt-1">
                  Duration: {notification.duration_minutes} minutes
                </p>
              </div>
              <span
                className={`px-2 py-1 text-sm rounded-full ${
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
        ))}
        {notifications.length === 0 && (
          <p className="text-center text-gray-500">No recent appointments</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;