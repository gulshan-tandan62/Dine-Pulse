const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_table', (tableNumber) => {
      socket.join(`table_${tableNumber}`);
      console.log(`Client joined table_${tableNumber}`);
    });

    socket.on('join_kitchen', () => {
      socket.join('kitchen');
      console.log('Kitchen client connected');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { initSocket, getIO };