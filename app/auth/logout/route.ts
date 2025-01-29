import { NextResponse } from "next/server";
import { createClientForServer } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  const supabase = await createClientForServer();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error.message);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(new URL("/", origin));
}