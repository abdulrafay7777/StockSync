import React from 'react';
import PaymentUpload from './PaymentUpload';
import { FaUser, FaPhone, FaMapMarkerAlt, FaMoneyBillWave, FaCreditCard, FaCheckCircle } from 'react-icons/fa';

const ShippingForm = ({ 
  formData, 
  setFormData, 
  handleSubmit, 
  loading, 
  totalPrice, 
  setFile 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="bg-blue-600 w-2 h-8 rounded-full"></span> Shipping Details
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaUser /></div>
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" 
            placeholder="Full Name" 
            value={formData.customerName} 
            onChange={e => setFormData({...formData, customerName: e.target.value})} 
          />
        </div>

        {/* Phone */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaPhone /></div>
          <input 
            type="tel" 
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" 
            placeholder="03001234567" 
            maxLength="11" 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
          />
        </div>

        {/* Address */}
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none text-gray-400"><FaMapMarkerAlt /></div>
          <textarea 
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" 
            placeholder="Complete Address (House #, Street, City)" 
            rows="2" 
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})} 
          ></textarea>
        </div>

        {/* Payment Method Selector */}
        <div className="pt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* COD Button */}
            <div 
              onClick={() => setFormData({...formData, paymentMethod: 'COD'})} 
              className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${formData.paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-gray-200 hover:border-blue-300'}`}
            >
              <FaMoneyBillWave className="text-3xl mb-2" />
              <span className="font-bold text-sm">COD</span>
              {formData.paymentMethod === 'COD' && <FaCheckCircle className="absolute top-2 right-2 text-blue-600" />}
            </div>
            
            {/* Online Button */}
            <div 
              onClick={() => setFormData({...formData, paymentMethod: 'ONLINE'})} 
              className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${formData.paymentMethod === 'ONLINE' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-gray-200 hover:border-blue-300'}`}
            >
              <FaCreditCard className="text-3xl mb-2" />
              <span className="font-bold text-sm">Online</span>
            </div>
          </div>
        </div>

        {/* Upload Section (Visible only if ONLINE) */}
        <div className={`overflow-hidden transition-all duration-300 ${formData.paymentMethod === 'ONLINE' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-2">
            <p className="text-sm text-yellow-800 font-semibold">Bank: JazzCash 0300-1234567</p>
          </div>
          <PaymentUpload setFile={setFile} expectedAmount={totalPrice} />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-900 transition flex items-center justify-center gap-2"
        >
          {loading ? 'Processing...' : `Place Order - PKR ${totalPrice}`}
        </button>
      </form>
    </div>
  );
};

export default ShippingForm;