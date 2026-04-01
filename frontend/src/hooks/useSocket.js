import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (room, eventHandlers) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL);

    if (room === 'kitchen') {
      socketRef.current.emit('join_kitchen');
    } else {
      socketRef.current.emit('join_table', room);
    }

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socketRef.current.on(event, handler);
    });

    return () => {
      socketRef.current.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  return socketRef.current;
};

export default useSocket;