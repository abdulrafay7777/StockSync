import axios from 'axios';

const instance = axios.create({
  // baseURL: '/api'
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // baseURL: 'http://localhost:5000/api', // Change for production

});

export default instance;