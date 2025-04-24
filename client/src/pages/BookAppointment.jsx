import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
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
      <div className="text-center mt-8">Loading...</div>
    </>
  );

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {store && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {store.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {store.description}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {store.location}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {store.contact_email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {store.phone_number}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="px-4 py-5 sm:px-6">
              <h4 className="text-lg font-medium text-gray-900">Book an Appointment</h4>
              {error && (
                <div className="mt-2 text-sm text-red-600">
                  {error}
                </div>
              )}
              
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="mb-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
              </button>

              {showCalendar && (
                <div className="mb-6">
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

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Book Appointment
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookAppointment;