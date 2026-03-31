const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Table = require('./Table');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tableId: {
    type: DataTypes.INTEGER,
    references: { model: Table, key: 'id' },
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('placed', 'accepted', 'preparing', 'ready', 'served'),
    defaultValue: 'placed',
  },
  customerNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, { timestamps: true });

Order.belongsTo(Table, { foreignKey: 'tableId', as: 'table' });
Table.hasMany(Order, { foreignKey: 'tableId', as: 'orders' });

module.exports = Order;