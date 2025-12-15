import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { verifyToken } from './src/helper/jwt.js';
import db from './src/models/index.js';
import { adminSentNotification, onboardNotification, sendRequestBybusiness } from './src/socket/onboardNotification.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const mode = process.env.NODE_MODE || "development";

// ✅ ALWAYS create server
const server = http.createServer(app);

// Socket.IO init
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// 🔐 Socket auth (optional – uncomment when needed)
/*
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.headers?.token;
        if (!token) {
            return next(new Error("Authentication token missing"));
        }

        const decoded = verifyToken(token);
        socket.user = decoded;

        next();
    } catch (err) {
        console.log("❌ Socket auth error:", err.message);
        next(new Error("Unauthorized"));
    }
});
*/

io.on('connection', (socket) => {
    console.log('🟢 A user connected:', socket.id);

    socket.on('send-notification-to-business-owner', async (data) => {
        try {
            const updated_data = await adminSentNotification(data, socket.user);
            io.emit('receive-user-notification', updated_data);
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔴 A user disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀 (${mode})`);
});
