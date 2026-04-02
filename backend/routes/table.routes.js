const express = require('express');
const router = express.Router();
const {
  createTable,
  createMultipleTables,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
} = require('../controllers/table.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

// Public routes
router.get('/', getAllTables);
router.get('/:id', getTableById);
router.post('/bulk', verifyToken, allowRoles('admin'), createMultipleTables);

// Protected — only admin
router.post('/',      verifyToken, allowRoles('admin'), createTable);
router.patch('/:id',  verifyToken, allowRoles('admin'), updateTable);
router.delete('/:id', verifyToken, allowRoles('admin'), deleteTable);

module.exports = router;