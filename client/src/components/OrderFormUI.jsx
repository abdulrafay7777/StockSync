import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaBox, FaCheckCircle, FaMoneyBillWave, FaSpinner, FaMagic, 
  FaTimesCircle, FaUser, FaPhone, FaMapMarkerAlt, FaCreditCard, 
  FaTruck, FaFilePdf, FaExclamationCircle
} from 'react-icons/fa';

const OrderFormUI = ({
  // States
  loading, error, orderSuccess, product,
  customerName, phone, address, quantity, paymentMethod,
  preview, isScanning, scanResult,
  bankName, accountNum,
  
  // Actions
  setCustomerName, setPhone, setAddress, setQuantity, setPaymentMethod,
  handleImageChange, handleSubmit, handleDownload
}) => {

  // --- 1. LOADING & ERROR STATES ---
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  
  // This 'error' usually comes from the backend Joi validation
  const renderError = (msg) => (
    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-red-100 animate-shake">
      <FaExclamationCircle className="flex-shrink-0" />
      <span className="text-sm font-bold">{msg}</span>
    </div>
  );

  // --- 2. SUCCESS SCREEN ---
  if (orderSuccess) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-green-100 animate-fade-in-up">
        <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-4xl text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
        <p className="text-gray-500 mb-8">Thanks, {customerName}. Your order is secured.</p>
        <button 
            onClick={handleDownload}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-black transition shadow-lg"
        >
            <FaFilePdf size={20} /> Download Invoice
        </button>
      </div>
    </div>
  );

  // --- 3. MAIN FORM ---
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <Helmet><title>{product ? `Checkout: ${product.title}` : 'Loading...'}</title></Helmet>
      
      <div className="bg-white max-w-xl w-full rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white relative overflow-hidden">
          <FaBox className="absolute -right-6 -top-6 text-9xl opacity-10 rotate-12" />
          <div className="relative z-10 text-center">
             <h1 className="text-3xl font-bold tracking-tight mb-2">{product.title}</h1>
             <p className="text-blue-100 text-lg font-medium">PKR {product.price}</p>
             {product.stock.available < 5 && (
               <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mt-3 shadow-sm">
                 Only {product.stock.available} Left in Stock
               </span>
             )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Show Backend Joi Errors if any */}
          {error && renderError(error)}

          {/* CUSTOMER INFO */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</h3>
            
            <div className="relative">
              <FaUser className="absolute top-4 left-4 text-gray-400" />
              <input 
                type="text" 
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                placeholder="Full Name (Min 3 chars)" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
              />
            </div>

            <div className="relative">
              <FaPhone className="absolute top-4 left-4 text-gray-400" />
              <input 
                type="tel" 
                required
                maxLength={11}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                placeholder="Phone (e.g. 03XXXXXXXXX)" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
            </div>

            <div className="relative">
              <FaMapMarkerAlt className="absolute top-4 left-4 text-gray-400" />
              <textarea 
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition" 
                placeholder="Complete Delivery Address (Min 10 chars)" 
                value={address} 
                onChange={e => setAddress(e.target.value)}
              ></textarea>
              <div className={`text-[10px] absolute bottom-2 right-4 font-bold ${address.length < 10 ? 'text-red-400' : 'text-green-500'}`}>
                {address.length}/10 min characters
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* QUANTITY & BILL */}
          <div className="flex items-center justify-between bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <div>
                <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Total Payable</span>
                <div className="text-2xl font-black text-gray-800">PKR {product.price * quantity}</div>
              </div>
              <div className="flex items-center gap-3 bg-white p-1 rounded-full border shadow-sm">
                <button type="button" className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 transition" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                <button type="button" className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 transition" onClick={() => setQuantity(Math.min(product.stock.available, quantity + 1))}>+</button>
              </div>
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              {['COD', 'ONLINE'].map((method) => (
                <button 
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)} 
                  className={`p-4 rounded-xl border-2 transition relative flex flex-col items-center gap-2 
                    ${paymentMethod === method ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                >
                  {method === 'COD' ? <FaTruck size={24} /> : <FaCreditCard size={24} />}
                  <span className="font-bold text-xs">{method === 'COD' ? 'Cash on Delivery' : 'Online Transfer'}</span>
                  {paymentMethod === method && <FaCheckCircle className="absolute top-2 right-2 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* ONLINE INSTRUCTIONS & SCANNER */}
          {paymentMethod === 'ONLINE' && (
            <div className="bg-gray-900 p-5 rounded-2xl text-white animate-fade-in-up">
              <div className="flex items-center gap-2 text-blue-400 font-bold mb-3 text-sm">
                <FaMoneyBillWave /> Transfer Instructions
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Please transfer <span className="text-white font-bold">PKR {product.price * quantity}</span> to the account below and upload the screenshot.
              </p>
              <div className="bg-white/10 p-3 rounded-lg border border-white/10 mb-5">
                <div className="text-[10px] text-gray-400 uppercase font-bold">{bankName}</div>
                <div className="text-lg font-mono font-bold tracking-wider">{accountNum}</div>
              </div>
              
              <div className={`relative border-2 border-dashed rounded-xl overflow-hidden h-32 flex items-center justify-center cursor-pointer transition 
                ${isScanning ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-blue-400 bg-white/5'}`}>
                
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                
                {isScanning ? (
                  <div className="flex flex-col items-center">
                    <FaSpinner className="animate-spin text-2xl mb-2 text-blue-400" />
                    <span className="text-xs font-bold">Verifying Receipt...</span>
                  </div>
                ) : !preview ? (
                  <div className="flex flex-col items-center text-gray-500">
                    <FaMagic className="text-xl mb-2" />
                    <span className="text-xs font-bold">Upload Payment Screenshot</span>
                  </div>
                ) : (
                  <img src={preview} alt="Receipt" className="h-full w-full object-cover opacity-40" />
                )}
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={product.stock.available === 0 || isScanning} 
            className={`w-full py-4 rounded-xl font-black text-lg shadow-xl transition transform active:scale-95 uppercase tracking-widest
              ${(product.stock.available > 0 && !isScanning) ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {isScanning ? "Processing..." : (product.stock.available > 0 ? "Place Order" : "Sold Out")}
          </button>

        </form>
      </div>
    </div>
  );
};

export default OrderFormUI;