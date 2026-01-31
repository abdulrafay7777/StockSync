const Joi = require('joi');

// The Middleware Function
const validate = (schema) => (req, res, next) => {
  // Validate request body against the schema
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    // If error, return 400 Bad Request with details
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({ message: errorMessage });
  }

  // If valid, move to the controller
  next();
};

module.exports = validate;