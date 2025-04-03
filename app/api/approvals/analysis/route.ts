import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';
import { generatePrompt } from '@/utils/analysis/analysis';
import { AnalysisResponse } from '@/types/approval';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const supabase = await createClientForServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 403 });
  }

  const body = await req.json();
  const { comments } = body;

  if (!comments) {
    return NextResponse.json(
      { error: 'Comments are required' },
      { status: 400 }
    );
  }

  const prompt = generatePrompt(comments);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini-2024-07-18',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const analysis = response.choices[0].message.content;

  if (!analysis) {
    return NextResponse.json(
      { error: 'Error generating analysis' },
      { status: 500 }
    );
  }

  const cleaned = analysis.replace(/^```json\s*|```$/g, '').trim();

  const json: AnalysisResponse = JSON.parse(cleaned);

  if (!json) {
    return NextResponse.json(
      { error: 'Error parsing analysis response' },
      { status: 500 }
    );
  }

  return NextResponse.json({ json });
}
