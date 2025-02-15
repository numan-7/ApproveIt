import { useState } from 'react';

export interface ZoomMeeting {
  join_url: string;
  meeting_id: string;
  start_time: string;
  duration: number;
}

export function useZoomMeeting() {
  const [loading, setLoading] = useState(false);
  const [meeting, setMeeting] = useState<ZoomMeeting | null>(null);
  const [error, setError] = useState('');

  const createMeeting = async (params: {
    topic: string;
    meetingStartTime: string;
    duration: number;
    invitees: string[];
  }): Promise<ZoomMeeting | null> => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (res.ok) {
        setMeeting(data);
        return data;
      } else {
        setError(data.error || 'Failed to create Zoom meeting');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error creating Zoom meeting');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMeeting = async (
    meetingId: string,
    params: {
      topic: string;
      meetingStartTime: string;
      duration: number;
      invitees: string[];
    }
  ): Promise<ZoomMeeting | null> => {
    setLoading(true);
    setError('');
    const combinedParams = { meetingId, ...params };
    try {
      const res = await fetch(`/api/zoom`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(combinedParams),
      });
      const data = await res.json();
      if (res.ok) {
        setMeeting(data);
        return data;
      } else {
        setError(data.error || 'Failed to update Zoom meeting');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error updating Zoom meeting');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/zoom`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId }),
      });
      if (res.ok) {
        return true;
      } else {
        console.error('Error deleting meeting:', res.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error deleting meeting', error);
      return false;
    }
  };

  return {
    loading,
    meeting,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  };
}
