// src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ActiveUser {
  socketId: string;
  country: string;
  connectedAt: string;
}

interface UserStatistics {
  totalUsers: number;
  countries: Record<string, number>;
  countryCount: number;
  uniqueIps: number;
  pages: Record<string, number>;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics>({
    totalUsers: 0,
    countries: {},
    countryCount: 0,
    uniqueIps: 0,
    pages: {}
  });
  const [notifications, setNotifications] = useState<Array<{
    type: 'connect' | 'disconnect';
    message: string;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL);
    socketInstance.on('connect', () => {
      // Report current page view
      socketInstance.emit('page_view', window.location.pathname);
    });

    socketInstance.on('active_users', (users: ActiveUser[]) => {
      setActiveUsers(users);
    });

    socketInstance.on('user_statistics', (stats: UserStatistics) => {
      setStatistics(stats);
    });

    socketInstance.on('user_connected', (user: { country: string }) => {
      setNotifications(prev => [
        ...prev,
        { 
          type: 'connect',
          message: `New visitor from ${user.country}`,
          timestamp: new Date()
        }
      ]);
    });

    socketInstance.on('user_disconnected', (user: { country: string }) => {
      setNotifications(prev => [
        ...prev,
        { 
          type: 'disconnect',
          message: `Visitor from ${user.country} left`,
          timestamp: new Date()
        }
      ]);
    });

    setSocket(socketInstance);

    // Track page changes
    const handleRouteChange = (url: string) => {
      socketInstance.emit('page_view', url);
    };

    window.addEventListener('popstate', () => {
      handleRouteChange(window.location.pathname);
    });

    return () => {
      socketInstance.disconnect();
      window.removeEventListener('popstate', () => {
        handleRouteChange(window.location.pathname);
      });
    };
  }, []);

  return { socket, activeUsers, statistics, notifications };
};