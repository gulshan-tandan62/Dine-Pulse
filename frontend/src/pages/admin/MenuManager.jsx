import React, { useEffect, useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Button, Card, CardContent,
  Grid, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, FormControl,
  InputLabel, Switch, FormControlLabel, Alert, CircularProgress
} from '@mui/material';
import MuiMenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getCategories, createCategory, deleteCategory,
  createMenuItem, updateMenuItem, deleteMenuItem
} from '../../api/index';

export default function MenuManager() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [catDialog, setCatDialog]   = useState(false);
  const [catName, setCatName]       = useState('');
  const [itemDialog, setItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm]     = useState({
    name: '', description: '', price: '', categoryId: '', isAvailable: true
  });

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleAddCategory = async () => {
    try {
      await createCategory({ name: catName });
      setCatName('');
      setCatDialog(false);
      fetchMenu();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      fetchMenu();
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const openAddItem = () => {
    setEditingItem(null);
    setItemForm({ name: '', description: '', price: '', categoryId: '', isAvailable: true });
    setItemDialog(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      categoryId: item.categoryId,
      isAvailable: item.isAvailable,
    });
    setItemDialog(true);
  };

  const handleSaveItem = async () => {
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, itemForm);
      } else {
        await createMenuItem(itemForm);
      }
      setItemDialog(false);
      fetchMenu();
    } catch (err) {
      setError('Failed to save item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteMenuItem(id);
      fetchMenu();
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#8B0000' }}>
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Menu Manager
          </Typography>
          <Button color="inherit" onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button variant="contained" onClick={() => setCatDialog(true)}
            sx={{ backgroundColor: '#8B0000' }}>
            + Add Category
          </Button>
          <Button variant="outlined" onClick={openAddItem}
            sx={{ borderColor: '#8B0000', color: '#8B0000' }}>
            + Add Menu Item
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          categories.map((category) => (
            <Box key={category.id} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#8B0000' }}>
                  {category.name}
                  <Chip label={`${category.items?.length || 0} items`}
                    size="small" sx={{ ml: 1 }} />
                </Typography>
                <Button size="small" color="error"
                  onClick={() => handleDeleteCategory(category.id)}>
                  Delete Category
                </Button>
              </Box>

              <Grid container spacing={2}>
                {category.items?.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card sx={{ borderRadius: 2, boxShadow: 1,
                      opacity: item.isAvailable ? 1 : 0.5 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex',
                          justifyContent: 'space-between', mb: 1 }}>
                          <Typography fontWeight="bold">{item.name}</Typography>
                          <Chip
                            label={item.isAvailable ? 'Available' : 'Unavailable'}
                            color={item.isAvailable ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          {item.description}
                        </Typography>
                        <Typography fontWeight="bold" color="#8B0000">
                          Rs.{item.price}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button size="small" variant="outlined"
                            onClick={() => openEditItem(item)}>
                            Edit
                          </Button>
                          <Button size="small" variant="outlined" color="error"
                            onClick={() => handleDeleteItem(item.id)}>
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Box>

      <Dialog open={catDialog} onClose={() => setCatDialog(false)}>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name" fullWidth autoFocus
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCatDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCategory} variant="contained"
            sx={{ backgroundColor: '#8B0000' }}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={itemDialog} onClose={() => setItemDialog(false)}
        fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? 'Edit Item' : 'Add Menu Item'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Item Name" fullWidth
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
            />
            <TextField label="Description" fullWidth multiline rows={2}
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            />
            <TextField label="Price" type="number" fullWidth
              value={itemForm.price}
              onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={itemForm.categoryId}
                label="Category"
                onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
              >
                {categories.map((cat) => (
                  <MuiMenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={itemForm.isAvailable}
                  onChange={(e) => setItemForm({
                    ...itemForm, isAvailable: e.target.checked
                  })}
                />
              }
              label="Available"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained"
            sx={{ backgroundColor: '#8B0000' }}>
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}