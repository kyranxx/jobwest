"use client";

import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client";
import { toast } from "sonner";

export function useGoogleAuth() {
  const supabase = getSupabaseBrowserClient();

  const handleGoogleSignIn = async () => {
    const configuredRef = process.env.NEXT_PUBLIC_SUPABASE_URL
      ?.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1];
    const anonKeyRef = (() => {
      try {
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!key) return null;
        const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return payload.ref as string | undefined;
      } catch {
        return null;
      }
    })();

    if (configuredRef && anonKeyRef && configuredRef !== anonKeyRef) {
      toast.error("Supabase URL a anon key sú z rozdielnych projektov.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      toast.error(error.message);
    }
  };

  return { handleGoogleSignIn };
}
