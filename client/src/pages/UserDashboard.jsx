import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../components/Navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const API_URL = 'http://localhost:5001/api';

const UserDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/appointments/my-appointments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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

  const handleEventClick = (clickInfo) => {
    const appointment = appointments.find(
      app => app.id === parseInt(clickInfo.event.id)
    );
    setSelectedAppointment(appointment);
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
  };

  const calendarEvents = appointments.map(appointment => ({
    id: appointment.id,
    title: `Appointment at ${appointment.Store?.name}`,
    start: appointment.appointment_time,
    end: new Date(new Date(appointment.appointment_time).getTime() + appointment.duration_minutes * 60000),
    backgroundColor: appointment.status === 'approved' ? '#10B981' : 
                    appointment.status === 'pending' ? '#F59E0B' : '#EF4444'
  }));

  if (isLoading) return (
    <>
      <Navigation />
      <div className="text-center mt-8">Loading...</div>
    </>
  );

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Appointments</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
          />
        </div>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full relative z-50">
              <h2 className="text-xl font-bold mb-4">Appointment Details</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">Store:</span> {selectedAppointment.Store?.name}</p>
                <p><span className="font-semibold">Date:</span> {new Date(selectedAppointment.appointment_time).toLocaleDateString()}</p>
                <p><span className="font-semibold">Time:</span> {new Date(selectedAppointment.appointment_time).toLocaleTimeString()}</p>
                <p><span className="font-semibold">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-white ${
                    selectedAppointment.status === 'approved' ? 'bg-green-500' :
                    selectedAppointment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {selectedAppointment.status}
                  </span>
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserDashboard;