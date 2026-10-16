import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', process.env.CLIENT_URL].filter(Boolean),
    credentials: true,
  },
  pingTimeout: 60000,
});

setupSocketHandlers(io);
app.set('io', io);

// Connect DB and listen
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] EduConnect server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
};

startServer();
