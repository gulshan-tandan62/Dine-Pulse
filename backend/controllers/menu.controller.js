const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// ─── Category Controllers ───────────────────────────────

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name });
    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: MenuItem, as: 'items' }],
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.update({ name: req.body.name });
    res.json({ message: 'Category updated', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Menu Item Controllers ───────────────────────────────

const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, categoryId, isAvailable } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      image,
      categoryId,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    res.status(201).json({ message: 'Menu item created', item });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.findAll({
      include: [{ model: Category, as: 'category' }],
      order: [['name', 'ASC']],
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }],
    });
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    await item.update(req.body);
    res.json({ message: 'Menu item updated', item });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    await item.destroy();
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const createMultipleMenuItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Provide an array of items' });
    }

    const created = await MenuItem.bulkCreate(items, { validate: true });

    res.status(201).json({
      message: `${created.length} menu items created successfully`,
      items: created,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const createMultipleCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    const created = await Category.bulkCreate(categories, { validate: true });
    res.status(201).json({ message: `${created.length} categories created`, categories: created });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
module.exports = {
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
};