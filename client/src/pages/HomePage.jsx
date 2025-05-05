import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { FiSearch, FiMapPin, FiFilter, FiGrid, FiList } from 'react-icons/fi'; // Import icons
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    available: false,
    sort: 'name_asc'
  });

  useEffect(() => {
    fetchStores();
  }, [filters]); // Now depends on filters

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      // Update to use search endpoint with filters
      const response = await axios.get(`${API_URL}/stores/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: filters
      });
      setStores(response.data.stores || []);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch stores');
      setIsLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Find Your Perfect Service
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Browse through our curated selection of professional services and book your appointment today.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search stores..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="pl-10 w-full border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={filters.available}
                onChange={(e) => handleFilterChange('available', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="available" className="text-gray-700">Show Available Only</label>
            </div>
          </div>
        </div>

        {/* View Toggle and Results Count */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Available Stores
            <span className="ml-2 text-sm text-gray-500">({stores.length} results)</span>
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Store Grid */}
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
          {stores.map(store => (
            <div key={store.id} 
              className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                viewMode === 'list' ? 'flex items-center' : ''
              }`}
            >
              <div className={`${viewMode === 'list' ? 'flex-1 p-6' : 'p-6'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{store.name}</h3>
                <p className="text-gray-600 mb-4">{store.description}</p>
                <div className="flex items-center text-gray-500 mb-4">
                  <FiMapPin className="w-4 h-4 mr-2" />
                  <span>{store.location}</span>
                </div>
                {store.has_availability && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                )}
                <button
                  onClick={() => navigate(`/book/${store.id}`)}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {stores.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FiFilter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;