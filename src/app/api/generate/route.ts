import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { SYSTEM_PROMPT, buildUserPrompt, validateMessage } from '@/lib/prompts';
import { checkRateLimit, logApiUsage } from '@/lib/rate-limit';
import { Deal, Channel, Tone } from '@/types';

// Request validation schema
const requestSchema = z.object({
  deal_id: z.string().uuid(),
  channel: z.enum(['email', 'whatsapp']),
  tone: z.enum(['friendly', 'neutral', 'firm']),
});

// Create Supabase client for server-side operations
function getSupabaseClient(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

// Get user from request
async function getUserFromRequest(request: NextRequest) {
  // Get auth token from cookie
  const authCookie = request.cookies.get('sb-access-token')?.value;
  
  // Alternative: check for auth header
  const authHeader = request.headers.get('Authorization');
  const token = authCookie || authHeader?.replace('Bearer ', '');
  
  if (!token) {
    // Try to get session from Supabase auth cookie
    const supabaseAuthCookie = request.cookies.getAll()
      .find(c => c.name.includes('auth-token'));
    
    if (!supabaseAuthCookie) {
      return null;
    }
  }

  // Create anonymous client to get user
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Parse all auth cookies
  const cookies = request.cookies.getAll();
  const authTokenMatch = cookies.find(c => c.name.endsWith('-auth-token'));
  
  if (authTokenMatch) {
    try {
      const tokenData = JSON.parse(decodeURIComponent(authTokenMatch.value));
      if (tokenData?.access_token) {
        const { data: { user }, error } = await supabase.auth.getUser(tokenData.access_token);
        if (!error && user) {
          return { user, accessToken: tokenData.access_token };
        }
      }
    } catch (e) {
      // Cookie parsing failed, try base64 decode
      try {
        const decoded = Buffer.from(authTokenMatch.value.split('base64-')[1] || '', 'base64').toString();
        const tokenData = JSON.parse(decoded);
        if (tokenData?.access_token) {
          const { data: { user }, error } = await supabase.auth.getUser(tokenData.access_token);
          if (!error && user) {
            return { user, accessToken: tokenData.access_token };
          }
        }
      } catch {
        // Continue to next method
      }
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validate request body
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { deal_id, channel, tone } = parsed.data;

    // 2. Authenticate user
    const authResult = await getUserFromRequest(request);
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user, accessToken } = authResult;
    const supabase = getSupabaseClient(accessToken);

    // 3. Check trial status
    const { data: profile } = await supabase
      .from('profiles')
      .select('trial_active, full_name')
      .eq('id', user.id)
      .single();

    if (!profile?.trial_active) {
      return NextResponse.json(
        { error: 'Trial expired. Please upgrade to continue.' },
        { status: 403 }
      );
    }

    // 4. Rate limiting
    const rateLimit = await checkRateLimit(user.id);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait before generating more messages.',
          reset_at: rateLimit.resetAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
          },
        }
      );
    }

    // 5. Fetch deal (with RLS, only user's own deals)
    const { data: deal, error: dealError } = await supabase
      .from('crm_deals')
      .select('*')
      .eq('id', deal_id)
      .single();

    if (dealError || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // 6. Build prompt
    const agentName = profile.full_name || 'Agent';
    const userPrompt = buildUserPrompt(deal as Deal, channel as Channel, tone as Tone, agentName);

    // 7. Call Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract text content
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    let generatedMessage = textContent.text.trim();

    // 8. Validate message quality
    const validation = validateMessage(generatedMessage, channel as Channel);
    
    if (!validation.valid) {
      // Try one more time with stricter prompt
      const retryResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT + '\n\nIMPORTANT: Keep the message under 100 words. Be very concise.',
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const retryContent = retryResponse.content.find((block) => block.type === 'text');
      if (retryContent && retryContent.type === 'text') {
        generatedMessage = retryContent.text.trim();
      }
    }

    // 9. Save message to database
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    const { data: savedMessage, error: saveError } = await supabase
      .from('crm_messages')
      .insert({
        deal_id,
        user_id: user.id,
        channel,
        tone,
        content: generatedMessage,
        tokens_used: tokensUsed,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving message:', saveError);
    }

    // 10. Log API usage
    await logApiUsage(user.id, '/api/generate', tokensUsed);

    // 11. Return response
    return NextResponse.json(
      {
        content: generatedMessage,
        tokens_used: tokensUsed,
        message_id: savedMessage?.id,
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
          'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Generate API error:', error);

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
