const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  stock: {
    totalPhysical: { type: Number, required: true, default: 0 },
    available: { type: Number, required: true, default: 0 },
    quarantined: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);