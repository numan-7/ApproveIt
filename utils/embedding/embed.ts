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
  const {
    name,
    description,
    requester,
    due_date,
    priority,
    approvers,
    zoom_meeting,
  } = params;

  const formattedApprovers =
    approvers && approvers.length > 0
      ? approvers.map((a) => `${a.name} (${a.email})`).join('; ')
      : 'No specified approvers';

  let zoomDetails = 'No Zoom meeting details provided';
  if (zoom_meeting && zoom_meeting.meeting_id) {
    zoomDetails =
      `Zoom meeting ID: ${zoom_meeting.meeting_id}, starts at: ${zoom_meeting.start_time}, ` +
      `duration: ${zoom_meeting.duration} minutes`;
  }

  // Format due date with weekday
  const dueDateObj = new Date(due_date);
  const weekday = dueDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDueDate = `${weekday}, ${dueDateObj.toLocaleDateString('en-US')}`;

  const textToEmbed = `
    Approval Request:
    • Title: "${name}"
    • Description: ${description}
    • Requester: ${requester}
    • Priority Level: ${priority}
    • Approvers: ${formattedApprovers}
    • Due Date: ${formattedDueDate}
    • Zoom Meeting: ${zoomDetails}
  `.trim();

  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  });
  const vector = await embeddings.embedQuery(textToEmbed);
  return vector;
}
