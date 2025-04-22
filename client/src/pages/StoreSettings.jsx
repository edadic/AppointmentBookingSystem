import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { getStores, updateStore, deleteStore } from '../services/storeService';
import { getAvailability, setAvailability } from '../services/availabilityService';

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Store Settings</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
          </div>
        )}

        {showAvailabilityForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Set Store Availability</h3>
                <form onSubmit={handleAvailabilitySubmit}>
                  {availabilityData.map((availability, index) => (
                    <div key={index} className="mb-4 p-4 border rounded">
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">Day</label>
                        <select
                          value={availability.weekday}
                          onChange={(e) => handleAvailabilityChange(index, 'weekday', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select a day</option>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                          type="time"
                          value={availability.start_time}
                          onChange={(e) => handleAvailabilityChange(index, 'start_time', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input
                          type="time"
                          value={availability.end_time}
                          onChange={(e) => handleAvailabilityChange(index, 'end_time', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={handleAddTimeSlot}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Add Time Slot
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAvailabilityForm(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{store.name}</h2>
                  <p className="text-gray-600 mt-1">{store.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/edit-store/${store.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => fetchAvailability(store.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Set Availability
                  </button>
                  <button
                    onClick={() => handleDelete(store.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Location</h3>
                  <p className="text-gray-600">{store.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Contact</h3>
                  <p className="text-gray-600">{store.contact_email}</p>
                  <p className="text-gray-600">{store.phone_number}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default StoreSettings;