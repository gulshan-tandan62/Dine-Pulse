if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDB } = require('./config/db');

require('./models/User');
require('./models/Category');
require('./models/MenuItem');
require('./models/Table');
require('./models/Order');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: '*',
  credentials: false
}));

app.use(express.json());

connectDB();

app.use('/api/auth',   require('./routes/auth.routes'));
app.use('/api/tables', require('./routes/table.routes'));
app.use('/api/menu',   require('./routes/menu.routes'));
app.use('/api/orders', require('./routes/order.routes'));

app.get('/', (req, res) => res.json({ message: 'Dine Pulse API running' }));

const { initSocket } = require('./socket/socket');
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));