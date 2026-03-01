import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { ENV } from "./env.js"
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [ENV.CLIENT_URL],
        credentials: true,
    },
});

// Apply authentication middleware to all incoming socket connections
io.use(socketAuthMiddleware);

// Store online users and their socket IDs
const userSocketMap = {}; //{userId:socketId}

// Usw socket.io to listen for events from clients
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.fullName} (ID: ${socket.user._id})`);

    // Update the online user list
    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    // io.emit is used to send events to all connected clients, including the sender
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Send the list of online user IDs to all clients

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.fullName}`);

        // Remove the user from the online user list
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Update the list of online user IDs for all clients
    });
});

export { io, app, server };