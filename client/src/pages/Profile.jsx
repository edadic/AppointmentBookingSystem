import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';
import { FiUser, FiMail, FiBriefcase, FiEdit2, FiCalendar, FiCamera } from 'react-icons/fi';

const API_URL = 'http://localhost:5001/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({
        full_name: response.data.full_name,
        email: response.data.email
      });
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch user data');
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
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/users/update`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser({ ...user, ...formData });
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleViewAppointments = () => {
    if (user.is_store_owner) {
      navigate('/store-dashboard');
    } else {
      navigate('/appointments');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <p className="text-gray-600">Unable to load user profile. Please try again later.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg p-8 text-white mb-8">
            <h1 className="text-4xl font-extrabold">My Profile</h1>
            <p className="mt-2 text-blue-100">Manage your personal information and preferences</p>
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

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {!isEditing ? (
              <div className="p-8">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiUser className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="profile-image" 
                      className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      <FiCamera className="w-5 h-5 text-white" />
                    </label>
                    <input
                      type="file"
                      id="profile-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mt-4">{user.full_name}</h2>
                  <p className="text-gray-500">{user.is_store_owner ? 'Store Owner' : 'Regular User'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <FiUser className="h-6 w-6 text-blue-500 mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{user.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <FiMail className="h-6 w-6 text-blue-500 mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <FiBriefcase className="h-6 w-6 text-blue-500 mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Account Type</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {user.is_store_owner ? 'Store Owner' : 'Regular User'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FiEdit2 className="mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleViewAppointments}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <FiCalendar className="mr-2" />
                    {user.is_store_owner ? 'View Store Appointments' : 'View My Appointments'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiUser className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="profile-image-edit" 
                      className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      <FiCamera className="w-5 h-5 text-white" />
                    </label>
                    <input
                      type="file"
                      id="profile-image-edit"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;