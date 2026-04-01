import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Automatically attach token to every request if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const registerUser  = (data) => API.post('/auth/register', data);
export const loginUser     = (data) => API.post('/auth/login', data);

// Tables
export const getAllTables   = ()     => API.get('/tables');
export const createTable    = (data) => API.post('/tables', data);
export const bulkCreateTables = (data) => API.post('/tables/bulk', data);
export const deleteTable    = (id)   => API.delete(`/tables/${id}`);

// Menu
export const getCategories      = ()     => API.get('/menu/categories');
export const createCategory     = (data) => API.post('/menu/categories', data);
export const bulkCreateCategories = (data) => API.post('/menu/categories/bulk', data);
export const deleteCategory     = (id)   => API.delete(`/menu/categories/${id}`);
export const getMenuItems       = ()     => API.get('/menu/items');
export const createMenuItem     = (data) => API.post('/menu/items', data);
export const bulkCreateMenuItems = (data) => API.post('/menu/items/bulk', data);
export const updateMenuItem     = (id, data) => API.patch(`/menu/items/${id}`, data);
export const deleteMenuItem     = (id)   => API.delete(`/menu/items/${id}`);

// Orders
export const placeOrder         = (data) => API.post('/orders', data);
export const getAllOrders        = ()     => API.get('/orders');
export const getOrdersByTable   = (tableId) => API.get(`/orders/table/${tableId}`);
export const updateOrderStatus  = (id, status) => API.patch(`/orders/${id}/status`, { status });