import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinEventRoom: (eventId: string) => void;
  leaveEventRoom: (eventId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    // In dev, socket connects to localhost:5050 or window.location.origin
    const socketInstance = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('📡 [Client Socket] Connected to UtsavMitra Realtime Hub:', socketInstance.id);
      setIsConnected(true);

      if (user?._id) {
        socketInstance.emit('join:user', user._id);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 [Client Socket] Disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?._id]);

  const joinEventRoom = (eventId: string) => {
    if (socket && eventId) {
      socket.emit('join:event', eventId);
    }
  };

  const leaveEventRoom = (eventId: string) => {
    if (socket && eventId) {
      socket.emit('leave:event', eventId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinEventRoom, leaveEventRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
