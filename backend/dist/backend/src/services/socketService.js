"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
class SocketService {
    static io = null;
    static initialize(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.CLIENT_URL || '*',
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });
        this.io.on('connection', (socket) => {
            console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);
            // Join event room for live command center & attendee updates
            socket.on('join:event', (eventId) => {
                socket.join(`event_${eventId}`);
                console.log(`📡 [Socket.IO] Client ${socket.id} joined room event_${eventId}`);
            });
            socket.on('leave:event', (eventId) => {
                socket.leave(`event_${eventId}`);
                console.log(`📡 [Socket.IO] Client ${socket.id} left room event_${eventId}`);
            });
            // Join user specific room for personal notifications
            socket.on('join:user', (userId) => {
                socket.join(`user_${userId}`);
            });
            // Live stream ping to track live viewer count
            socket.on('stream:viewer_ping', ({ eventId }) => {
                const room = `event_${eventId}`;
                const count = SocketService.io?.sockets.adapter.rooms.get(room)?.size || 1;
                SocketService.io?.to(room).emit('stream:viewers_count', { count });
            });
            socket.on('disconnect', () => {
                console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
            });
        });
        return this.io;
    }
    static emitToEvent(eventId, eventName, data) {
        if (this.io) {
            this.io.to(`event_${eventId}`).emit(eventName, data);
        }
    }
    static emitToUser(userId, eventName, data) {
        if (this.io) {
            this.io.to(`user_${userId}`).emit(eventName, data);
        }
    }
    static broadcast(eventName, data) {
        if (this.io) {
            this.io.emit(eventName, data);
        }
    }
}
exports.SocketService = SocketService;
