import React from 'react';

const ReturnAlert = ({ waiter, onClose }) => {
  if (!waiter) return null;

  const whatsappLink = `https://wa.me/${waiter.customerPhone}?text=Hi ${waiter.customerName}, good news! The item you wanted is back in stock.`;

  return (
    <div className="fixed top-5 right-5 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 shadow-lg z-50">
      <p className="font-bold">Resurrection Opportunity!</p>
      <p>{waiter.customerName} is waiting for this item.</p>
      <div className="mt-2 flex gap-2">
        <a 
          href={whatsappLink} 
          target="_blank" 
          rel="noreferrer"
          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
        >
          WhatsApp Now
        </a>
        <button onClick={onClose} className="text-sm underline">Dismiss</button>
      </div>
    </div>
  );
};

export default ReturnAlert;