const Product = require('../models/Product');
const Order = require('../models/Order');
const Waitlist = require('../models/Waitlist');

// 1. Mark order as returned -> Move stock to Quarantine
const markReturned = async (req, res) => {
  try {
    // Ensure your route is defined as router.put('/:orderId/return', ...)
    const { orderId } = req.params; 
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Prevent double returns
    if (order.status === 'RETURNED' || order.status === 'RESTOCKED') {
        return res.status(400).json({ message: 'Order is already returned' });
    }

    order.status = 'RETURNED';
    await order.save();

    // Move logic: +1 Quarantined
    const product = await Product.findById(order.productId);
    if (product) {
        product.stock.quarantined = (product.stock.quarantined || 0) + 1;
        // Note: We do NOT increase 'available' yet. Inspection required.
        await product.save();
    }

    res.json({ message: 'Order marked returned. Stock quarantined.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 2. Inspect & Restock -> Trigger Resurrection Engine
const restockItem = async (req, res) => {
  try {
    // FIX 1: Get Order ID from URL params (matches Frontend)
    // Ensure your route is router.put('/:orderId/restock', ...)
    const { orderId } = req.params; 

    // FIX 2: Find the Order first
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // FIX 3: Ensure it is actually in 'RETURNED' state before restocking
    if (order.status !== 'RETURNED') {
        return res.status(400).json({ message: "Order must be 'RETURNED' before restocking." });
    }

    // FIX 4: Find the Product associated with this order
    const product = await Product.findById(order.productId);
    if (!product) return res.status(404).json({ message: 'Product associated with order not found' });

    // FIX 5: Update Stock (Move from Quarantine -> Available)
    // We decrease quarantined because markReturned() increased it earlier
    if (product.stock.quarantined > 0) {
      product.stock.quarantined -= 1;
    }
    
    // Add back to available stock
    product.stock.available += 1; 
    await product.save();

    // FIX 6: Update Order Status to 'RESTOCKED' (So frontend shows Green Check)
    order.status = 'RESTOCKED';
    await order.save();

    // --- RESURRECTION ENGINE: Check Waitlist ---
    const waiter = await Waitlist.findOne({ productId: product._id, notified: false });
    
    let alertMessage = "Success! Item Restocked.";
    
    if (waiter) {
      alertMessage = `Stock updated! ALERT: Customer ${waiter.customerName} (${waiter.customerPhone}) is waiting for this!`;
      // In real app, you would send WhatsApp API call here
      waiter.notified = true;
      await waiter.save();
    }

    res.json({ message: alertMessage, waiter });

  } catch (error) {
    console.error("Restock Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { markReturned, restockItem };