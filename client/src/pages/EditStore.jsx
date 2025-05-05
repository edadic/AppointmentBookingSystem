import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { getStore, updateStore } from '../services/storeService';
import { FiSave, FiX, FiBox, FiMapPin, FiPhone, FiMail, FiFileText } from 'react-icons/fi';

const EditStore = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStoreData();
  }, [storeId]);

  const fetchStoreData = async () => {
    try {
      const store = await getStore(storeId);
      setFormData({
        name: store.name,
        address: store.location,
        phone: store.phone_number,
        email: store.contact_email,
        description: store.description || ''
      });
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch store data');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await updateStore(storeId, formData);
      navigate('/store-settings');
    } catch (err) {
      setError(err.message || 'Failed to update store');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="text-center mt-8">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg p-8 text-white mb-8">
            <h1 className="text-4xl font-extrabold">Edit Store</h1>
            <p className="mt-2 text-blue-100">Update your store information</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 flex items-center border-l-4 border-red-500">
              <FiX className="h-6 w-6 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name
                    </label>
                    <div className="relative">
                      <FiBox className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 w-full border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="pl-10 w-full border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 w-full border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 w-full border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <div className="relative">
                      <FiFileText className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="pl-10 w-full border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                        rows="4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/store-settings')}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <FiX className="mr-2 -ml-1 h-5 w-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <FiSave className="mr-2 -ml-1 h-5 w-5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditStore;