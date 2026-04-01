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

router.get('/:id',        getTableById);
router.get('/',           verifyToken, allowRoles('admin'), getAllTables);
router.post('/',          verifyToken, allowRoles('admin'), createTable);
router.post('/bulk',      verifyToken, allowRoles('admin'), createMultipleTables);
router.patch('/:id',      verifyToken, allowRoles('admin'), updateTable);
router.delete('/:id',     verifyToken, allowRoles('admin'), deleteTable);

module.exports = router;

