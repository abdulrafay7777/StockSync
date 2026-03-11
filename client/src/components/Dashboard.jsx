import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import OrderList from './OrderList';
import toast from 'react-hot-toast'; 
import { 
  FaBoxOpen, FaPlusCircle, FaTrash, FaExclamationTriangle, FaCopy 
} from 'react-icons/fa'; 
import AddProduct from './AddProduct'; 

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); 
    }
  };

  const copyOrderLink = (id) => {
    const link = `${window.location.origin}/order/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link Copied!");
  };

  const confirmDelete = async (id, toastId) => {
    toast.dismiss(toastId); 
    try {
      await axios.delete(`/products/${id}`);
      toast.success("Product Deleted Successfully");
      fetchProducts(); 
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const handleDeleteTrigger = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-bold text-gray-800">
          <FaExclamationTriangle className="text-red-500" />
          Delete this product?
        </div>
        <p className="text-sm text-gray-500">This action cannot be undone.</p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm font-bold transition"
          >
            Cancel
          </button>
          <button 
            onClick={() => confirmDelete(id, t.id)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-bold transition shadow-sm"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#fff',
        color: '#333',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 w-full overflow-x-hidden">
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
          <FaBoxOpen className="text-blue-600" /> Admin Dashboard
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700 transition flex justify-center items-center gap-2 shadow-lg font-bold transform active:scale-95"
        >
          <FaPlusCircle size={20} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 w-full">
        <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-bold text-gray-700 text-base sm:text-lg">Live Inventory</h2>
        </div>
        
        {/* RESTORED SINGLE TABLE WITH COMPACT MOBILE SIZING */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
              <tr>
                <th className="p-2 sm:p-4">Product</th>
                <th className="p-2 sm:p-4 whitespace-nowrap">Price</th>
                <th className="p-2 sm:p-4 whitespace-nowrap">Status</th>
                <th className="p-2 sm:p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(products) && products.length > 0 ? (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-blue-50/50 transition">
                    <td className="p-2 sm:p-4 font-bold text-gray-800 break-words min-w-[80px]">
                      {p.title}
                    </td>
                    <td className="p-2 sm:p-4 text-gray-600 font-medium whitespace-nowrap">
                      PKR {p.price}
                    </td>
                    <td className="p-2 sm:p-4 align-middle whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide whitespace-nowrap ${
                        p.stock?.available < 5 
                          ? 'bg-red-50 text-red-600 border border-red-200' 
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {p.stock?.available || 0} <span className="hidden sm:inline ml-1">Units</span>
                      </span>
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="flex justify-center items-center gap-1.5 sm:gap-3">
                        
                        {/* COMPACT COPY BUTTON - ICON ONLY ON MOBILE */}
                        <button 
                          onClick={() => copyOrderLink(p._id)} 
                          className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 border border-indigo-200 p-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl active:bg-indigo-200 active:scale-95 transition-transform duration-100 shadow-sm font-bold text-xs select-none outline-none"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                          title="Copy Link"
                        >
                          <FaCopy size={14} className="sm:text-[16px]" /> 
                          <span className="hidden sm:inline">Copy Link</span>
                        </button>
                        
                        {/* COMPACT DELETE BUTTON - ICON ONLY ON MOBILE */}
                        <button 
                          onClick={() => handleDeleteTrigger(p._id)} 
                          className="flex items-center justify-center gap-2 bg-red-50 text-red-500 border border-red-200 p-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl active:bg-red-200 active:scale-95 transition-transform duration-100 shadow-sm font-bold text-xs select-none outline-none"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                          title="Delete Product"
                        >
                          <FaTrash size={14} className="sm:text-[16px]" /> 
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500 italic">
                    No products found. Add your first product above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <OrderList />
      
      <AddProduct 
        isOpen={isModalOpen}  
        onClose={() => setIsModalOpen(false)} 
        onProductAdded={fetchProducts} 
      />
      
    </div>
  );
};

export default Dashboard;