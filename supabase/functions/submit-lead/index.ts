import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { listingId, name, email, phone, message, source } = await req.json();

    // Validate required fields
    if (!listingId || !name || (!email && !phone)) {
      return new Response(
        JSON.stringify({ error: "Nom et email ou telephone requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the listing to find the owner
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, user_id, title")
      .eq("id", listingId)
      .eq("status", "active")
      .single();

    if (listingError || !listing) {
      return new Response(
        JSON.stringify({ error: "Annonce non trouvee" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        user_id: listing.user_id,
        listing_id: listing.id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        message: message?.trim() || null,
        source: source || "website",
        status: "new",
      })
      .select()
      .single();

    if (leadError) {
      console.error("Lead creation error:", leadError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'envoi" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TODO: Send email notification to listing owner
    // This could be done via Supabase Edge Function + Resend/SendGrid

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Votre demande a ete envoyee avec succes",
        leadId: lead.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Submit lead error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
