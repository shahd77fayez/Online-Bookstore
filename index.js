import dotenv from "dotenv"
dotenv.config({path:"./config/.env"});

import { createServer } from 'http';
import express from "express"
import morgan from "morgan";
import logger from "./middlewares/logger.js";
import {initApp} from "./index.router.js"
import { initSocket } from "./index.router.js";
import { createDefaultAdmins } from "./controllers/user.controller.js"; 
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
});