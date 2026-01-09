import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role for rate limiting
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_RATE_LIMIT = 10; // requests per minute

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const supabase = getServiceClient();
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const rateLimit = parseInt(process.env.RATE_LIMIT_PER_MINUTE || String(DEFAULT_RATE_LIMIT), 10);

  // Count requests in the current window
  const { count, error } = await supabase
    .from('crm_api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', '/api/generate')
    .gte('created_at', windowStart.toISOString());

  if (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if we can't check
    return {
      allowed: true,
      remaining: rateLimit,
      resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
    };
  }

  const currentCount = count || 0;
  const allowed = currentCount < rateLimit;

  return {
    allowed,
    remaining: Math.max(0, rateLimit - currentCount),
    resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
  };
}

export async function logApiUsage(
  userId: string,
  endpoint: string,
  tokensEstimate: number
): Promise<void> {
  const supabase = getServiceClient();

  const { error } = await supabase.from('crm_api_usage').insert({
    user_id: userId,
    endpoint,
    tokens_estimate: tokensEstimate,
  });

  if (error) {
    console.error('Failed to log API usage:', error);
  }
}
