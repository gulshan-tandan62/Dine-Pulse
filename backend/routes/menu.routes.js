const express = require('express');
const router = express.Router();
const {
  createCategory,
  createMultipleCategories,
  getAllCategories,
  updateCategory,
  deleteCategory,
  createMenuItem,
  createMultipleMenuItems,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menu.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

// ─── Category Routes ─────────────────────────────────────
router.get('/categories',           getAllCategories);
router.post('/categories',          verifyToken, allowRoles('admin'), createCategory);
router.post('/categories/bulk',     verifyToken, allowRoles('admin'), createMultipleCategories);
router.patch('/categories/:id',     verifyToken, allowRoles('admin'), updateCategory);
router.delete('/categories/:id',    verifyToken, allowRoles('admin'), deleteCategory);

// ─── Menu Item Routes ─────────────────────────────────────
router.get('/items',            getAllMenuItems);
router.get('/items/:id',        getMenuItemById);
router.post('/items',           verifyToken, allowRoles('admin'), createMenuItem);
router.post('/items/bulk',      verifyToken, allowRoles('admin'), createMultipleMenuItems);
router.patch('/items/:id',      verifyToken, allowRoles('admin'), updateMenuItem);
router.delete('/items/:id',     verifyToken, allowRoles('admin'), deleteMenuItem);

module.exports = router;