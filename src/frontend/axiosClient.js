// src/api/axiosClient.js (or src/utils/axiosClient.js)
import axios from 'axios';

// Define your base URL
// It's good practice to use environment variables for this.
// For development, you might hardcode it or use a .env file.
const BASE_URL = 'http://localhost:5000'; // Your backend API base URL

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // You can add other default headers here, like Authorization if you have a token
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
});

// Optional: Add request interceptors (e.g., for adding auth token dynamically)
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or wherever you store your token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptors (e.g., for handling global errors or token refresh)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Example: if (error.response && error.response.status === 401) { /* handle unauthorized */ }
    return Promise.reject(error);
  }
);

export default axiosClient;