import React from 'react';
import toast from 'react-hot-toast'; 

const SmartLink = ({ product }) => {
  const generateLink = () => {
    // In real app: use window.location.origin
    const link = `http://localhost:5173/order/${product._id}`;
    navigator.clipboard.writeText(link);
    toast.success('Smart Link Copied to Clipboard!');
  };

  return (
    <button 
      onClick={generateLink}
      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
    >
      Copy Order Link
    </button>
  );
};

export default SmartLink;