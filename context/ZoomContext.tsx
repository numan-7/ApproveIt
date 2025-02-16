'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ZoomContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => Promise<void>;
  refreshConnection: () => Promise<void>;
  refreshZoomToken: () => Promise<void>;
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export const ZoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);

  const refreshConnection = async () => {
    try {
      const res = await fetch('/api/zoom/is-connected');
      const data = await res.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Error checking Zoom connection', error);
      setIsConnected(false);
    }
  };

  const refreshZoomToken = async () => {
    try {
      const res = await fetch('/api/zoom/refresh', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        console.error('Error refreshing Zoom token:', data.error);
      } else {
        console.log('Zoom token refreshed:', data.refreshed);
      }
    } catch (error) {
      console.error('Error refreshing Zoom token:', error);
    }
  };

  // check every 5 minutes if token is valid
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isConnected) {
      refreshZoomToken();
      intervalId = setInterval(
        () => {
          refreshZoomToken();
        },
        5 * 60 * 1000
      );
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isConnected]);

  useEffect(() => {
    refreshConnection();
  }, []);

  const connect = () => {
    window.location.href = '/api/zoom/connect';
  };

  const disconnect = async () => {
    try {
      const res = await fetch('/api/zoom/disconnect', { method: 'POST' });
      if (res.ok) {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error disconnecting Zoom', error);
    }
  };

  return (
    <ZoomContext.Provider
      value={{
        isConnected,
        connect,
        disconnect,
        refreshConnection,
        refreshZoomToken,
      }}
    >
      {children}
    </ZoomContext.Provider>
  );
};

export const useZoom = () => {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
};
