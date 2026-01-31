const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // --- THE FIX: Define BOTH fields ---
  // This prevents the "500 Error" when populating
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, 
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  // -----------------------------------

  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
  screenshotUrl: { type: String },
  status: { 
    type: String, 
    enum: ['PENDING', 'SHIPPED', 'RETURNED', 'RESTOCKED'], 
    default: 'PENDING' 
  },
  quantity: { type: Number, required: true, default: 1, min: 1 }, 

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);