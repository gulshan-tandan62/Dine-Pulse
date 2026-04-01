import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (room, eventHandlers) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL);

    // Join the right room
    if (room === 'kitchen') {
      socketRef.current.emit('join_kitchen');
    } else {
      socketRef.current.emit('join_table', room);
    }

    // Register all event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socketRef.current.on(event, handler);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [room]);

  return socketRef.current;
};

export default useSocket;