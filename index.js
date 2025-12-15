import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { verifyToken } from "./src/helper/jwt.js";
import {
    adminSentNotification,
} from "./src/socket/onboardNotification.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_MODE || "development";

// ✅ ALWAYS create server
const server = http.createServer(app);

// ✅ Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// 🔐 Optional Socket Auth
/*
io.use((socket, next) => {
  try {
    const token = socket.handshake.headers?.token;
    if (!token) return next(new Error("Token missing"));

    const decoded = verifyToken(token);
    socket.user = decoded;

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});
*/

io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("send-notification-to-business-owner", async (data) => {
        try {
            const result = await adminSentNotification(data, socket.user);
            io.emit("receive-user-notification", result);
        } catch (err) {
            socket.emit("error", err.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 Socket disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (${MODE})`);
});
