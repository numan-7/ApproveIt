import { OpenAIEmbeddings } from '@langchain/openai';
import type { Approval } from '@/types/approval';

export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  });
  const vector = await embeddings.embedQuery(text);
  return vector;
}

export async function generateApprovalEmbedding(
  params: Approval
): Promise<number[]> {
  const { name, description, due_date, priority, approvers, zoom_meeting } =
    params;

  const formattedApprovers =
    approvers && approvers.length > 0
      ? approvers.map((a) => `${a.name} (${a.email})`).join(', ')
      : 'No specified approvers.';

  const formattedZoomMeeting =
    zoom_meeting && zoom_meeting.meeting_id
      ? `Zoom meeting scheduled with ID ${zoom_meeting.meeting_id}, starting at ${zoom_meeting.start_time}, lasting ${zoom_meeting.duration} minutes.`
      : 'No Zoom meeting details provided.';

  const dueDateObj = new Date(due_date);
  const weekday = dueDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDueDate = `${weekday}, ${dueDateObj.toLocaleDateString('en-US')}`;

  const textToEmbed = `
    A new approval request titled "${name}" has been submitted.
    Description: ${description}
    This request is labeled as "${priority}" priority and must be addressed by ${formattedDueDate}.
    Individuals involved in approval are: ${formattedApprovers}
    ${formattedZoomMeeting}
  `.trim();

  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  });
  const vector = await embeddings.embedQuery(textToEmbed);
  return vector;
}
