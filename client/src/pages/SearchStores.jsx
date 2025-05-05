import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { searchStores } from '../services/storeService';

const SearchStores = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    available: searchParams.get('available') === 'true',
    sort: searchParams.get('sort') || 'name_asc',
    page: parseInt(searchParams.get('page')) || 1
  });

  useEffect(() => {
    fetchStores();
  }, [filters]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const result = await searchStores(filters);
      setStores(result.stores);
      setTotalPages(result.pages);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value, page: 1 };
      setSearchParams(newFilters);
      return newFilters;
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => {
      const newFilters = { ...prev, page: newPage };
      setSearchParams(newFilters);
      return newFilters;
    });
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search stores..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="border rounded p-2"
            />
            
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="border rounded p-2"
            />
            
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="border rounded p-2"
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
            </select>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={filters.available}
                onChange={(e) => handleFilterChange('available', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="available">Show Available Only</label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map(store => (
                <div key={store.id} className="border rounded-lg p-4 shadow">
                  <h3 className="text-xl font-semibold mb-2">{store.name}</h3>
                  <p className="text-gray-600 mb-2">{store.description}</p>
                  <p className="text-gray-600 mb-4">{store.location}</p>
                  {store.has_availability && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Available
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`/book/${store.id}`)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded ${
                      filters.page === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SearchStores;