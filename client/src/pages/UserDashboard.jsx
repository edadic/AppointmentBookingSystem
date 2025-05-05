import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../components/Navigation';
import { FiCalendar, FiClock, FiMapPin, FiX, FiAlertCircle, FiGrid, FiList } from 'react-icons/fi';
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
  const [viewMode, setViewMode] = useState('grid');

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </>
  );

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Gradient */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            My Appointments
          </h1>
          <p className="mt-2 text-lg text-blue-100 max-w-2xl">
            Manage and view all your upcoming appointments in one place
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 flex items-center border-l-4 border-red-500">
            <FiAlertCircle className="h-6 w-6 text-red-400 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Calendar Card with Enhanced Styling */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Calendar View</h2>
            </div>
          </div>
          <div className="p-6">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={viewMode === 'grid' ? "dayGridMonth" : "listWeek"}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: viewMode === 'grid' ? 'dayGridMonth,timeGridWeek,timeGridDay' : 'listWeek,listMonth'
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              height="auto"
              themeSystem="standard"
              eventDisplay="block"
              dayMaxEvents={true}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
              }}
              // Replace the unsupported class props with proper FullCalendar props
              eventClassNames={(arg) => [
                'rounded-lg',
                'shadow-sm'
              ]}
              dayCellClassNames={(arg) => [
                'hover:bg-gray-50'
              ]}
              buttonText={{
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day',
                list: 'List'
              }}
            />
          </div>
        </div>

        {/* Enhanced Modal with Glassmorphism */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full relative transform transition-all">
              <div className="absolute right-4 top-4">
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                <div className="h-0.5 w-16 bg-blue-500 mt-3 rounded-full"></div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiMapPin className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Store</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedAppointment.Store?.name}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiCalendar className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(selectedAppointment.appointment_time).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiClock className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Time</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(selectedAppointment.appointment_time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`h-5 w-5 rounded-full mr-3 ${
                    selectedAppointment.status === 'approved' ? 'bg-green-500' :
                    selectedAppointment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Status</p>
                    <p className={`text-sm font-semibold ${
                      selectedAppointment.status === 'approved' ? 'text-green-600' :
                      selectedAppointment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
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