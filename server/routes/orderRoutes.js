const express = require('express');
const router = express.Router();
const { createOrder, getOrders, deleteOrder } = require('../controllers/orderController'); 
const { orderSchema } = require('../utils/validationSchemas'); // Import your schema
const upload = require('../middleware/upload');
const multer = require('multer'); 

// --- 1. VALIDATION MIDDLEWARE ---
const validateOrder = (req, res, next) => {
  // Joi validation
  const { error } = orderSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ 
      message: error.details[0].message 
    });
  }
  next();
};

// --- 2. ERROR HANDLING WRAPPER (FOR UPLOADS) ---
const uploadSingle = (req, res, next) => {
  const uploadFn = upload.single('screenshot');

  uploadFn(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload Error: ${err.message}` });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// --- ROUTES ---

// Order is: Upload first -> Validate data second -> Controller third
router.post('/', uploadSingle, validateOrder, createOrder); 

router.get('/', getOrders);
router.delete('/:id', deleteOrder); 

module.exports = router;