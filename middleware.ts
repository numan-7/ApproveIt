import { NextResponse } from "next/server";
import { createClientForServer } from "@/utils/supabase/server";

export async function middleware(req: Request) {
  const supabase = await createClientForServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow access to the protected route
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};