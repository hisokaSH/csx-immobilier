import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID");
    const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET");

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      throw new Error("Facebook credentials not configured");
    }

    const { code, redirectUri } = await req.json();

    if (!code) {
      throw new Error("No authorization code provided");
    }

    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`;
    
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message || "Failed to get access token");
    }

    const accessToken = tokenData.access_token;

    // Get long-lived token (valid for 60 days instead of 1 hour)
    const longLivedUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${accessToken}`;
    
    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedData = await longLivedResponse.json();

    const longLivedToken = longLivedData.access_token || accessToken;

    // Get user info
    const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${longLivedToken}`);
    const userData = await userResponse.json();

    // Get user's pages
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`);
    const pagesData = await pagesResponse.json();

    const pages = [];

    if (pagesData.data) {
      for (const page of pagesData.data) {
        // Get page's Instagram business account
        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const igData = await igResponse.json();

        pages.push({
          id: page.id,
          name: page.name,
          access_token: page.access_token,
          instagram_business_account: igData.instagram_business_account?.id || null,
        });
      }
    }

    return new Response(
      JSON.stringify({
        access_token: longLivedToken,
        user_id: userData.id,
        user_name: userData.name,
        pages: pages,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Facebook OAuth error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
