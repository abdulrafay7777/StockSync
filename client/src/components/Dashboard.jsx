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
      // Ensure we only set state if data is an array
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); // Fallback to empty array on error
    }
  };

  const copyOrderLink = (id) => {
    // Uses the current website URL instead of hardcoded localhost
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
    <div className="max-w-6xl mx-auto p-6 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaBoxOpen className="text-blue-600" /> Admin Dashboard
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-lg font-bold transform active:scale-95"
        >
          <FaPlusCircle size={20} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-bold text-gray-700 text-lg">Live Inventory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(products) && products.length > 0 ? (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-blue-50/50 transition">
                    <td className="p-4 font-bold text-gray-800">{p.title}</td>
                    <td className="p-4 text-gray-600 font-medium text-base">PKR {p.price}</td>
                    <td className="p-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                        p.stock?.available < 5 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {p.stock?.available || 0} Units Available
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-3">
                        <button 
                          onClick={() => copyOrderLink(p._id)} 
                          className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm font-bold text-xs transform active:scale-95"
                        >
                          <FaCopy size={16} /> Copy Link
                        </button>
                        <button 
                          onClick={() => handleDeleteTrigger(p._id)} 
                          className="flex items-center gap-2 bg-red-50 text-red-500 border border-red-200 px-4 py-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm font-bold text-xs transform active:scale-95"
                        >
                          <FaTrash size={16} /> Delete
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