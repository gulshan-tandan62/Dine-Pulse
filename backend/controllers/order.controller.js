const Order = require('../models/Order');
const Table = require('../models/Table');
const { getIO } = require('../socket/socket');

const placeOrder = async (req, res) => {
  try {
    const { tableId, items, totalAmount, customerNote } = req.body;

    if (!tableId || !items || !totalAmount) {
      return res.status(400).json({ message: 'tableId, items and totalAmount are required' });
    }

    const table = await Table.findByPk(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const order = await Order.create({
      tableId,
      items,
      totalAmount,
      customerNote,
      status: 'placed',
    });

    // Emit to kitchen in real time
    getIO().to('kitchen').emit('order:new', {
      order,
      tableNumber: table.tableNumber,
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: Table, as: 'table' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: Table, as: 'table' }],
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getOrdersByTable = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { tableId: req.params.tableId },
      include: [{ model: Table, as: 'table' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'accepted', 'preparing', 'ready', 'served'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByPk(req.params.id, {
      include: [{ model: Table, as: 'table' }],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update({ status });

    // Emit to customer's table in real time
    getIO().to(`table_${order.table.tableNumber}`).emit('order:status_update', {
      orderId: order.id,
      status,
    });

    // Emit to kitchen as well
    getIO().to('kitchen').emit('order:status_update', {
      orderId: order.id,
      status,
    });

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    await order.destroy();
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  placeOrder,
  getAllOrders,
  getOrderById,
  getOrdersByTable,
  updateOrderStatus,
  deleteOrder,
};