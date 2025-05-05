import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { getStores, createStore } from '../services/storeService';
import { getStoreAppointments, updateAppointmentStatus } from '../services/appointmentService';
import { FiPlus, FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const StoreDashboard = () => {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [storeAppointments, setStoreAppointments] = useState({});
  const [expandedStores, setExpandedStores] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    email: ''
  });
  const [editingStore, setEditingStore] = useState(null);

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg p-8 text-white mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-extrabold">Store Dashboard</h1>
                <p className="mt-2 text-blue-100">Manage your stores and appointments</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                <FiPlus className="mr-2" />
                Add New Store
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stores Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <div key={store.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{store.name}</h2>
                  <p className="text-gray-600 mb-4">{store.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      <span>{store.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="w-4 h-4 mr-2" />
                      <span>{store.phone_number}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiMail className="w-4 h-4 mr-2" />
                      <span>{store.contact_email}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col space-y-2">
                    <button
                      onClick={() => toggleStoreExpansion(store.id)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <FiCalendar className="mr-2" />
                      {expandedStores[store.id] ? 'Hide Appointments' : 'View Appointments'}
                    </button>
                  </div>
                </div>

                {/* Appointments Section */}
                {expandedStores[store.id] && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments</h3>
                    <div className="space-y-4">
                      {storeAppointments[store.id]?.map((appointment) => (
                        <div key={appointment.id} className="bg-white rounded-lg p-4 shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FiUser className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{appointment.User?.full_name}</p>
                                <p className="text-sm text-gray-500">{appointment.User?.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FiClock className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {new Date(appointment.appointment_time).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(appointment.appointment_time).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end space-x-2">
                            {appointment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(store.id, appointment.id, 'approved')}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(store.id, appointment.id, 'rejected')}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {appointment.status !== 'pending' && (
                              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                appointment.status === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!storeAppointments[store.id] || storeAppointments[store.id].length === 0) && (
                        <p className="text-center text-gray-500 py-4">No appointments found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Store Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingStore ? 'Edit Store' : 'Add New Store'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingStore(null);
                    setFormData({ name: '', address: '', phone: '', description: '', email: '' });
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {editingStore ? 'Save Changes' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointments Modal */}
      {Object.keys(expandedStores).some(id => expandedStores[id]) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Store Appointments</h2>
              <button
                onClick={() => setExpandedStores({})}
                className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(expandedStores).map(([storeId, isExpanded]) => 
                isExpanded && storeAppointments[storeId]?.map((appointment) => (
                  <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FiUser className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{appointment.User?.full_name}</p>
                          <p className="text-sm text-gray-500">{appointment.User?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FiClock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(appointment.appointment_time).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.appointment_time).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-auto">
                        {appointment.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(storeId, appointment.id, 'approved')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(storeId, appointment.id, 'rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            appointment.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {Object.entries(expandedStores).every(([storeId, isExpanded]) => 
                !isExpanded || !storeAppointments[storeId] || storeAppointments[storeId].length === 0
              ) && (
                <p className="text-center text-gray-500 py-4">No appointments found</p>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default StoreDashboard;