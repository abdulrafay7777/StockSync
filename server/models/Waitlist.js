const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  notified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);