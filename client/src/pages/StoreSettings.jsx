import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { getStores, updateStore, deleteStore } from '../services/storeService';
import { getAvailability, setAvailability } from '../services/availabilityService';
import { FiEdit2, FiClock, FiTrash2, FiAlertCircle } from 'react-icons/fi';

const StoreSettings = () => {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  const [availabilityData, setAvailabilityData] = useState([]);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const fetchAvailability = async (storeId) => {
    try {
      const data = await getAvailability(storeId);
      setAvailabilityData(data.length > 0 ? data : [{ weekday: '', start_time: '', end_time: '' }]);
      setSelectedStoreId(storeId);
      setShowAvailabilityForm(true);
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

  if (isLoading) return (
    <>
      <Navigation />
      <div className="text-center mt-8">Loading...</div>
    </>
  );

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg p-8 text-white mb-8">
            <h1 className="text-4xl font-extrabold">Store Settings</h1>
            <p className="mt-2 text-blue-100">Manage your store information and availability</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 flex items-center border-l-4 border-red-500">
              <FiAlertCircle className="h-6 w-6 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {showAvailabilityForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Set Store Availability</h3>
                <form onSubmit={handleAvailabilitySubmit}>
                  {availabilityData.map((availability, index) => (
                    <div key={index} className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                          <select
                            value={availability.weekday}
                            onChange={(e) => handleAvailabilityChange(index, 'weekday', e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select a day</option>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                          <input
                            type="time"
                            value={availability.start_time}
                            onChange={(e) => handleAvailabilityChange(index, 'start_time', e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                          <input
                            type="time"
                            value={availability.end_time}
                            onChange={(e) => handleAvailabilityChange(index, 'end_time', e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleAddTimeSlot}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      <FiClock className="mr-2" />
                      Add Time Slot
                    </button>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAvailabilityForm(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
                      <p className="mt-2 text-gray-600">{store.description}</p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Location:</span> {store.location}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Phone:</span> {store.phone_number}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/edit-store/${store.id}`)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <FiEdit2 className="mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => fetchAvailability(store.id)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <FiClock className="mr-2" />
                        Set Hours
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        <FiTrash2 className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreSettings;