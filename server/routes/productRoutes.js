const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createProduct, 
  getProducts, 
  getProductById,
  restockProduct,
  deleteProduct
} = require('../controllers/productController');

// Define Routes
router.post('/', createProduct);       // Add Product
router.get('/', getProducts);          // Get All Products
router.get('/:id', getProductById);    // Get Single Product (New)
router.post('/:id/restock', restockProduct);
router.delete('/:id', deleteProduct);

module.exports = router;