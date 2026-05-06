import { getSupabaseServerClient } from "@/lib/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const checkEmailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await req.json();
    const { email } = checkEmailSchema.parse(body);

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found. Other Supabase errors should not break
      // local/demo registration checks while the database is being finished.
      console.error("Email check failed:", error.message);
      return NextResponse.json({ exists: false, degraded: true });
    }

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Email check failed:", error);
    return NextResponse.json({ exists: false, degraded: true });
  }
}
