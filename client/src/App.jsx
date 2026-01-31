import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Pages
import Dashboard from './components/Dashboard'; 
// Make sure you have this component imported if you have the customer page created
import OrderPage from './pages/OrderPage'; 

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        
        {/* 1. ROOT PATH -> DIRECTLY TO DASHBOARD (For You) */}
        <Route path="/" element={<Dashboard />} />

        {/* 2. DASHBOARD ROUTE (Optional, in case you type /dashboard) */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}

        {/* 3. CUSTOMER ORDER ROUTE (The link you send them) */}
        {/* Ensure this matches the file name of your customer view */}
        <Route path="/order/:id" element={<OrderPage />} />

      </Routes>
    </Router>
  );
}

export default App;