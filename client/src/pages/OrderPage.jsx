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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-bold tracking-wide">Loading Product Details...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;

  if (orderSuccess) return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F4F7FF] p-4 sm:p-6 text-center overflow-x-hidden">
      <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] max-w-md w-full animate-fade-in border border-gray-100 mx-auto">
        <div className="bg-green-50 p-5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
          <FaCheckCircle className="text-5xl text-green-500" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed</h2>
        <p className="text-gray-500 mb-8 text-sm sm:text-base leading-relaxed">
          Thank you, <span className="font-bold text-gray-700">{customerName}</span>. Your order has been placed successfully and is being processed.
        </p>
        <button onClick={() => window.location.reload()} className="bg-gray-900 text-white font-bold hover:bg-gray-800 px-6 py-3.5 rounded-xl transition-all w-full shadow-md active:scale-95">
          Place Another Order
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#F8FAFC] py-6 sm:py-12 px-3 sm:px-4 flex items-start justify-center font-sans">
      <div className="bg-white max-w-[36rem] w-full rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 relative">
        <Helmet>
          <title>{product ? `Checkout: ${product.title}` : 'Loading Order...'}</title>
        </Helmet>
        
        {/* MODERN CLEAN HEADER */}
        <div className="p-6 sm:p-10 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 relative bg-white overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500 rounded-full opacity-[0.03] blur-2xl pointer-events-none"></div>
          <div className="z-10 relative w-full sm:w-auto">
             <div className="flex items-center gap-2 mb-2">
               <span className="bg-blue-50 text-blue-600 font-bold text-[10px] tracking-widest uppercase px-2 py-1 rounded-md border border-blue-100">Checkout</span>
               {product.stock.available < 5 && <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md border border-red-100"><FaBox size={10} /> {product.stock.available} Left</span>}
             </div>
             <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight break-words pr-4">{product.title}</h1>
          </div>
          <div className="bg-gray-50 border border-gray-100 px-5 py-3.5 rounded-2xl flex flex-col items-start sm:items-end shrink-0 w-full sm:w-auto z-10">
             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Amount</span>
             <span className="text-xl sm:text-2xl font-black text-gray-900 leading-none mt-1">PKR {product.price}</span>
          </div>
        </div>

        {/* MODERN SEPARATED FORM */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-10 space-y-8 sm:space-y-10">
          
          {/* SECTION 1: CUSTOMER DETAILS */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
              <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm">1</span>
              Customer Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1 uppercase tracking-wide">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input type="text" className="w-full min-w-0 text-sm sm:text-base pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-800 shadow-sm" placeholder="Enter your full name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1 uppercase tracking-wide">Phone Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input type="tel" className="w-full min-w-0 text-sm sm:text-base pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-800 shadow-sm" placeholder="03XX XXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1 uppercase tracking-wide">Delivery Address</label>
                <div className="relative group">
                  <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <textarea className="w-full min-w-0 text-sm sm:text-base pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-800 shadow-sm h-24 resize-none" placeholder="Complete street address" value={address} onChange={e => setAddress(e.target.value)}></textarea>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION 2: ORDER SUMMARY */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
              <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm">2</span>
              Order Summary
            </h3>
            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="text-center sm:text-left">
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total Payable</span>
                  <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">PKR {product.price * quantity}</div>
               </div>
               <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                  <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 transition-colors active:scale-95 bg-gray-50 border border-gray-100" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span className="font-bold text-base w-6 text-center text-gray-900">{quantity}</span>
                  <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 transition-colors active:scale-95 bg-gray-50 border border-gray-100" onClick={() => setQuantity(Math.min(product.stock.available, quantity + 1))}>+</button>
               </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION 3: PAYMENT METHOD */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
              <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm">3</span>
              Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div onClick={() => setPaymentMethod('COD')} className={`cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center gap-2.5 text-center ${paymentMethod === 'COD' ? 'border-gray-900 bg-gray-900/5 shadow-md' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                <FaTruck className={`text-2xl sm:text-3xl ${paymentMethod === 'COD' ? 'text-gray-900' : 'text-gray-400'}`} />
                <span className={`font-bold text-xs sm:text-sm leading-tight ${paymentMethod === 'COD' ? 'text-gray-900' : 'text-gray-500'}`}>Cash on Delivery</span>
                {paymentMethod === 'COD' && <div className="absolute top-3 right-3 text-gray-900"><FaCheckCircle size={16} /></div>}
              </div>
              
              <div onClick={() => setPaymentMethod('ONLINE')} className={`cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center gap-2.5 text-center ${paymentMethod === 'ONLINE' ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                <FaCreditCard className={`text-2xl sm:text-3xl ${paymentMethod === 'ONLINE' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`font-bold text-xs sm:text-sm leading-tight ${paymentMethod === 'ONLINE' ? 'text-blue-700' : 'text-gray-500'}`}>Online Transfer</span>
                {paymentMethod === 'ONLINE' && <div className="absolute top-3 right-3 text-blue-600"><FaCheckCircle size={16} /></div>}
              </div>
            </div>
          </div>

          {/* ONLINE PAYMENT UPLOAD SECTION */}
          {paymentMethod === 'ONLINE' && (
            <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-blue-100 animate-fade-in-up shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-3 mb-4">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <FaMoneyBillWave className="text-blue-600" /> Transfer Instructions
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold bg-white px-2 py-1 rounded-md border border-gray-200">
                  <FaShieldAlt className="text-green-500"/> Secured
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
                Please transfer exactly <strong className="text-gray-900 font-black">PKR {product.price * quantity}</strong> to the following account:
                <br/>
                <span className="font-mono bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900 inline-block mt-2 font-bold tracking-wide shadow-sm break-all">
                  {ADMIN_BANK_NAME}: {ADMIN_ACCOUNT_NUM}
                </span>
              </p>

              <div className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300 h-36 flex items-center justify-center cursor-pointer group ${isScanning ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50/30'}`}>
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                {isScanning ? (
                  <div className="flex flex-col items-center text-blue-600 px-2 text-center">
                    <FaSpinner className="animate-spin text-2xl sm:text-3xl mb-3" />
                    <span className="text-xs font-bold tracking-wide">Analyzing Receipt Details...</span>
                  </div>
                ) : !preview ? (
                  <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors px-2 text-center">
                    <FaMagic className="text-2xl sm:text-3xl mb-2" />
                    <span className="text-xs font-bold leading-tight">Tap to Upload Payment Screenshot</span>
                    <span className="text-[10px] font-medium mt-1 opacity-70">JPG, PNG, PDF</span>
                  </div>
                ) : (
                  <img src={preview} alt="Receipt" className="h-full w-full object-contain opacity-60 mix-blend-multiply" />
                )}
              </div>
              
              {/* Intelligent Feedback States */}
              {scanResult === 'success' && (<div className="mt-4 bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold border border-green-200 shadow-sm"><FaCheckCircle className="text-base flex-shrink-0" /> Receipt Analyzed & Verified Match</div>)}
              {scanResult === 'fail' && !isScanning && (<div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl flex flex-col gap-1 text-xs font-bold border border-red-200 shadow-sm"><div className="flex items-center gap-2"><FaTimesCircle className="flex-shrink-0 text-base" /> Verification Failed</div><span className="font-medium text-[11px] opacity-90 leading-tight">The system could not detect the exact amount or bank name. Please try a clearer screenshot.</span></div>)}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button type="submit" disabled={product.stock.available === 0 || isScanning} className={`w-full py-4 rounded-2xl font-extrabold text-base sm:text-lg transition-all duration-200 transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${(product.stock.available > 0 && (!isScanning)) ? 'bg-gray-900 hover:bg-black text-white hover:shadow-xl hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200'}`}>
              {isScanning ? "Verifying Payment..." : (product.stock.available > 0 ? `Complete Order • PKR ${product.price * quantity}` : "Currently Out of Stock")}
            </button>
            <p className="text-center text-[10px] font-bold text-gray-400 mt-4 flex items-center justify-center gap-1 uppercase tracking-widest"><FaShieldAlt /> Secure Checkout Process</p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default OrderPage;