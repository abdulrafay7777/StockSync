import React, { useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { FaBoxOpen, FaTimes, FaTag, FaDollarSign, FaLayerGroup } from 'react-icons/fa';

const AddProduct = ({ isOpen, onClose, onProductAdded }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(10);

  if (!isOpen) return null; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving...");
    
    try {
      await axios.post('/products', {
        title,
        price: Number(price),
        initialStock: Number(stock)
      });
      
      toast.success("Product Added!", { id: loadingToast });
      
      setTitle(''); setPrice(''); setStock(10);
      onProductAdded(); 
      onClose();        
      
    } catch (error) {
      toast.error("Failed to save.", { id: loadingToast });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaBoxOpen className="text-blue-600" /> Add Inventory
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <FaTimes size={28} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Product Name */}
          <div>
            {/* FIXED: Removed 'block', kept 'flex' */}
            <label className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">
              <FaTag className="text-blue-500" /> Product Name
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition text-lg bg-gray-50 focus:bg-white"
              placeholder="e.g. Red Hoodie"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              {/* FIXED: Removed 'block', kept 'flex' */}
              <label className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaDollarSign className="text-green-500" /> Price (PKR)
              </label>
              <input 
                type="number" 
                className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition text-lg bg-gray-50 focus:bg-white"
                placeholder="2500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              {/* FIXED: Removed 'block', kept 'flex' */}
              <label className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaLayerGroup className="text-purple-500" /> Stock
              </label>
              <input 
                type="number" 
                className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition text-lg bg-gray-50 focus:bg-white"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

            {/* Save Button */}
            <div className="pt-4">
            <button 
                type="submit" 
                className="w-full bg-green-600 text-white text-xl font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg hover:shadow-xl transition"
            >
                Save Product
            </button>
            </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;