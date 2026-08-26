import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

export class SocketService {
  private static io: SocketIOServer | null = null;

  public static initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

      // Join event room for live command center & attendee updates
      socket.on('join:event', (eventId: string) => {
        socket.join(`event_${eventId}`);
        console.log(`📡 [Socket.IO] Client ${socket.id} joined room event_${eventId}`);
      });

      socket.on('leave:event', (eventId: string) => {
        socket.leave(`event_${eventId}`);
        console.log(`📡 [Socket.IO] Client ${socket.id} left room event_${eventId}`);
      });

      // Join user specific room for personal notifications
      socket.on('join:user', (userId: string) => {
        socket.join(`user_${userId}`);
      });

      // Live stream ping to track live viewer count
      socket.on('stream:viewer_ping', ({ eventId }: { eventId: string }) => {
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

  public static emitToEvent(eventId: string, eventName: string, data: any): void {
    if (this.io) {
      this.io.to(`event_${eventId}`).emit(eventName, data);
    }
  }

  public static emitToUser(userId: string, eventName: string, data: any): void {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(eventName, data);
    }
  }

  public static broadcast(eventName: string, data: any): void {
    if (this.io) {
      this.io.emit(eventName, data);
    }
  }
}
