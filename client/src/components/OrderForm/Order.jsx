import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { FaExclamationTriangle } from 'react-icons/fa';

// Import our new Clean Components
import OrderSummary from './OrderSummary';
import ShippingForm from './ShippingForm';

const OrderForm = ({ productId }) => {
  // --- STATE MANAGEMENT ---
  const [product, setProduct] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '', phone: '', address: '', paymentMethod: 'COD'
  });

  // --- 1. FETCH PRODUCT ---
  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsFetching(true);
      if (!productId) { setIsFetching(false); return; }
      try {
        const { data } = await axios.get('/products');
        const found = data.find(p => String(p._id) === String(productId));
        setProduct(found || null);
      } catch (error) { console.error(error); } 
      finally { setIsFetching(false); }
    };
    fetchProductDetails();
  }, [productId]);

  // --- 2. HANDLERS ---
  const increaseQty = () => {
    if (product && quantity < product.stock.available) setQuantity(p => p + 1);
    else toast.error(`Max stock: ${product?.stock.available}`);
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(p => p - 1);
  };

  // --- 3. SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Validation Helper below

    // Gatekeeper for Online Payment
    if (formData.paymentMethod === 'ONLINE' && !file) {
      toast.error("Please upload a verified payment screenshot.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('productId', productId);
    data.append('customerName', formData.customerName);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('paymentMethod', formData.paymentMethod);
    data.append('quantity', quantity);
    if (file) data.append('screenshot', file);

    try {
      const response = await axios.post('/orders', data, { headers: { 'Content-Type': 'multipart/form-data' }});
      toast.success(`Order Placed! ID: ${response.data._id}`);
      setFormData({ customerName: '', phone: '', address: '', paymentMethod: 'COD' });
      setFile(null); setQuantity(1);
    } catch (error) {
      toast.error('Failed: ' + (error.response?.data?.message || 'Server Error'));
    } finally { setLoading(false); }
  };

  const validateForm = () => {
    // Keep your strict validation rules here
    const address = formData.address.trim();
    if (!/^03\d{9}$/.test(formData.phone)) { toast.error('Invalid Phone (03...)'); return false; }
    if (address.length < 15 || address.includes('http') || !address.includes(' ')) { toast.error('Invalid Address'); return false; }
    if (formData.customerName.length < 3) { toast.error('Name too short'); return false; }
    return true;
  };

  const totalPrice = product ? product.price * quantity : 0;

  // --- 4. CONDITIONAL RENDERING ---
  if (isFetching) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white shadow-lg rounded-xl border-t-4 border-red-500">
        <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4"/>
        <h2 className="text-xl font-bold">Product Not Found</h2>
      </div>
    </div>
  );

  // --- 5. CLEAN MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex justify-center items-center">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Component 1: The Receipt */}
        <OrderSummary 
          product={product} 
          quantity={quantity} 
          increaseQty={increaseQty} 
          decreaseQty={decreaseQty} 
          totalPrice={totalPrice} 
        />

        {/* Component 2: The Form */}
        <ShippingForm 
          formData={formData} 
          setFormData={setFormData} 
          handleSubmit={handleSubmit} 
          loading={loading} 
          totalPrice={totalPrice} 
          setFile={setFile} 
        />

      </div>
    </div>
  );
};

export default OrderForm;