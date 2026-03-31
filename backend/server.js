const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Load all models here so they register before sync
require('./models/User');
require('./models/Category');
require('./models/MenuItem');
require('./models/Table');
require('./models/Order');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth',   require('./routes/auth.routes'));
app.use('/api/tables', require('./routes/table.routes'));
app.use('/api/menu',   require('./routes/menu.routes'));
app.use('/api/orders', require('./routes/order.routes'));

app.get('/', (req, res) => res.json({ message: 'Hotel Engine API running' }));

const initSocket = require('./socket/socket');
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));