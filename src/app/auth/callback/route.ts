import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'email' | 'magiclink' | 'recovery' | null;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app';

  const supabase = await createClient();

  // Handle token_hash (from email templates)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  // Handle code (from OAuth or PKCE flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  // No valid params
  return NextResponse.redirect(`${origin}/login?error=Invalid confirmation link`);
}
