import React, { useEffect, useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Button, Card, CardContent,
  Grid, Chip, Divider, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders, updateOrderStatus } from '../../api/index';
import useSocket from '../../hooks/useSocket';

const STATUS_COLORS = {
  placed:    'warning',
  accepted:  'info',
  preparing: 'primary',
  ready:     'success',
  served:    'default',
};

const NEXT_STATUS = {
  placed:    'accepted',
  accepted:  'preparing',
  preparing: 'ready',
  ready:     'served',
};

const STATUS_LABELS = {
  placed:    'Accept Order',
  accepted:  'Start Preparing',
  preparing: 'Mark Ready',
  ready:     'Mark Served',
};

export default function KitchenDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError]   = useState('');

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data.filter(o => o.status !== 'served'));
    } catch (err) {
      setError('Failed to load orders');
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Real-time socket events
  useSocket('kitchen', {
    'order:new': (data) => {
      setOrders((prev) => [data.order, ...prev]);
    },
    'order:status_update': (data) => {
      setOrders((prev) =>
        data.status === 'served'
          ? prev.filter(o => o.id !== data.orderId)
          : prev.map(o =>
              o.id === data.orderId ? { ...o, status: data.status } : o
            )
      );
    },
  });

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    try {
      await updateOrderStatus(orderId, next);
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const activeOrders   = orders.filter(o =>
    ['placed', 'accepted', 'preparing'].includes(o.status));
  const readyOrders    = orders.filter(o => o.status === 'ready');

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#8B0000' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Pallkhi Kitchen — Live Orders
          </Typography>
          <Button color="inherit" onClick={() => navigate('/admin')}>
            Admin
          </Button>
          <Button color="inherit" onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="h5" color="text.secondary">
              No active orders
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              New orders will appear here instantly
            </Typography>
          </Box>
        ) : (
          <>
            {/* Ready Orders */}
            {readyOrders.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold"
                  sx={{ color: '#2e7d32', mb: 2 }}>
                  Ready to Serve ({readyOrders.length})
                </Typography>
                <Grid container spacing={2}>
                  {readyOrders.map((order) => (
                    <Grid item xs={12} sm={6} md={4} key={order.id}>
                      <OrderCard
                        order={order}
                        onUpdate={handleStatusUpdate}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight="bold"
                  sx={{ color: '#8B0000', mb: 2 }}>
                  Active Orders ({activeOrders.length})
                </Typography>
                <Grid container spacing={2}>
                  {activeOrders.map((order) => (
                    <Grid item xs={12} sm={6} md={4} key={order.id}>
                      <OrderCard
                        order={order}
                        onUpdate={handleStatusUpdate}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

function OrderCard({ order, onUpdate }) {
  const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2,
      borderTop: `4px solid ${
        order.status === 'ready' ? '#2e7d32' :
        order.status === 'preparing' ? '#1976d2' :
        order.status === 'accepted' ? '#0288d1' : '#ed6c02'
      }` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Table {order.table?.tableNumber || order.tableId}
          </Typography>
          <Chip
            label={order.status.toUpperCase()}
            color={STATUS_COLORS[order.status]}
            size="small"
          />
        </Box>

        <Typography variant="caption" color="text.secondary">
          Order #{order.id} · {timeAgo(order.createdAt)}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        {/* Items */}
        {order.items?.map((item, index) => (
          <Box key={index} sx={{ display: 'flex',
            justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">{item.name}</Typography>
            <Typography variant="body2" fontWeight="bold">
              x{item.quantity}
            </Typography>
          </Box>
        ))}

        {order.customerNote && (
          <Box sx={{ mt: 1.5, p: 1, backgroundColor: '#fff8e1',
            borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Note: {order.customerNote}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center' }}>
          <Typography fontWeight="bold" color="#8B0000">
            Rs.{order.totalAmount}
          </Typography>
          {NEXT_STATUS[order.status] && (
            <Button
              size="small"
              variant="contained"
              sx={{ backgroundColor: '#8B0000' }}
              onClick={() => onUpdate(order.id, order.status)}
            >
              {STATUS_LABELS[order.status]}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}   