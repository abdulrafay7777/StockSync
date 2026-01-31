const Product = require('../models/Product');

// 1. Create a Product
const createProduct = async (req, res) => {
  try {
    const { title, price, initialStock } = req.body;
    const product = new Product({
      title,
      price,
      stock: { available: initialStock, quarantined: 0, sold: 0 }
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Single Product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. Restock Product
const restockProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { "stock.available": quantity } },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Restock failed" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error: Could not delete product" });
  }
}

// Export ALL functions
module.exports = {
  createProduct,
  getProducts,
  getProductById,
  restockProduct,
  deleteProduct
};
