import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';
import { generateEmbedding } from '@/utils/embedding/embed';

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
  const { query, type } = body;

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const searchType = type || 'incoming';

  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc('match_approvals', {
    query_embedding: queryEmbedding,
    user_email: user.email,
    search_type: searchType,
    match_count: 15,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
