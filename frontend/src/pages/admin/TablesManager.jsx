import React, { useEffect, useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Button, Card, CardContent,
  Grid, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllTables, bulkCreateTables, deleteTable } from '../../api/index';

export default function TablesManager() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [dialog, setDialog]     = useState(false);
  const [from, setFrom]         = useState('');
  const [to, setTo]             = useState('');
  const [qrDialog, setQrDialog] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await getAllTables();
      setTables(res.data);
    } catch (err) {
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleBulkCreate = async () => {
    try {
      await bulkCreateTables({ from: Number(from), to: Number(to) });
      setFrom('');
      setTo('');
      setDialog(false);
      fetchTables();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tables');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this table?')) return;
    try {
      await deleteTable(id);
      fetchTables();
    } catch (err) {
      setError('Failed to delete table');
    }
  };

  const showQr = (table) => {
    setSelectedQr(table);
    setQrDialog(true);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#8B0000' }}>
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Tables Manager
          </Typography>
          <Button color="inherit" onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            {tables.length} Tables
          </Typography>
          <Button variant="contained" onClick={() => setDialog(true)}
            sx={{ backgroundColor: '#8B0000' }}>
            + Add Tables
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {tables.map((table) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={table.id}>
                <Card sx={{ borderRadius: 2, boxShadow: 1, textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold" color="#8B0000">
                      {table.tableNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Table
                    </Typography>
                    <Chip
                      label={table.isActive ? 'Active' : 'Inactive'}
                      color={table.isActive ? 'success' : 'error'}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button size="small" variant="outlined"
                        sx={{ borderColor: '#8B0000', color: '#8B0000' }}
                        onClick={() => showQr(table)}>
                        View QR
                      </Button>
                      <Button size="small" variant="outlined" color="error"
                        onClick={() => handleDelete(table.id)}>
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Add Tables Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)}>
        <DialogTitle>Add Tables</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter a range of table numbers to create
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="From" type="number" value={from}
              onChange={(e) => setFrom(e.target.value)}
              sx={{ width: 100 }}
            />
            <TextField
              label="To" type="number" value={to}
              onChange={(e) => setTo(e.target.value)}
              sx={{ width: 100 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkCreate} variant="contained"
            sx={{ backgroundColor: '#8B0000' }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialog} onClose={() => setQrDialog(false)}>
        <DialogTitle>Table {selectedQr?.tableNumber} — QR Code</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {selectedQr?.qrCode && (
            <Box>
              <img
                src={selectedQr.qrCode}
                alt={`Table ${selectedQr.tableNumber} QR`}
                style={{ width: 250, height: 250 }}
              />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Customer scans this to view the menu
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialog(false)}>Close</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#8B0000' }}
            onClick={() => {
              const link = document.createElement('a');
              link.download = `table-${selectedQr?.tableNumber}-qr.png`;
              link.href = selectedQr?.qrCode;
              link.click();
            }}
          >
            Download QR
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}