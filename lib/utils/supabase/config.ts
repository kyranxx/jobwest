import { z } from "zod";
import { supabaseConfig as clientSupabaseConfig } from "./client-config";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: "Invalid Supabase URL in environment variables.",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: "Missing Supabase anon key in environment variables.",
  }),
});

const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: clientSupabaseConfig.url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: clientSupabaseConfig.anonKey,
});

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables.");
}

export const supabaseConfig = {
  url: parsedEnv.data.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: parsedEnv.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
