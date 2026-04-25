import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return []; // not used for exchange
          },
          setAll(cookiesToSet) {
            // not used for exchange
          },
        },
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the intended page or dashboard
  return NextResponse.redirect(`${origin}${next}`);
}
