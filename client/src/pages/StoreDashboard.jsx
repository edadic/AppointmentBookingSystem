import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { getStores } from '../services/storeService';
import { getStoreAppointments, updateAppointmentStatus } from '../services/appointmentService';

const StoreDashboard = () => {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [storeAppointments, setStoreAppointments] = useState({});
  const [expandedStores, setExpandedStores] = useState({});

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const data = await getStores();
      setStores(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const fetchAvailability = async (storeId) => {
    try {
      const data = await getAvailability(storeId);
      setAvailabilityData(data.length > 0 ? data : [{ weekday: '', start_time: '', end_time: '' }]);
      setSelectedStoreId(storeId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddTimeSlot = () => {
    setAvailabilityData([
      ...availabilityData,
      { weekday: '', start_time: '', end_time: '' }
    ]);
  };

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...availabilityData];
    newAvailability[index] = {
      ...newAvailability[index],
      [field]: value
    };
    setAvailabilityData(newAvailability);
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    try {
      await setAvailability(selectedStoreId, availabilityData);
      setShowAvailabilityForm(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingStore) {
        await updateStore(editingStore.id, formData);
      } else {
        const result = await createStore(formData);
        if (!result) {
          throw new Error('No response from server');
        }
      }
      await fetchStores();
      setShowForm(false);
      setEditingStore(null);
      setFormData({ 
        name: '', 
        address: '', 
        phone: '', 
        description: '',
        email: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to create store');
    }
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address,
      phone: store.phone,
      description: store.description,
      email: store.email || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await deleteStore(id);
        fetchStores();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const fetchStoreAppointments = async (storeId) => {
    try {
      const data = await getStoreAppointments(storeId);
      setStoreAppointments(prevAppointments => ({
        ...prevAppointments,
        [storeId]: data
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (storeId, appointmentId, status) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      // Refresh only the appointments for this specific store
      fetchStoreAppointments(storeId);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleStoreExpansion = async (storeId) => {
    setExpandedStores(prev => ({
      ...prev,
      [storeId]: !prev[storeId]
    }));
    
    // Fetch appointments if not already loaded
    if (!storeAppointments[storeId]) {
      await fetchStoreAppointments(storeId);
    }
  };

  if (isLoading) return (
    <>
      <Navigation />
      <div className="text-center mt-8">Loading...</div>
    </>
  );

  const handleStoreClick = async (storeId) => {
    try {
      setActiveTab(storeId);
      if (!storeAppointments[storeId]) {
        const appointments = await getStoreAppointments(storeId);
        setStoreAppointments(prev => ({
          ...prev,
          [storeId]: appointments
        }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Store Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">{store.name}</h2>
                <button
                  onClick={() => toggleStoreExpansion(store.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {expandedStores[store.id] ? 'Hide Appointments' : 'Show Appointments'}
                </button>
              </div>

              {expandedStores[store.id] && (
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>
                  {storeAppointments[store.id]?.length > 0 ? (
                    <div className="space-y-4">
                      {storeAppointments[store.id].map((appointment) => (
                        <div key={appointment.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{appointment.User?.full_name}</p>
                              <p className="text-gray-600">
                                Date: {new Date(appointment.appointment_time).toLocaleDateString()}
                              </p>
                              <p className="text-gray-600">
                                Time: {new Date(appointment.appointment_time).toLocaleTimeString()}
                              </p>
                              <p className="text-gray-600">
                                Status: <span className={`font-semibold ${
                                  appointment.status === 'pending' ? 'text-yellow-600' :
                                  appointment.status === 'approved' ? 'text-green-600' :
                                  'text-red-600'
                                }`}>{appointment.status}</span>
                              </p>
                            </div>
                            {appointment.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(store.id, appointment.id, 'approved')}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(store.id, appointment.id, 'rejected')}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center">No upcoming appointments.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default StoreDashboard;