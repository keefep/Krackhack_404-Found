import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketServer;

export const initializeSocket = (server: HTTPServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(`user_${userId}`);
    }

    socket.on('disconnect', () => {
      if (userId) {
        socket.leave(`user_${userId}`);
      }
    });
  });

  return io;
};

export { io };
