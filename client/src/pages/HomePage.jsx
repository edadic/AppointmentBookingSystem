import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/stores`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setStores(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch stores');
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (isLoading) return (
    <>
      <Navigation />
      <div className="text-center mt-8">Loading...</div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Stores</h1>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <div key={store.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{store.description}</p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">{store.address}</p>
                    <p className="text-sm text-gray-500">{store.phone}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate(`/book/${store.id}`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;