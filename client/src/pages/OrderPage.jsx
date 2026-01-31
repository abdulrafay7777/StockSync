import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; 
import axios from '../api/axios';
import toast from 'react-hot-toast';
import Tesseract from 'tesseract.js'; 
import { Helmet } from 'react-helmet-async'; 
import { FaBox, FaCheckCircle, FaMoneyBillWave, FaSpinner, FaMagic, FaTimesCircle, FaUser, FaPhone, FaMapMarkerAlt, FaCreditCard, FaTruck } from 'react-icons/fa';

const OrderPage = () => {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form States
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [quantity, setQuantity] = useState(1);
  
  // Scanner State
  const [preview, setPreview] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); 
  const [scannedData, setScannedData] = useState({ foundAmount: false, foundAccount: false });
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Config
  const ADMIN_BANK_NAME = "Meezan";
  const ADMIN_ACCOUNT_NUM = "1234-5678"; 
  const ADMIN_ACCOUNT_DIGITS = "12345678"; 

  useEffect(() => {
    if (!id) { setError("No Product ID found."); setLoading(false); return; }
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (err) { setError("Product unavailable."); setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setScanResult(null); setIsScanning(true);
    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text.toLowerCase();
      const cleanDigits = text.replace(/[^0-9]/g, '');
      const totalAmount = product.price * quantity;
      
      const hasAmount = text.includes(totalAmount) || cleanDigits.includes(totalAmount.toString());
      const hasAccountMatch = text.includes(ADMIN_BANK_NAME.toLowerCase()) || cleanDigits.includes(ADMIN_ACCOUNT_DIGITS);
      
      setScannedData({ foundAmount: hasAmount, foundAccount: hasAccountMatch });
      if (hasAmount && hasAccountMatch) { setScanResult('success'); toast.success("Receipt Verified!"); } 
      else { setScanResult('fail'); toast.error("Verification Failed. Check Amount/Bank."); }
    } catch (err) { toast.error("Scan Error"); setScanResult('fail'); } 
    finally { setIsScanning(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- UPDATED VALIDATION LOGIC ---
    
    // 1. Name Check
    if (customerName.trim().length < 3) {
      return toast.error("name should be more than 3 char");
    }

    // 2. Phone Check (11 digits starting with 03)
    const phoneRegex = /^03\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return toast.error("11 numbers starting from 03");
    }

    // 3. Address Check (Basic length)
    if (address.trim().length < 10) {
      return toast.error("address invalid");
    }

    // 4. Online Payment Check
    if (paymentMethod === 'ONLINE' && scanResult !== 'success') {
      return toast.error("Please verify payment first.");
    }
    // --------------------------------

    const loadingToast = toast.loading("Placing Order...");
    try {
      await axios.post('/orders', {
        productId: id, 
        customerName, 
        phone, 
        address, 
        paymentMethod, 
        quantity: Number(quantity),
      });

      if (paymentMethod === 'ONLINE') {
        orderData.screenshotUrl = "OCR_AMOUNT_MATCHED";
}
      
      toast.success("Order Placed!", { id: loadingToast });
      setOrderSuccess(true);
    } catch (err) {
      // Handles Backend Joi Errors (like link/URL detection)
      const errorMessage = err.response?.data?.message || "Failed to place order";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium">Loading Product...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;

  if (orderSuccess) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6 text-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full animate-fade-in border border-green-100">
        <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6"><FaCheckCircle className="text-4xl text-green-600" /></div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
        <p className="text-gray-500 mb-6">Thanks, {customerName}. We'll contact you soon.</p>
        <button onClick={() => window.location.reload()} className="text-blue-600 font-bold hover:bg-blue-50 px-6 py-2 rounded-full transition">Place Another Order</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <div className="bg-white max-w-xl w-full rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <Helmet>
        <title>{product ? `Checkout: ${product.title}` : 'Loading Order...'}</title>
      </Helmet>
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white relative overflow-hidden">
          <FaBox className="absolute -right-6 -top-6 text-9xl opacity-10 rotate-12" />
          <div className="relative z-10 text-center">
             <h1 className="text-3xl font-bold tracking-tight mb-2">{product.title}</h1>
             <p className="text-blue-100 text-lg font-medium">PKR {product.price}</p>
             {product.stock.available < 5 && <span className="inline-block bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full mt-3 shadow-sm">Low Stock: {product.stock.available} Left</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</h3>
            
            <div className="relative group">
              <FaUser className="absolute top-4 left-4 text-gray-400 group-focus-within:text-blue-500 transition" />
              <input type="text" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition font-medium text-gray-700" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>

            <div className="relative group">
              <FaPhone className="absolute top-4 left-4 text-gray-400 group-focus-within:text-blue-500 transition" />
              <input type="tel" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition font-medium text-gray-700" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="relative group">
              <FaMapMarkerAlt className="absolute top-4 left-4 text-gray-400 group-focus-within:text-blue-500 transition" />
              <textarea className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition font-medium text-gray-700 h-24 resize-none" placeholder="Delivery Address" value={address} onChange={e => setAddress(e.target.value)}></textarea>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Order Summary</h3>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
               <div>
                  <span className="text-xs text-gray-500 font-bold uppercase">Total Bill</span>
                  <div className="text-2xl font-bold text-gray-800">PKR {product.price * quantity}</div>
               </div>
               <div className="flex items-center gap-2">
                  <button type="button" className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                  <button type="button" className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100" onClick={() => setQuantity(Math.min(product.stock.available, quantity + 1))}>+</button>
               </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => setPaymentMethod('COD')} className={`cursor-pointer p-4 rounded-xl border-2 transition relative flex flex-col items-center gap-2 ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200'}`}>
                <FaTruck className="text-2xl" /><span className="font-bold text-sm">Cash on Delivery</span>
                {paymentMethod === 'COD' && <div className="absolute top-2 right-2 text-blue-600"><FaCheckCircle /></div>}
              </div>
              <div onClick={() => setPaymentMethod('ONLINE')} className={`cursor-pointer p-4 rounded-xl border-2 transition relative flex flex-col items-center gap-2 ${paymentMethod === 'ONLINE' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200'}`}>
                <FaCreditCard className="text-2xl" /><span className="font-bold text-sm">Online Transfer</span>
                {paymentMethod === 'ONLINE' && <div className="absolute top-2 right-2 text-blue-600"><FaCheckCircle /></div>}
              </div>
            </div>
          </div>

          {paymentMethod === 'ONLINE' && (
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 animate-fade-in-up">
              <div className="flex items-center gap-2 text-blue-800 font-bold border-b border-blue-200 pb-3 mb-3"><FaMoneyBillWave /> Transfer Instructions</div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Please transfer <strong className="text-gray-900">PKR {product.price * quantity}</strong> to:<br/><span className="font-mono bg-white px-2 py-1 rounded border border-blue-200 text-blue-600 inline-block mt-1 font-bold">{ADMIN_BANK_NAME}: {ADMIN_ACCOUNT_NUM}</span></p>
              <div className={`relative border-2 border-dashed rounded-xl overflow-hidden transition h-40 flex items-center justify-center cursor-pointer group ${isScanning ? 'border-blue-400 bg-blue-100' : 'border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50'}`}>
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                {isScanning ? (<div className="flex flex-col items-center text-blue-600"><FaSpinner className="animate-spin text-2xl mb-2" /><span className="text-sm font-bold">Verifying Receipt...</span></div>) : !preview ? (<div className="flex flex-col items-center text-blue-400 group-hover:text-blue-600"><FaMagic className="text-2xl mb-2" /><span className="text-sm font-bold">Tap to Scan Screenshot</span></div>) : (<img src={preview} alt="Receipt" className="h-full w-full object-contain opacity-50" />)}
              </div>
              {scanResult === 'success' && (<div className="mt-3 bg-green-100 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm"><FaCheckCircle className="text-lg" /> Payment Verified</div>)}
              {scanResult === 'fail' && !isScanning && (<div className="mt-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl flex flex-col gap-1 text-xs font-bold border border-red-100"><div className="flex items-center gap-2"><FaTimesCircle /> Verification Failed</div><span className="font-normal opacity-80">Make sure Amount & Bank Name are valid.</span></div>)}
            </div>
          )}

          <button type="submit" disabled={product.stock.available === 0 || isScanning} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition transform active:scale-95 ${(product.stock.available > 0 && (!isScanning)) ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {isScanning ? "Processing..." : (product.stock.available > 0 ? `Confirm Order • PKR ${product.price * quantity}` : "Out of Stock")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderPage;