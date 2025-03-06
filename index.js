import dotenv from "dotenv"
dotenv.config();

import { createServer } from 'http';
import express from "express"
import {initApp} from "./index.router.js"
import { initSocket } from "./index.router.js";
const app = express();
const httpServer = createServer(app);

initApp(app, express);  // Initialize routes and middleware
initSocket(httpServer); // Initialize WebSocket


const port = process.env.PORT;
httpServer.listen(port, () => {
    console.log(`Server is Up & Running on http://localhost:${port}`);
});