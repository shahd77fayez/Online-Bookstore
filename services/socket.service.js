let io;

export const initSocket = (server) => {
  io = require('socket.io')(server);

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

export const notifyNewOrder = (orderData) => {
  if (io) {
    io.emit('newOrder', orderData);
  }
};

export const notifyOrderStatusChange = (orderId, newStatus) => {
  if (io) {
    io.emit('orderStatusUpdate', {orderId, status: newStatus});
  }
};
