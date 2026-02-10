import axios from 'axios';

const instance = axios.create({
  // baseURL: '/api',
  baseURL: import.meta.env.VITE_API_URL || "https://stock-sync-one.vercel.app",
  // baseURL: 'http://localhost:5000/api', 

});

export default instance;