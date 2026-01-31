const Joi = require('joi');

// Rule for Adding a Product
const productSchema = Joi.object({
  title: Joi.string().min(3).required(),
  price: Joi.number().min(1).required(),
  initialStock: Joi.number().min(0).required(),
  imageUrl: Joi.string().uri().optional().allow('') 
});

// Updated Rule for Placing an Order
const orderSchema = Joi.object({
  productId: Joi.string().required(),
  customerName: Joi.string().min(3).required(),
  phone: Joi.string().pattern(/^03\d{9}$/).required().messages({
    "string.pattern.base": "Phone must be 11 digits and start with 03"
  }),
  address: Joi.string()
    .min(10)
    .pattern(/^(?!.*(http|https|www|.com)).*$/i) // <--- Blocks links
    .required()
    .messages({
       "string.pattern.base": "Links or URLs are not allowed in the address.",
       "string.min": "Address must be at least 10 characters long."
    }),
  paymentMethod: Joi.string().valid('COD', 'ONLINE').required(),
  quantity: Joi.number().min(1).required(),
  screenshotUrl: Joi.string().allow(null, '').optional()
});

module.exports = { productSchema, orderSchema };