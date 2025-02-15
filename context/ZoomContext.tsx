'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ZoomContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => Promise<void>;
  createMeeting: (params: {
    topic: string;
    meetingStartTime: string;
    duration: number;
    invitees: string[];
  }) => Promise<{ join_url: string; meeting_id: string } | null>;
  refreshConnection: () => Promise<void>;
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

  useEffect(() => {
    refreshConnection();
  }, []);

  const connect = () => {
    window.location.href = '/api/zoom/connect';
  };

  const disconnect = async () => {
    try {
      const res = await fetch('/api/zoom/disconnect', {
        method: 'POST',
      });
      if (res.ok) {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error disconnecting Zoom', error);
    }
  };

  const createMeeting = async (params: {
    topic: string;
    meetingStartTime: string;
    duration: number;
    invitees: string[];
  }) => {
    try {
      const res = await fetch('/api/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (res.ok) {
        return data;
      } else {
        console.error('Error creating meeting:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error creating meeting', error);
      return null;
    }
  };

  return (
    <ZoomContext.Provider
      value={{
        isConnected,
        connect,
        disconnect,
        createMeeting,
        refreshConnection,
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
