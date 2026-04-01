import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Grid, AppBar, Toolbar, Badge, Divider, CircularProgress, Alert
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCategories } from '../../api/index';
import { useCart } from '../../context/CartContext';

export default function MenuPage() {
  const [categories, setCategories]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchParams]                    = useSearchParams();
  const tableNumber                       = searchParams.get('table');
  const { addToCart, totalItems }         = useCart();
  const navigate                          = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await getCategories();
        const cats = res.data.filter(c => c.items && c.items.length > 0);
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0].id);
      } catch (err) {
        setError('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const activeItems = categories.find(
    c => c.id === activeCategory
  )?.items || [];

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>

      {/* Header */}
      <AppBar position="sticky" sx={{ backgroundColor: '#8B0000' }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              Pallkhi Restaurant
            </Typography>
            <Typography variant="caption">
              {tableNumber ? `Table ${tableNumber}` : 'Balmatta, Mangaluru'}
            </Typography>
          </Box>
          <Button
            color="inherit"
            onClick={() => navigate(`/cart?table=${tableNumber}`)}
          >
            <Badge badgeContent={totalItems} color="error">
              <Typography variant="body1">Cart</Typography>
            </Badge>
          </Button>
        </Toolbar>
      </AppBar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress sx={{ color: '#8B0000' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
      ) : (
        <>
          {/* Category Tabs */}
          <Box sx={{
            display: 'flex', overflowX: 'auto', gap: 1,
            p: 2, backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'sticky', top: 64, zIndex: 10,
            '&::-webkit-scrollbar': { display: 'none' }
          }}>
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                onClick={() => setActiveCategory(cat.id)}
                sx={{
                  cursor: 'pointer', flexShrink: 0,
                  backgroundColor: activeCategory === cat.id ? '#8B0000' : '#f0f0f0',
                  color: activeCategory === cat.id ? '#fff' : '#333',
                  fontWeight: activeCategory === cat.id ? 'bold' : 'normal',
                  '&:hover': { backgroundColor: '#8B0000', color: '#fff' }
                }}
              />
            ))}
          </Box>

          {/* Category Title */}
          <Box sx={{ px: 2, pt: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="#8B0000">
              {categories.find(c => c.id === activeCategory)?.name}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>

          {/* Menu Items */}
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {activeItems.filter(item => item.isAvailable).map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card sx={{ borderRadius: 2, boxShadow: 1,
                    display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex',
                        justifyContent: 'space-between', mb: 1 }}>
                        <Typography fontWeight="bold" sx={{ flex: 1 }}>
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {item.description}
                      </Typography>
                      <Box sx={{ display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight="bold" color="#8B0000" variant="h6">
                          Rs.{item.price}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ backgroundColor: '#8B0000', borderRadius: 2 }}
                          onClick={() => addToCart(item)}
                        >
                          + Add
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Floating Cart Button */}
          {totalItems > 0 && (
            <Box sx={{
              position: 'fixed', bottom: 20, left: '50%',
              transform: 'translateX(-50%)', zIndex: 100
            }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#8B0000', borderRadius: 4,
                  px: 4, py: 1.5, boxShadow: 4,
                  minWidth: 280
                }}
                onClick={() => navigate(`/cart?table=${tableNumber}`)}
              >
                View Cart ({totalItems} items)
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}