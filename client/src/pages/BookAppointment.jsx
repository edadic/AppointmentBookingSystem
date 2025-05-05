import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { FiMapPin, FiMail, FiPhone, FiCalendar, FiClock } from 'react-icons/fi';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const API_URL = 'http://localhost:5001/api';

const BookAppointment = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const [storeResponse, availabilityResponse, bookedSlotsResponse] = await Promise.all([
          axios.get(`${API_URL}/stores/${storeId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/availability/store/${storeId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/appointments/store/${storeId}/booked`) // New endpoint, no auth required
        ]);
        
        setStore(storeResponse.data);
        setAvailability(availabilityResponse.data);
        
        // Map booked slots to calendar events
        const events = bookedSlotsResponse.data.map(appointment => ({
          id: appointment.id,
          start: appointment.appointment_time,
          end: new Date(new Date(appointment.appointment_time).getTime() + appointment.duration_minutes * 60000),
          backgroundColor: appointment.status === 'approved' ? '#EF4444' : '#F59E0B',
          borderColor: appointment.status === 'approved' ? '#DC2626' : '#D97706',
          display: 'block',
          title: appointment.status === 'approved' ? 'Booked' : 'Pending'
        }));
        setBookedSlots(events);
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch store details');
        setIsLoading(false);
      }
    };

    fetchStoreDetails();
  }, [storeId]);

  useEffect(() => {
    if (availability.length > 0) {
      const slots = availability.map(slot => ({
        daysOfWeek: [getDayNumber(slot.weekday)],
        startTime: slot.start_time,
        endTime: slot.end_time,
        backgroundColor: '#10B981',
      }));
      setAvailableSlots(slots);
    }
  }, [availability]);

  const getDayNumber = (weekday) => {
    const days = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    return days[weekday];
  };

  const handleDateSelect = (selectInfo) => {
    const selectedDateTime = selectInfo.start;
    setSelectedDate(selectedDateTime.toISOString().split('T')[0]);
    setSelectedTime(selectedDateTime.toTimeString().slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const appointmentTime = `${selectedDate}T${selectedTime}`;
      
      await axios.post(`${API_URL}/appointments`, {
        store_id: storeId,
        appointment_time: appointmentTime,
        duration_minutes: 60
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      navigate('/appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    }
  };

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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {store && (
          <div className="space-y-8">
            {/* Store Information Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h1 className="text-2xl font-bold text-white">{store.name}</h1>
                <p className="text-blue-100 mt-1">{store.description}</p>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <FiMapPin className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-gray-900">{store.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FiMail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{store.contact_email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FiPhone className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{store.phone_number}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Section */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Book an Appointment</h2>
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <FiCalendar className="mr-2 -ml-1 h-5 w-5" />
                    {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {showCalendar && (
                  <div className="mb-8 rounded-lg border border-gray-200 overflow-hidden">
                    <FullCalendar
                      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                      initialView="timeGridWeek"
                      selectable={true}
                      selectMirror={true}
                      dayMaxEvents={true}
                      weekends={true}
                      businessHours={availableSlots}
                      selectConstraint="businessHours"
                      select={handleDateSelect}
                      headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek'
                      }}
                      height="auto"
                      slotMinTime="08:00:00"
                      slotMaxTime="21:00:00"
                      slotDuration="01:00:00"
                      allDaySlot={false}
                      slotLabelInterval="01:00"
                      selectOverlap={false}
                      slotEventOverlap={false}
                      displayEventTime={true}
                      nowIndicator={true}
                      expandRows={true}
                      selectMinDistance={1}
                      eventDisplay="block"
                      events={bookedSlots}
                      eventContent={(eventInfo) => ({
                        html: `<div class="text-xs font-semibold">${eventInfo.event.title}</div>`
                      })}
                    />
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <FiClock className="mr-2 h-4 w-4 text-gray-400" />
                        Time
                      </label>
                      <input
                        type="time"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Book Appointment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookAppointment;