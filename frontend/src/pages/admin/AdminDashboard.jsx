import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography,
  Button, AppBar, Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders, getAllTables, getCategories } from '../../api/index';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalTables: 0,
    totalCategories: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, tablesRes, categoriesRes] = await Promise.all([
          getAllOrders(),
          getAllTables(),
          getCategories(),
        ]);
        const orders = ordersRes.data;
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter(o =>
            ['placed', 'accepted', 'preparing'].includes(o.status)
          ).length,
          totalTables: tablesRes.data.length,
          totalCategories: categoriesRes.data.length,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, color: '#1976d2' },
    { label: 'Active Orders', value: stats.pendingOrders, color: '#ed6c02' },
    { label: 'Total Tables', value: stats.totalTables, color: '#2e7d32' },
    { label: 'Menu Categories', value: stats.totalCategories, color: '#9c27b0' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#8B0000' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Pallkhi Restaurant — Admin
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Dashboard Overview
        </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} mb={4}>
          {statCards.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Navigation Cards */}
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Manage
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{ borderRadius: 3, boxShadow: 2, cursor: 'pointer',
                '&:hover': { boxShadow: 6 } }}
              onClick={() => navigate('/admin/tables')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h2">🪑</Typography>
                <Typography variant="h6" fontWeight="bold" mt={1}>
                  Tables
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage restaurant tables and QR codes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              sx={{ borderRadius: 3, boxShadow: 2, cursor: 'pointer',
                '&:hover': { boxShadow: 6 } }}
              onClick={() => navigate('/admin/menu')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h2">🍽️</Typography>
                <Typography variant="h6" fontWeight="bold" mt={1}>
                  Menu
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage categories and food items
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              sx={{ borderRadius: 3, boxShadow: 2, cursor: 'pointer',
                '&:hover': { boxShadow: 6 } }}
              onClick={() => navigate('/kitchen')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h2">👨‍🍳</Typography>
                <Typography variant="h6" fontWeight="bold" mt={1}>
                  Kitchen
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View live orders and update status
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}