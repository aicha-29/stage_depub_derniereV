import { io } from 'socket.io-client';
import { getToken } from './auth';

const socket = io('http://localhost:5000', {
  autoConnect: false,
  withCredentials: true,
  auth: (cb) => {
    const token = getToken();
    cb({ token });
  }
});

export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.auth = { userId };
    socket.connect();
    
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      socket.emit('joinUserRoom', userId);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;