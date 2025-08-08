// import { io } from 'socket.io-client';

// const socket = io('http://localhost:5001', {
//   autoConnect: false,
//   reconnection: true,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
//   withCredentials: true
// });

// let isInitialized = false;

// export const initSocket = (token) => {
//   if (!isInitialized) {
//     socket.auth = { token };
//     socket.connect();
//     isInitialized = true;
//   }
//   return socket;
// };

// export default socket;
// utils/socket.js
import { io } from 'socket.io-client';
let socket = null;

export function getSocket(token, userId) {
  if (!socket) {
    socket = io('http://localhost:5001', {
      auth: { token },
      withCredentials: true,
      reconnection: true,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('joinUserRoom', userId);
      console.log(`User ${userId} joined room user_${userId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }
  return socket;
}
