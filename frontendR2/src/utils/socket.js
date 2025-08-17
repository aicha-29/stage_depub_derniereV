<<<<<<< HEAD
=======

>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
