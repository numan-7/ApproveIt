interface Comment {
  id: string;
  approval_id: string;
  user_email: string;
  comment: string;
  created_at: Date;
  name: string;
}

export const generatePrompt = (comments: Comment[]) => {
  return `
    You are a political sentiment analysis assistant. You will be given a list of comments related to the same proposal (indicated by the same approval_id). Your task is to:

    Analyze all the comments.

    Determine which ones are in agreement with the proposal and which are in disagreement.

    For each group, write a summary of the main arguments or opinions expressed by those people.

    Include any common tones or attitudes in each group (e.g., excited, sarcastic, frustrated).

    Return the result as a JSON object in the following format:

    Here is a list of comments you are to analyze:

    ${JSON.stringify(comments, null, 2)}

    After analyzing the comments, return the result in the following format JSON ONLY:

    There should only be 3 points AT MOST in each group.

    If there are no points that can be made for a side, DO NOT Make up anything, just return an empty points array for that side.
    
    {
      "agree_summary": {
        "points": [

        ]
      },
      "disagree_summary": {
        "points": [

        ]
      }
    }
  `;
};
