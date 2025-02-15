// app/api/zoom/route.ts
import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

async function getZoomToken(userId: string) {
  const supabase = await createClientForServer();
  const { data: tokenData, error: tokenError } = await supabase
    .from('user_zoom_tokens')
    .select('access_token')
    .eq('user_id', userId)
    .maybeSingle();

  if (tokenError || !tokenData) {
    throw new Error('User not connected to Zoom');
  }

  return tokenData.access_token;
}

export async function POST(req: Request) {
  const supabase = await createClientForServer();
  const { topic, meetingStartTime, duration, invitees } = await req.json();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });
  }

  try {
    const zoomToken = await getZoomToken(user.id);
    const inviteesArray = invitees.map((invitee: string) => ({
      email: invitee,
    }));

    const zoomResponse = await fetch(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${zoomToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          type: 2,
          start_time: meetingStartTime,
          duration,
          timezone: 'UTC',
          agenda: `ApprovalIt: ${topic}`,
          settings: {
            meeting_invitees: inviteesArray,
            host_video: true,
            participant_video: true,
            join_before_host: false,
            waiting_room: true,
            mute_upon_entry: true,
            approval_type: 2,
            registrants_email_notification: true,
            registrants_confirmation_email: true,
          },
        }),
      }
    );

    const meetingData = await zoomResponse.json();
    if (!zoomResponse.ok) {
      throw new Error(meetingData.message || 'Failed to create Zoom meeting');
    }

    return NextResponse.json({
      join_url: meetingData.join_url,
      meeting_id: meetingData.id,
      start_time: meetingData.start_time,
      duration: meetingData.duration,
    });
  } catch (error: any) {
    console.error('Zoom API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const supabase = await createClientForServer();
  const { topic, meetingId, meetingStartTime, invitees } = await req.json();

  if (!meetingId || !meetingStartTime) {
    return NextResponse.json(
      { error: 'Missing meetingId or meetingStartTime' },
      { status: 400 }
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });
  }

  try {
    const zoomToken = await getZoomToken(user.id);

    const zoomResponse = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${zoomToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          start_time: meetingStartTime,
          settings: {
            meeting_invitees: invitees.map((invitee: string) => ({
              email: invitee,
            })),
          },
        }),
      }
    );

    if (!zoomResponse.ok) {
      const errorData = await zoomResponse.json();
      throw new Error(errorData.message || 'Failed to update Zoom meeting');
    }

    return NextResponse.json({
      meeting_id: meetingId,
      start_time: meetingStartTime,
      duration: 30,
    });
  } catch (error: any) {
    console.error('Zoom API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const supabase = await createClientForServer();
  const { meetingId } = await req.json();

  if (!meetingId) {
    return NextResponse.json({ error: 'Missing meetingId' }, { status: 400 });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });
  }

  try {
    const zoomToken = await getZoomToken(user.id);

    const zoomResponse = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${zoomToken}`,
        },
      }
    );

    if (!zoomResponse.ok) {
      const errorData = await zoomResponse.json();
      throw new Error(errorData.message || 'Failed to delete Zoom meeting');
    }

    return NextResponse.json({ message: 'Meeting deleted successfully' });
  } catch (error: any) {
    console.error('Zoom API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
