import dotenv from "dotenv"
import path from "path"
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from "express"
import intiApp from "./index.router.js"

dotenv.config({path:"./config/.env"});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const port = process.env.PORT;

intiApp(app, express);

// Export io instance for use in other files
export const getIO = () => io;

httpServer.listen(port, () => {
    console.log(`Server is Up & Running on http://localhost:${port}`);
});