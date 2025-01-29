import { NextResponse } from "next/server";
import { createClientForServer } from "@/utils/supabase/server";

// https://supabase.com/docs/guides/auth/social-login/auth-google?queryGroups=environment&environment=client
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard"; 

  if (code) {
    const supabase = await createClientForServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}