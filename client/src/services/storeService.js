import axios from 'axios';

const API_URL = 'http://localhost:5001/api/stores';

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

export const createStore = async (storeData) => {
  try {
    // Validate required fields
    if (!storeData.name || !storeData.address || !storeData.phone || !storeData.email) {
      throw new Error('All fields are required: Name, Address, Phone, and Email');
    }

    const mappedData = {
      name: storeData.name.trim(),
      location: storeData.address.trim(),
      contact_email: storeData.email.trim(),
      phone_number: storeData.phone.trim(),
      description: storeData.description?.trim() || ''
    };

    console.log('Mapped store data:', mappedData); // Debug log
    const response = await axiosInstance.post('/', mappedData);

    return response.data;
  } catch (error) {
    console.error('Store creation error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create store');
  }
};

export const updateStore = async (id, storeData) => {
  try {
    const mappedData = {
      name: storeData.name.trim(),
      location: storeData.address.trim(),
      contact_email: storeData.email.trim(),
      phone_number: storeData.phone.trim(),
      description: storeData.description?.trim() || ''
    };

    const response = await axiosInstance.put(`/${id}`, mappedData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update store' };
  }
};

export const getStore = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch store' };
  }
};

export const getStores = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch stores' };
  }
};

export const searchStores = async (params) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/search?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search stores' };
  }
};

export const deleteStore = async (id) => {
  try {
    await axiosInstance.delete(`/${id}`);
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete store' };
  }
};