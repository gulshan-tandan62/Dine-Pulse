const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getAllOrders,
  getOrderById,
  getOrdersByTable,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

// Public — customer places order (no login needed)
router.post('/', placeOrder);

// Public — customer tracks their table orders
router.get('/table/:tableId', getOrdersByTable);

// Protected — admin and kitchen can see all orders
router.get('/', verifyToken, allowRoles('admin', 'kitchen'), getAllOrders);
router.get('/:id', verifyToken, allowRoles('admin', 'kitchen'), getOrderById);

// Protected — kitchen updates order status
router.patch('/:id/status', verifyToken, allowRoles('admin', 'kitchen'), updateOrderStatus);

// Protected — admin can delete orders
router.delete('/:id', verifyToken, allowRoles('admin'), deleteOrder);

module.exports = router;