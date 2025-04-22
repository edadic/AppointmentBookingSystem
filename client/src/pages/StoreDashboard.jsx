import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { getStores, createStore, updateStore, deleteStore } from '../services/storeService';
import { getAvailability, setAvailability } from '../services/availabilityService';
import { getStoreAppointments, updateAppointmentStatus } from '../services/appointmentService';

const StoreDashboard = () => {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    email: ''
  });
  const [availabilityData, setAvailabilityData] = useState([]);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [storeAppointments, setStoreAppointments] = useState({});
  const [expandedStores, setExpandedStores] = useState({});
  const [activeTab, setActiveTab] = useState(null);

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

  const toggleStoreExpansion = (storeId) => {
    setExpandedStores(prev => ({
      ...prev,
      [storeId]: !prev[storeId]
    }));
    
    // Fetch appointments if not already loaded
    if (!storeAppointments[storeId]) {
      fetchStoreAppointments(storeId);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Stores</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingStore(null);
              setFormData({ name: '', address: '', phone: '', description: '', email: '' });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add New Store
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingStore ? 'Edit Store' : 'Add New Store'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingStore ? 'Update Store' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        )}

        {showAvailabilityForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Set Availability</h2>
            <form onSubmit={handleAvailabilitySubmit}>
              {availabilityData.map((slot, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <select
                    value={slot.weekday}
                    onChange={(e) => handleAvailabilityChange(index, 'weekday', e.target.value)}
                    className="block w-full mb-2 p-2 border rounded"
                  >
                    <option value="">Select Day</option>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => handleAvailabilityChange(index, 'start_time', e.target.value)}
                      className="block w-full p-2 border rounded"
                    />
                    <input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => handleAvailabilityChange(index, 'end_time', e.target.value)}
                      className="block w-full p-2 border rounded"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddTimeSlot}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 mr-2"
              >
                Add Time Slot
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Availability
              </button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {stores.map((store) => (
            <div 
              key={store.id} 
              className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer ${
                activeTab === store.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleStoreClick(store.id)}
            >
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleStoreExpansion(store.id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{store.name}</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAvailabilityForm(true);
                        fetchAvailability(store.id);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Set Availability
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(store);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(store.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">{store.address}</p>
                <p className="text-gray-600">{store.phone}</p>
                <p className="text-gray-600 mt-2">{store.description}</p>
              </div>
              
              {expandedStores[store.id] && (
                <div className="border-t p-4 bg-gray-50">
                  <h4 className="font-semibold text-lg mb-3">Appointment Requests</h4>
                  {activeTab && storeAppointments[activeTab]?.length > 0 ? (
                    <div className="space-y-4">
                      {storeAppointments[activeTab].map(appointment => (
                        <div key={appointment.id} className="bg-white p-3 rounded shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{appointment.User?.full_name}</h5>
                              <p className="text-sm text-gray-600">{new Date(appointment.appointment_time).toLocaleString()}</p>
                              <p className="text-sm">Status: <span className={`font-medium ${
                                appointment.status === 'approved' ? 'text-green-600' : 
                                appointment.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                              }`}>{appointment.status}</span></p>
                            </div>
                            {appointment.status === 'pending' && (
                              <div className="space-x-2">
                                <button 
                                  onClick={() => handleStatusUpdate(store.id, appointment.id, 'approved')}
                                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(store.id, appointment.id, 'rejected')}
                                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
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
                    <p>No appointments for this store.</p>
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