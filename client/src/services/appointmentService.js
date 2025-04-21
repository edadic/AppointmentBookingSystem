import axios from 'axios';

const API_URL = 'http://localhost:5001/api/appointments';

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

export const getStoreAppointments = async (storeId) => {
  try {
    const response = await axiosInstance.get(`/store/${storeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch appointments' };
  }
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await axiosInstance.patch(`/${appointmentId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update appointment status' };
  }
};