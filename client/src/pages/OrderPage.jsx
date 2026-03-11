import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; 
import axios from '../api/axios';
import toast from 'react-hot-toast';
import Tesseract from 'tesseract.js'; 
import { Helmet } from 'react-helmet-async'; 
import { FaBox, FaCheckCircle, FaMoneyBillWave, FaSpinner, FaMagic, FaTimesCircle, FaUser, FaPhone, FaMapMarkerAlt, FaCreditCard, FaTruck, FaShieldAlt } from 'react-icons/fa';

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

    if (customerName.trim().length < 3) return toast.error("name should be more than 3 char");
    if (!/^03\d{9}$/.test(phone)) return toast.error("11 numbers starting from 03");
    if (address.trim().length < 10) return toast.error("address invalid");
    if (paymentMethod === 'ONLINE' && scanResult !== 'success') return toast.error("Please verify payment first.");

    const loadingToast = toast.loading("Placing Order...");
    try {
      const orderData = {
        productId: id, 
        customerName, 
        phone, 
        address, 
        paymentMethod, 
        quantity: Number(quantity),
      };

      if (paymentMethod === 'ONLINE') {
        orderData.screenshotUrl = "OCR_AMOUNT_MATCHED";
      }

      await axios.post('/orders', orderData);
      
      toast.success("Order Placed!", { id: loadingToast });
      setOrderSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to place order";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-400 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Checkout...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;

  if (orderSuccess) return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 text-center overflow-x-hidden font-sans relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400/20 rounded-full blur-[100px]"></div>
      </div>
      <div className="bg-white p-10 sm:p-14 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] max-w-lg w-full animate-fade-in border border-gray-100/50 mx-auto relative z-10">
        <div className="bg-gradient-to-br from-green-400 to-green-500 p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/30">
          <FaCheckCircle className="text-5xl text-white" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">Order Secured!</h2>
        <p className="text-slate-500 mb-10 text-base leading-relaxed">
          Awesome, <span className="font-bold text-slate-800">{customerName}</span>. Your order is confirmed and is now being processed by our team.
        </p>
        <button onClick={() => window.location.reload()} className="bg-slate-900 text-white font-bold hover:bg-slate-800 px-6 py-4 rounded-2xl transition-all w-full shadow-lg shadow-slate-900/20 active:scale-[0.98]">
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#F8FAFC] py-6 sm:py-12 px-3 sm:px-4 flex items-start justify-center font-sans">
      
      <div className="w-full max-w-[38rem] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative">
        <Helmet>
          <title>{product ? `Secure Checkout | ${product.title}` : 'Loading Order...'}</title>
        </Helmet>
        
        {/* PREMIUM HERO HEADER */}
        <div className="bg-slate-900 p-8 sm:p-10 text-white relative overflow-hidden">
          {/* Abstract Glow Effect */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-indigo-500 rounded-full blur-[80px] opacity-40 pointer-events-none"></div>
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-4">
               <span className="bg-white/10 text-indigo-200 backdrop-blur-md font-bold text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-lg border border-white/10">Secure Checkout</span>
               {product.stock.available < 5 && (
                 <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-200 backdrop-blur-md text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-500/20">
                   <FaBox size={10} /> {product.stock.available} Left in Stock
                 </span>
               )}
             </div>
             
             <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-6">{product.title}</h1>
             
             {/* Order Summary Embedded in Header */}
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
                <div>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Amount</p>
                   <p className="text-2xl sm:text-3xl font-black text-white">PKR {product.price * quantity}</p>
                </div>
                
                {/* Sleek Quantity Selector */}
                <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
                   <button type="button" className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white hover:bg-white/10 transition-colors active:scale-95" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                   <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                   <button type="button" className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white hover:bg-white/10 transition-colors active:scale-95" onClick={() => setQuantity(Math.min(product.stock.available, quantity + 1))}>+</button>
                </div>
             </div>
          </div>
        </div>

        {/* MAIN CHECKOUT FORM */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
          
          {/* CUSTOMER DETAILS */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">1</div>
              <h3 className="text-lg font-bold text-slate-800">Shipping Details</h3>
            </div>
            
            <div className="space-y-4">
              {/* Input Group */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input type="text" className="w-full text-base pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm text-slate-800 placeholder-slate-400 font-medium" placeholder="Full Legal Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>

              {/* Input Group */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaPhone className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input type="tel" className="w-full text-base pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm text-slate-800 placeholder-slate-400 font-medium" placeholder="Phone Number (03XXXXXXXXX)" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              {/* Input Group */}
              <div className="relative group">
                <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                  <FaMapMarkerAlt className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <textarea className="w-full text-base pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm text-slate-800 placeholder-slate-400 font-medium h-28 resize-none" placeholder="Complete Delivery Address" value={address} onChange={e => setAddress(e.target.value)}></textarea>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100"></div>

          {/* PAYMENT METHOD */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">2</div>
              <h3 className="text-lg font-bold text-slate-800">Payment Method</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => setPaymentMethod('COD')} className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center gap-3 text-center ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                <div className={`p-3 rounded-full ${paymentMethod === 'COD' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                  <FaTruck className="text-xl sm:text-2xl" />
                </div>
                <span className={`font-bold text-sm ${paymentMethod === 'COD' ? 'text-indigo-900' : 'text-slate-500'}`}>Cash on Delivery</span>
                {paymentMethod === 'COD' && <div className="absolute top-3 right-3 text-indigo-600"><FaCheckCircle size={18} /></div>}
              </div>
              
              <div onClick={() => setPaymentMethod('ONLINE')} className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center gap-3 text-center ${paymentMethod === 'ONLINE' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                <div className={`p-3 rounded-full ${paymentMethod === 'ONLINE' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                  <FaCreditCard className="text-xl sm:text-2xl" />
                </div>
                <span className={`font-bold text-sm ${paymentMethod === 'ONLINE' ? 'text-indigo-900' : 'text-slate-500'}`}>Online Transfer</span>
                {paymentMethod === 'ONLINE' && <div className="absolute top-3 right-3 text-indigo-600"><FaCheckCircle size={18} /></div>}
              </div>
            </div>
          </div>

          {/* SMART OCR PAYMENT UPLOAD */}
          {paymentMethod === 'ONLINE' && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 animate-fade-in-up">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <FaMoneyBillWave className="text-indigo-600" /> Transfer Details
                </h4>
              </div>
              
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Please transfer exactly <strong className="text-slate-900 font-black bg-slate-200/50 px-1 rounded">PKR {product.price * quantity}</strong> to our account:
                <br/>
                <div className="mt-3 flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="font-mono text-slate-900 font-bold tracking-wide break-all">
                    {ADMIN_BANK_NAME}: {ADMIN_ACCOUNT_NUM}
                  </span>
                </div>
              </p>

              {/* Advanced Dropzone Style */}
              <div className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-300 h-40 flex items-center justify-center cursor-pointer group ${isScanning ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                
                {isScanning ? (
                  <div className="flex flex-col items-center text-indigo-600 px-4 text-center">
                    <FaSpinner className="animate-spin text-3xl mb-3" />
                    <span className="text-sm font-bold tracking-wide">AI is analyzing receipt...</span>
                  </div>
                ) : !preview ? (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors px-4 text-center">
                    <div className="bg-slate-50 group-hover:bg-indigo-100 p-3 rounded-full mb-3 transition-colors">
                      <FaMagic className="text-2xl" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Upload Payment Screenshot</span>
                    <span className="text-xs font-medium mt-1 text-slate-400">Tap to browse files</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 p-2">
                    <img src={preview} alt="Receipt" className="h-full w-full object-cover rounded-xl opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="bg-slate-900/80 text-white px-4 py-2 rounded-lg text-xs font-bold backdrop-blur-sm">Tap to change</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Intelligent Verification Feedback */}
              {scanResult === 'success' && (
                <div className="mt-4 bg-emerald-50 text-emerald-700 px-4 py-3.5 rounded-xl flex items-center gap-3 text-sm font-bold border border-emerald-200/50 shadow-sm animate-fade-in">
                  <FaCheckCircle className="text-lg flex-shrink-0 text-emerald-500" /> Receipt Analyzed & Amount Verified
                </div>
              )}
              {scanResult === 'fail' && !isScanning && (
                <div className="mt-4 bg-red-50 text-red-600 px-4 py-3.5 rounded-xl flex items-start gap-3 text-sm font-bold border border-red-200/50 shadow-sm animate-fade-in">
                  <FaTimesCircle className="text-lg flex-shrink-0 text-red-500 mt-0.5" /> 
                  <div className="flex flex-col">
                    <span>Verification Failed</span>
                    <span className="font-medium text-xs opacity-80 mt-1 leading-tight">System could not detect the exact amount or bank. Please upload a clearer screenshot.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FIXED BOTTOM ACTION */}
          <div className="pt-4">
            <button type="submit" disabled={product.stock.available === 0 || isScanning} className={`w-full py-4 sm:py-5 rounded-2xl font-extrabold text-lg sm:text-xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] ${
              (product.stock.available > 0 && (!isScanning)) 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-[0_12px_25px_-6px_rgba(79,70,229,0.5)] hover:-translate-y-1' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
            }`}>
              {isScanning ? "Verifying..." : (product.stock.available > 0 ? `Pay PKR ${product.price * quantity}` : "Out of Stock")}
            </button>
            <div className="flex items-center justify-center gap-2 mt-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <FaShieldAlt className="text-slate-300" size={14}/> 
              <span>256-bit Encrypted Checkout</span>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default OrderPage;