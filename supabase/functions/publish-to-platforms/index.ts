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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header to identify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Invalid token");
    }

    const { listingId, platforms } = await req.json();

    if (!listingId || !platforms?.length) {
      throw new Error("Missing listingId or platforms");
    }

    // Fetch listing
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .eq("user_id", user.id)
      .single();

    if (listingError || !listing) {
      throw new Error("Listing not found");
    }

    // Fetch platform connections
    const { data: connections, error: connError } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("user_id", user.id)
      .in("platform", platforms)
      .eq("status", "connected");

    if (connError) {
      throw new Error("Failed to fetch connections");
    }

    const results: Record<string, { success: boolean; message: string; postId?: string }> = {};

    // Format listing for posting
    const formatPrice = (price: number, type: string) => {
      const formatted = new Intl.NumberFormat("fr-FR").format(price);
      if (type === "rent") return `${formatted} EUR/mois`;
      if (type === "vacation") return `${formatted} EUR/nuit`;
      return `${formatted} EUR`;
    };

    const postMessage = `${listing.title || "Nouvelle annonce"}

${listing.description || ""}

Prix: ${formatPrice(listing.price, listing.price_type)}
Localisation: ${listing.location || "Non precisee"}
${listing.beds ? `Chambres: ${listing.beds}` : ""}
${listing.area ? `Surface: ${listing.area} m2` : ""}
${listing.features?.length ? `Equipements: ${listing.features.join(", ")}` : ""}

Contactez-nous pour plus d'informations!`;

    for (const platform of platforms) {
      const connection = connections?.find((c) => c.platform === platform);

      if (!connection) {
        results[platform] = {
          success: false,
          message: "Plateforme non connectee",
        };
        continue;
      }

      try {
        if (platform === "facebook") {
          // Post to Facebook Page
          const pages = connection.metadata?.pages || [];
          if (pages.length === 0) {
            results[platform] = {
              success: false,
              message: "Aucune Page Facebook connectee",
            };
            continue;
          }

          // Post to first page (could be extended to select page)
          const page = pages[0];
          
          let postData: Record<string, string> = {
            message: postMessage,
            access_token: page.access_token,
          };

          // If listing has images, post as photo
          if (listing.images?.length > 0) {
            const photoResponse = await fetch(
              `https://graph.facebook.com/v18.0/${page.id}/photos`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  url: listing.images[0],
                  caption: postMessage,
                  access_token: page.access_token,
                }),
              }
            );
            const photoData = await photoResponse.json();

            if (photoData.error) {
              throw new Error(photoData.error.message);
            }

            results[platform] = {
              success: true,
              message: `Publie sur ${page.name}`,
              postId: photoData.post_id || photoData.id,
            };
          } else {
            // Text-only post
            const postResponse = await fetch(
              `https://graph.facebook.com/v18.0/${page.id}/feed`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData),
              }
            );
            const postResult = await postResponse.json();

            if (postResult.error) {
              throw new Error(postResult.error.message);
            }

            results[platform] = {
              success: true,
              message: `Publie sur ${page.name}`,
              postId: postResult.id,
            };
          }
        } else if (platform === "instagram") {
          // Post to Instagram via Facebook Page
          const pages = connection.metadata?.pages || connections?.find(c => c.platform === 'facebook')?.metadata?.pages || [];
          const pageWithIG = pages.find((p: any) => p.instagram_business_account);

          if (!pageWithIG) {
            results[platform] = {
              success: false,
              message: "Aucun compte Instagram Business connecte",
            };
            continue;
          }

          if (!listing.images?.length) {
            results[platform] = {
              success: false,
              message: "Instagram necessite au moins une image",
            };
            continue;
          }

          const igAccountId = pageWithIG.instagram_business_account;

          // Create media container
          const containerResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}/media`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                image_url: listing.images[0],
                caption: postMessage,
                access_token: pageWithIG.access_token,
              }),
            }
          );
          const containerData = await containerResponse.json();

          if (containerData.error) {
            throw new Error(containerData.error.message);
          }

          // Publish the container
          const publishResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                creation_id: containerData.id,
                access_token: pageWithIG.access_token,
              }),
            }
          );
          const publishData = await publishResponse.json();

          if (publishData.error) {
            throw new Error(publishData.error.message);
          }

          results[platform] = {
            success: true,
            message: "Publie sur Instagram",
            postId: publishData.id,
          };
        } else {
          // Other platforms - manual only
          results[platform] = {
            success: false,
            message: "Publication automatique non disponible",
          };
        }
      } catch (error) {
        results[platform] = {
          success: false,
          message: error.message || "Erreur de publication",
        };
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Publish error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
