import dotenv from "dotenv"
dotenv.config({path:"./config/.env"});

import { createServer } from 'http';
import express from "express"
import morgan from "morgan";
import logger from "./middlewares/logger.js";
import {initApp} from "./index.router.js"
import { initSocket } from "./index.router.js";
import { createDefaultAdmins } from "./controllers/user.controller.js"; 
import { notificationController } from "./controllers/notification.controller.js";
const app = express();
const httpServer = createServer(app);

// Integrate Morgan with Winston
const stream = {
    write: (message) => logger.info(message.trim()) // Send logs from Morgan to Winston
};
app.use(morgan("combined", { stream })); // Log requests using Morgan
  
initApp(app, express);  // Initialize routes and middleware
initSocket(httpServer); // Initialize WebSocket


const port = process.env.PORT;
httpServer.listen(port, async() => {
    console.log(`Server is Up & Running on http://localhost:${port}`);
    await createDefaultAdmins();
    
    // Set up scheduled notification cleanup task (runs daily at midnight)
    const runNotificationCleanup = async () => {
        try {
            const deletedCount = await notificationController.cleanupOldNotifications();
            logger.info(`Scheduled cleanup: Removed ${deletedCount} old notifications`);
        } catch (error) {
            logger.error(`Error in scheduled notification cleanup: ${error.message}`);
        }
    };
    
    // Run cleanup once at startup
    await runNotificationCleanup();
    
    // Schedule daily cleanup at midnight
    setInterval(runNotificationCleanup, 24 * 60 * 60 * 1000);
    logger.info('Notification cleanup scheduled to run daily');
});