"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const socketService_1 = require("./services/socketService");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Create HTTP Server
        const server = http_1.default.createServer(app_1.default);
        // Initialize Socket.IO real-time communication
        socketService_1.SocketService.initialize(server);
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
    }
    catch (error) {
        console.error('❌ Failed to start UtsavMitra Server:', error);
        process.exit(1);
    }
};
if (process.env.NODE_ENV !== 'test') {
    startServer();
}
exports.default = app_1.default;
