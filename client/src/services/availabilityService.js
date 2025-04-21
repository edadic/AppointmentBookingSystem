import axios from 'axios';

const API_URL = 'http://localhost:5001/api/availability';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getAvailability = async (storeId) => {
  try {
    const response = await axiosInstance.get(`/store/${storeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch availability' };
  }
};

export const setAvailability = async (storeId, availabilities) => {
  try {
    const response = await axiosInstance.post('/', { store_id: storeId, availabilities });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to set availability' };
  }
};