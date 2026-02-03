import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  // baseURL: 'http://localhost:5000/api', 

});

export default instance;