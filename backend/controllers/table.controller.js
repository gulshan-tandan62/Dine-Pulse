const Table = require('../models/Table');
const QRCode = require('qrcode');

const createTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    const existing = await Table.findOne({ where: { tableNumber } });
    if (existing) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    const tableUrl = `${process.env.FRONTEND_URL}/menu?table=${tableNumber}`;
    const qrCode = await QRCode.toDataURL(tableUrl);

    const table = await Table.create({ tableNumber, qrCode });

    res.status(201).json({
      message: 'Table created successfully',
      table,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllTables = async (req, res) => {
  try {
    const tables = await Table.findAll({ order: [['tableNumber', 'ASC']] });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getTableById = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const { isActive } = req.body;
    await table.update({ isActive });

    res.json({ message: 'Table updated', table });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    await table.destroy();
    res.json({ message: 'Table deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createMultipleTables = async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to || from > to) {
      return res.status(400).json({ message: 'Provide valid from and to table numbers' });
    }

    const results = [];

    for (let tableNumber = from; tableNumber <= to; tableNumber++) {
      const existing = await Table.findOne({ where: { tableNumber } });
      if (existing) continue;

      const tableUrl = `${process.env.FRONTEND_URL}/menu?table=${tableNumber}`;
      const qrCode = await QRCode.toDataURL(tableUrl);
      const table = await Table.create({ tableNumber, qrCode });
      results.push(table);
    }

    res.status(201).json({
      message: `${results.length} tables created successfully`,
      tables: results,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
module.exports = { createTable, createMultipleTables, getAllTables, getTableById, updateTable, deleteTable };
