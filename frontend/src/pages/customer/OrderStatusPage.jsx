import React, { useEffect, useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Button,
  Card, CardContent, Stepper, Step, StepLabel,
  CircularProgress, Alert
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOrdersByTable } from '../../api/index';
import useSocket from '../../hooks/useSocket';

const ORDER_STEPS = ['placed', 'accepted', 'preparing', 'ready', 'served'];

const STEP_LABELS = {
  placed:    'Order Placed',
  accepted:  'Accepted',
  preparing: 'Preparing',
  ready:     'Ready',
  served:    'Served',
};

const STATUS_MESSAGES = {
  placed:    'Your order has been placed! Waiting for confirmation.',
  accepted:  'Great! The kitchen has accepted your order.',
  preparing: 'Your food is being prepared. Sit tight!',
  ready:     'Your order is ready! Waiter will serve you shortly.',
  served:    'Enjoy your meal! Thank you for dining at Pallkhi.',
};

export default function OrderStatusPage() {
  const [searchParams]      = useSearchParams();
  const orderId             = searchParams.get('orderId');
  const tableNumber         = searchParams.get('table');
  const navigate            = useNavigate();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrdersByTable(tableNumber);
        const found = res.data.find(o => o.id === Number(orderId));
        if (found) setOrder(found);
      } catch (err) {
        setError('Failed to load order status');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, tableNumber]);

  // Listen for real-time status updates
  useSocket(tableNumber, {
    'order:status_update': (data) => {
      if (data.orderId === Number(orderId)) {
        setOrder((prev) => prev ? { ...prev, status: data.status } : prev);
      }
    },
  });

  const activeStep = ORDER_STEPS.indexOf(order?.status);

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ backgroundColor: '#8B0000' }}>
        <Toolbar>
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Order Status
          </Typography>
          <Typography variant="body2">Table {tableNumber}</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, maxWidth: 600, margin: '0 auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress sx={{ color: '#8B0000' }} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !order ? (
          <Alert severity="warning">Order not found</Alert>
        ) : (
          <>
            {/* Status Message */}
            <Card sx={{ borderRadius: 2, boxShadow: 1, mb: 3, mt: 2,
              borderTop: '4px solid #8B0000' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h4" mb={1}>
                  {order.status === 'placed'    ? '⏳' :
                   order.status === 'accepted'  ? '✅' :
                   order.status === 'preparing' ? '👨‍🍳' :
                   order.status === 'ready'     ? '🍽️' : '😊'}
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#8B0000" mb={1}>
                  {STEP_LABELS[order.status]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {STATUS_MESSAGES[order.status]}
                </Typography>
              </CardContent>
            </Card>

            {/* Stepper */}
            <Card sx={{ borderRadius: 2, boxShadow: 1, mb: 3 }}>
              <CardContent>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {ORDER_STEPS.map((step) => (
                    <Step key={step}>
                      <StepLabel
                        StepIconProps={{
                          style: {
                            color: ORDER_STEPS.indexOf(step) <= activeStep
                              ? '#8B0000' : undefined
                          }
                        }}
                      >
                        <Typography variant="caption">
                          {STEP_LABELS[step]}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card sx={{ borderRadius: 2, boxShadow: 1, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Order #{order.id}
                </Typography>
                {order.items?.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex',
                    justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                      {item.name} x{item.quantity}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Rs.{(item.price * item.quantity).toFixed(0)}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between',
                  mt: 2, pt: 1, borderTop: '1px solid #eee' }}>
                  <Typography fontWeight="bold">Total</Typography>
                  <Typography fontWeight="bold" color="#8B0000">
                    Rs.{Number(order.totalAmount).toFixed(0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Order More Button */}
            <Button
              variant="outlined" fullWidth size="large"
              sx={{ borderColor: '#8B0000', color: '#8B0000',
                borderRadius: 2, py: 1.5 }}
              onClick={() => navigate(`/menu?table=${tableNumber}`)}
            >
              Order More Items
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}