import { getSupabaseServerClient } from "@/lib/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // After successful login, ensure a user profile exists in the public.users table
      const { error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile does not exist, so create it
        const { error: createProfileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata.name,
            image: data.user.user_metadata.picture, // Default to Google avatar
          });

        if (createProfileError) {
          console.error('Error creating user profile:', createProfileError);
          // Redirect to an error page even if profile creation fails
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }
      } else if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }

      // Redirect to dashboard after successful login
      return NextResponse.redirect(`${origin}/ucet`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
