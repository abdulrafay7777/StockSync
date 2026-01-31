const Order = require('../models/Order');
const Product = require('../models/Product');

// 1. Create Order
const createOrder = async (req, res) => {
  try {
    const { productId, customerName, phone, address, paymentMethod, quantity } = req.body;
    const orderQty = parseInt(quantity) || 1;

    // Check Stock
    const productDoc = await Product.findById(productId);
    if (!productDoc) return res.status(404).json({ message: 'Product not found' });

    if (productDoc.stock.available < orderQty) {
      return res.status(400).json({ message: `Stock Error: Only ${productDoc.stock.available} items left!` });
    }

    // Create Order
    // FIX: We save the ID to BOTH 'product' and 'productId' fields.
    // This ensures compatibility with all versions of your code.
    const order = new Order({
      product: productId,   // Field 1
      productId: productId, // Field 2
      customerName,
      phone,
      address,
      paymentMethod,
      quantity: orderQty,
      screenshotUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    await order.save();

    // Deduct Stock
    productDoc.stock.available -= orderQty;
    await productDoc.save();

    res.status(201).json(order);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Orders
const getOrders = async (req, res) => {
  try {
    // FIX: Now that Schema has both fields, this will NOT crash
    const orders = await Order.find()
      .populate('product', 'title price')
      .populate('productId', 'title price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error("Get Orders Error:", error); // This helps see the error in terminal
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order removed" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete order" });
  }
};

module.exports = { createOrder, getOrders, deleteOrder };