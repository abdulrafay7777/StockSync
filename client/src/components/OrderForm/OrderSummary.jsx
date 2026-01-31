import React from 'react';
import { FaLock, FaMinus, FaPlus } from 'react-icons/fa';

const OrderSummary = ({ product, quantity, increaseQty, decreaseQty, totalPrice }) => {
  return (
    <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-800 opacity-50 blur-3xl"></div>
      
      <div>
        <h3 className="text-sm font-semibold tracking-wider text-blue-200 uppercase mb-6">Order Summary</h3>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-blue-900 font-bold text-2xl shadow-inner">
            {product ? product.title.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{product ? product.title : "Loading..."}</h2>
            <p className="text-blue-200 text-sm">
               {product ? `Unit Price: PKR ${product.price}` : "Fetching..."}
            </p>
          </div>
        </div>
        
        {/* Quantity Selector */}
        <div className="bg-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span className="font-semibold text-blue-100">Quantity</span>
          <div className="flex items-center gap-3 bg-blue-900 rounded-lg p-1">
            <button type="button" onClick={decreaseQty} className="w-8 h-8 flex items-center justify-center bg-blue-700 rounded hover:bg-blue-600 transition">
              <FaMinus size={12} />
            </button>
            <span className="w-6 text-center font-bold">{quantity}</span>
            <button type="button" onClick={increaseQty} className="w-8 h-8 flex items-center justify-center bg-blue-700 rounded hover:bg-blue-600 transition">
              <FaPlus size={12} />
            </button>
          </div>
        </div>

        <div className="border-t border-blue-700 py-4 space-y-2">
          <div className="flex justify-between text-blue-200">
            <span>Subtotal</span>
            <span>PKR {totalPrice}</span>
          </div>
          <div className="flex justify-between text-blue-200">
            <span>Delivery Fee</span>
            <span>Free</span>
          </div>
        </div>
        
        <div className="border-t border-blue-700 pt-4 flex justify-between items-center">
          <span className="text-xl font-semibold">Total</span>
          <span className="text-3xl font-bold">PKR {totalPrice}</span>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-sm text-blue-200 bg-blue-800 p-3 rounded-lg">
         <FaLock /> <span>Secure Checkout</span>
      </div>
    </div>
  );
};

export default OrderSummary;