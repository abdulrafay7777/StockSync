import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { 
  FaCheckCircle, FaTruck, FaFilePdf, FaUndo, FaCreditCard, 
  FaMoneyBillWave, FaEye, FaTimes, FaExclamationTriangle
} from 'react-icons/fa';
import { generateInvoice } from '../utils/invoiceGenerator'; 

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenshotModal, setScreenshotModal] = useState({ isOpen: false, url: '' });

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/orders');
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders");
    }
  };

  // --- ACTIONS ---

  const handleShipOrder = (orderId) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <div className="font-bold text-gray-800 flex items-center gap-2">
          <FaTruck className="text-blue-600" /> Mark as Shipped?
        </div>
        <p className="text-sm text-gray-600">This will archive and remove the order from this list.</p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm font-bold transition"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`/orders/${orderId}`);
                toast.success("Order Shipped & Archived!");
                fetchOrders(); 
              } catch (err) {
                toast.error("Action failed");
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-bold transition"
          >
            Yes, Ship It
          </button>
        </div>
      </div>
    ), { duration: 5000, position: "top-center" });
  };

  const handleReturn = (order) => {
    const productData = (order.productId && typeof order.productId === 'object') 
      ? order.productId 
      : (order.product && typeof order.product === 'object') ? order.product : null;

    if (!productData) {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <div className="font-bold text-red-600 flex items-center gap-2">
            <FaExclamationTriangle /> Data Error
          </div>
          <p className="text-sm text-gray-600">Product data is missing. Just remove this order?</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => toast.dismiss(t.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm font-bold">Cancel</button>
            <button 
              onClick={async () => {
                toast.dismiss(t.id);
                await axios.delete(`/orders/${order._id}`);
                toast.success("Order Removed");
                fetchOrders();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-bold"
            >
              Force Remove
            </button>
          </div>
        </div>
      ), { duration: 6000 });
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-2">
        <div className="font-bold text-gray-800 flex items-center gap-2">
          <FaUndo className="text-orange-500" /> Restock & Return?
        </div>
        <p className="text-sm text-gray-600">
          Restock <b>{productData.title}</b>?<br/> 
          This will add <b>{order.quantity}</b> units back to inventory.
        </p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm font-bold">Cancel</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.post(`/products/${productData._id}/restock`, { quantity: order.quantity });
                await axios.delete(`/orders/${order._id}`);
                toast.success("Order Returned & Stock Updated");
                fetchOrders();
              } catch (err) {
                toast.error("Restock failed");
              }
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm font-bold"
          >
            Confirm Return
          </button>
        </div>
      </div>
    ), { duration: 6000, position: "top-center" });
  };

  const handlePrint = (order) => {
    let safeProduct = { title: "Unknown Item", price: 0 };
    if (order.productId && typeof order.productId === 'object') {
      safeProduct = order.productId;
    } else if (order.product && typeof order.product === 'object') {
      safeProduct = order.product;
    }

    generateInvoice({
      orderId: order._id,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      product: safeProduct, 
      quantity: order.quantity,
      paymentMethod: order.paymentMethod
    });
  };

  const openScreenshot = (url) => {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
    setScreenshotModal({ isOpen: true, url: fullUrl });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Orders...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-8 relative">
      
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="font-bold text-gray-700 text-lg flex items-center gap-2">
          <FaTruck className="text-blue-600" /> Incoming Orders
        </h2>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
          {orders.length} Pending
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Item</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              
              let productData = null;
              let displayTitle = "";
              
              if (order.productId && typeof order.productId === 'object') {
                productData = order.productId;
              } 
              else if (order.product && typeof order.product === 'object') {
                productData = order.product;
              }

              if (productData) {
                displayTitle = productData.title;
              } else {
                const rawId = order.productId || order.product;
                displayTitle = rawId ? `(ID: ${rawId.toString().slice(-6)}...)` : "(Product Deleted)";
              }

              const productPrice = productData ? productData.price : 0;
              const totalBill = productPrice * order.quantity;
              const isDataMissing = !productData;

              return (
                <tr key={order._id} className="hover:bg-blue-50 transition group">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.phone}</div>
                    <div className="text-xs text-gray-400 truncate w-40" title={order.address}>{order.address}</div>
                  </td>

                  <td className="p-4">
                    <div className={`font-medium ${isDataMissing ? 'text-orange-500 italic' : 'text-gray-700'}`}>
                      {displayTitle}
                    </div>
                    <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                  </td>

                  <td className="p-4 font-bold text-green-600">
                    PKR {totalBill}
                  </td>

                  <td className="p-4">
                    {order.paymentMethod === 'COD' ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-md w-max">
                        <FaMoneyBillWave /> COD
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md w-max">
                          <FaCreditCard /> Online
                        </span>
                        
                        {order.screenshotUrl && order.screenshotUrl !== "OCR_VERIFIED" && order.screenshotUrl !== "OCR_AMOUNT_MATCHED" ? (
                           <button onClick={() => openScreenshot(order.screenshotUrl)} className="text-[10px] text-blue-600 flex items-center gap-1 font-bold hover:underline cursor-pointer bg-blue-50 px-2 py-1 rounded border border-blue-100">
                             <FaEye /> View Proof
                           </button>
                        ) : (
                           (order.screenshotUrl === "OCR_VERIFIED" || order.screenshotUrl === "OCR_AMOUNT_MATCHED") && (
                             <span className="text-[10px] text-green-600 flex items-center gap-1 font-bold">
                               <FaCheckCircle /> System Verified
                             </span>
                           )
                        )}
                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    {/* BUTTONS SECTION */}
                    <div className="flex justify-center items-center gap-3">
                      
                      {/* PDF BUTTON (BLUE) */}
                      <button 
                        onClick={() => handlePrint(order)} 
                        className={`p-3 rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center
                          ${isDataMissing 
                            ? 'bg-orange-100 text-orange-400 cursor-not-allowed opacity-50' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200'
                          }`}
                        title="Download Invoice"
                      >
                        <FaFilePdf size={20} />
                      </button>

                      {/* SHIP BUTTON (GREEN) */}
                      <button 
                        onClick={() => handleShipOrder(order._id)} 
                        className="p-3 bg-green-100 text-green-600 rounded-xl shadow-md border border-green-200 hover:bg-green-600 hover:text-white transition transform active:scale-95 flex items-center justify-center"
                        title="Mark Shipped"
                      >
                        <FaCheckCircle size={20} />
                      </button>

                      {/* RETURN BUTTON (RED) */}
                      <button 
                        onClick={() => handleReturn(order)} 
                        className="p-3 bg-red-100 text-red-600 rounded-xl shadow-md border border-red-200 hover:bg-red-600 hover:text-white transition transform active:scale-95 flex items-center justify-center"
                        title="Return / Restock"
                      >
                        <FaUndo size={20} />
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {screenshotModal.isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setScreenshotModal({ ...screenshotModal, isOpen: false })}
        >
          <button 
            className="absolute top-5 right-5 text-white bg-white/20 hover:bg-white/40 rounded-full p-3 transition"
            onClick={() => setScreenshotModal({ ...screenshotModal, isOpen: false })}
          >
            <FaTimes size={24} />
          </button>
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={screenshotModal.url} alt="Payment Proof" className="max-w-[95%] max-h-[95vh] object-contain rounded-md shadow-2xl border border-white/20" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;