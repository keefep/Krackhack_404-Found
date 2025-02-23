import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config';

const socket: Socket = io(API_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export const connectSocket = (token: string) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;
