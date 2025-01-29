"use server";

import { createClientForServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import type { Provider } from "@supabase/supabase-js";

const signInWith = (provider: Provider) => async (): Promise<void> => {
  const supabase = await createClientForServer();
  const auth_callback_url = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`;

  console.log("auth_callback_url", auth_callback_url);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: auth_callback_url,
    },
  });

  if (error) {
    console.error(`Error signing in with ${provider}:`, error.message);
    return;
  }

  if (data?.url) {
    redirect(data.url);
  } else {
    console.error("Error: data.url is null");
  }
};

const signInWithGoogle = signInWith("google");

export { signInWithGoogle };
