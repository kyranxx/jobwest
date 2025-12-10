"use client";

import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { generateRandomString } from "@/lib/utils/nonce";

export function useGoogleAuth() {
  const supabase = getSupabaseBrowserClient();

  const handleGoogleSignIn = async () => {
    const codeVerifier = generateRandomString();
    Cookies.set("code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
          code_challenge: codeVerifier,
          code_challenge_method: "S256",
        },
      },
    });
    if (error) {
      toast.error(error.message);
    }
  };

  return { handleGoogleSignIn };
}
