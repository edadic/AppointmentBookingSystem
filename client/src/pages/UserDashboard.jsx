import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const UserDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/appointments/my-appointments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Make sure response.data exists and is an array
        setAppointments(response.data || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to fetch appointments');
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (isLoading) return <div className="text-center mt-8">Loading...</div>;

  if (error) {
    return (
      <div className="text-center mt-8 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Appointments</h1>
      
      <div className="grid gap-6">
        {appointments && appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">
                {appointment.Store?.name || 'Unknown Store'}
              </h3>
              <p className="text-gray-600">
                Date: {new Date(appointment.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                Time: {appointment.time}
              </p>
              <p className="text-gray-600">
                Status: {appointment.status}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">No appointments found.</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;