import { getSupabaseServerClient } from "@/lib/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const checkEmailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

function emailCheckUnavailable() {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ exists: false, degraded: true });
  }

  return NextResponse.json(
    { error: "Kontrola e-mailu je momentálne nedostupná." },
    { status: 503 },
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = checkEmailSchema.parse(body);

    if (process.env.NODE_ENV === "production") {
      // Production email checks must not enumerate accounts.
      return NextResponse.json({ exists: false, checked: false });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Email check failed:", error.message);
      return emailCheckUnavailable();
    }

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Email check failed:", error);
    return emailCheckUnavailable();
  }
}
