import React, { useState, useEffect } from 'react';
import { getStores, createStore, updateStore, deleteStore } from '../services/storeService';
import { getAvailability, setAvailability } from '../services/availabilityService';

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

  if (isLoading) return <div className="text-center mt-8">Loading...</div>;

  return (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-2">{store.name}</h3>
            <p className="text-gray-600 mb-2">{store.address}</p>
            <p className="text-gray-600 mb-2">{store.phone}</p>
            <p className="text-gray-600 mb-4">{store.description}</p>
            <button
              onClick={() => {
                setShowAvailabilityForm(true);
                fetchAvailability(store.id);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Set Availability
            </button>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleEdit(store)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(store.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreDashboard;