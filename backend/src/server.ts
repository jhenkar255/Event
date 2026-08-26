import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/database';
import { SocketService } from './services/socketService';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Create HTTP Server
    const server = http.createServer(app);

    // Initialize Socket.IO real-time communication
    SocketService.initialize(server);

    server.listen(PORT, () => {
      console.log(`
      🪔 =================================================== 🪔
         UTSAVMITRA – AI-Powered Indian Event Management Platform
         "Plan. Celebrate. Remember."
      🪔 =================================================== 🪔
      🚀 Server running on: http://localhost:${PORT}
      📡 API Health:        http://localhost:${PORT}/api/health
      🔌 Real-Time Socket:  Port ${PORT} Ready
      🌟 Environment:       ${process.env.NODE_ENV || 'development'}
      =======================================================
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start UtsavMitra Server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
