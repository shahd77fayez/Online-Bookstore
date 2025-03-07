import process from 'node:process';
import {Server} from 'socket.io';
import connectDB from './DB/connection.js';
import {globalErrorHandling} from './middlewares/ErrorHandling.js';
import bookRouter from './routes/book.routes.js';
import cartRouter from './routes/cart.routes.js';
import notificationRouter from './routes/notification.routes.js';
import orderRouter from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRouter from './routes/review.routes.js';
import userRouter from './routes/user.routes.js';

let io;

export const initApp = (app, express) => {
  // Convert Buffer Data
  app.use(express.json({}));

  // Setup API Routing
  app.use(`/user`, userRouter);
  app.use(`/cart`, cartRouter);
  app.use(`/order`, orderRouter);
  app.use(`/book`, bookRouter);
  app.use(`/review`, reviewRouter);
  app.use(`/notifications`, notificationRouter);
  app.use('/payment', paymentRoutes);

  // Handle Invalid Routes
  app.use('*', (req, res) => {
    console.warn(`Invalid Route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      error: 'Invalid Routing',
      message: `Cannot ${req.method} ${req.originalUrl}`
    });
  });
  // Global Error Handling Middleware
  app.use(globalErrorHandling);

  // Connect to Database
  connectDB();
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};
