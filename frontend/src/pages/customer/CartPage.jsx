import React, { useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Button, Card, CardContent,
  Divider, IconButton, TextField, Alert, CircularProgress
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeOrder, getAllTables } from '../../api/index';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart,
          clearCart, totalAmount } = useCart();
  const navigate                  = useNavigate();
  const [searchParams]            = useSearchParams();
  const tableNumber               = searchParams.get('table');
  const [note, setNote]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');
    try {
      // Get tableId from tableNumber
      const tablesRes = await getAllTables();
      const table = tablesRes.data.find(
        t => t.tableNumber === Number(tableNumber)
      );
      if (!table) {
        setError('Table not found. Please scan the QR code again.');
        setLoading(false);
        return;
      }

      const orderData = {
        tableId: table.id,
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount,
        customerNote: note,
      };

      const res = await placeOrder(orderData);
      clearCart();
      navigate(`/order-status?orderId=${res.data.order.id}&table=${tableNumber}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ backgroundColor: '#8B0000' }}>
        <Toolbar>
          <Button color="inherit"
            onClick={() => navigate(`/menu?table=${tableNumber}`)}>
            Back
          </Button>
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1,
            textAlign: 'center' }}>
            Your Cart
          </Typography>
          <Typography variant="body2">
            Table {tableNumber}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, maxWidth: 600, margin: '0 auto' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {cart.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="h6" color="text.secondary">
              Your cart is empty
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2, backgroundColor: '#8B0000' }}
              onClick={() => navigate(`/menu?table=${tableNumber}`)}
            >
              Browse Menu
            </Button>
          </Box>
        ) : (
          <>
            {/* Cart Items */}
            <Card sx={{ borderRadius: 2, boxShadow: 1, mb: 2 }}>
              <CardContent>
                {cart.map((item, index) => (
                  <Box key={item.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', py: 1.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight="bold">{item.name}</Typography>
                        <Typography variant="body2" color="#8B0000">
                          Rs.{item.price} each
                        </Typography>
                      </Box>

                      {/* Quantity Controls */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton size="small"
                          sx={{ border: '1px solid #8B0000', color: '#8B0000',
                            width: 28, height: 28 }}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </IconButton>
                        <Typography fontWeight="bold" sx={{ minWidth: 20,
                          textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton size="small"
                          sx={{ border: '1px solid #8B0000', color: '#8B0000',
                            width: 28, height: 28 }}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </IconButton>
                      </Box>

                      <Typography fontWeight="bold" sx={{ ml: 2, minWidth: 70,
                        textAlign: 'right' }}>
                        Rs.{(item.price * item.quantity).toFixed(0)}
                      </Typography>
                    </Box>
                    {index < cart.length - 1 && <Divider />}
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Note */}
            <TextField
              label="Special instructions (optional)"
              placeholder="E.g. less spicy, no onion..."
              fullWidth multiline rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Bill Summary */}
            <Card sx={{ borderRadius: 2, boxShadow: 1, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  Bill Summary
                </Typography>
                {cart.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex',
                    justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.name} x{item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      Rs.{(item.price * item.quantity).toFixed(0)}
                    </Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight="bold" variant="h6">Total</Typography>
                  <Typography fontWeight="bold" variant="h6" color="#8B0000">
                    Rs.{totalAmount.toFixed(0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              variant="contained"
              fullWidth size="large"
              disabled={loading}
              sx={{ backgroundColor: '#8B0000', borderRadius: 2, py: 1.5 }}
              onClick={handlePlaceOrder}
            >
              {loading
                ? <CircularProgress size={24} color="inherit" />
                : `Place Order — Rs.${totalAmount.toFixed(0)}`
              }
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}