const express = require('express');
const router = express.Router();
const { markReturned, restockItem } = require('../controllers/returnController');

// Parameter must be :orderId to match req.params.orderId in controller
router.put('/:orderId/return', markReturned);
router.put('/:orderId/restock', restockItem);

module.exports = router;