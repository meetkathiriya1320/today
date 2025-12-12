import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { verifyToken } from './src/helper/jwt.js';
import db from './src/models/index.js';
import { adminSentNotification, onboardNotification, sendRequestBybusiness } from './src/socket/onboardNotification.js';
dotenv.config();

const PORT = process.env.PORT || 5000;
const mode = process.env.NODE_MODE

let server;
const is_dev = mode === "development"
if (is_dev) {
    server = http.createServer(app)
}

const io = new Server(server, {
    cors: {
        origin: '*', // or specific frontend URL
        methods: ['GET', 'POST']
    }
});

// io.use(async (socket, next) => {
//     try {
//         const token = socket.handshake.headers?.token;   // preferred

//         // if (!token) {
//         //     return next(new Error("Authentication token missing"));
//         // }

//         // Verify JWT
//         const decoded = verifyToken(token)

//         // Attach user data to socket
//         socket.user = decoded;

//         next(); // allow connection

//     } catch (err) {
//         console.log("❌ Socket auth error:", err.message);
//         next(new Error("Unauthorized"));
//     }
// });


io.on('connection', (socket) => {
    console.log('🟢 A user connected:', socket.id);

    socket.on('send-notification-to-business-owner', async (data) => {
        try {
            const updated_data = await adminSentNotification(data, socket.user);
            io.emit('receive-user-notification', updated_data);
        } catch (error) {
            io.emit('error', error.message);
        }
    });

    // When client disconnects
    socket.on('disconnect', () => {
        console.log('🔴 A user disconnected:', socket.id);
    });
});


server.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
