import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const { propertyType, priceType, price, location, beds, baths, area, features, tone } = await req.json();

    // Build the prompt
    const prompt = `Tu es un expert en rédaction immobilière pour le marché français et antillais. 
Génère une description professionnelle et attrayante pour cette annonce immobilière.

**Détails du bien:**
- Type: ${propertyType || "Appartement"}
- Transaction: ${priceType === "rent" ? "Location" : priceType === "vacation" ? "Location saisonnière" : "Vente"}
- Prix: ${price ? new Intl.NumberFormat("fr-FR").format(price) + " €" : "Non spécifié"}
- Localisation: ${location || "Non spécifiée"}
- Chambres: ${beds || "Non spécifié"}
- Salles de bain: ${baths || "Non spécifié"}
- Surface: ${area ? area + " m²" : "Non spécifiée"}
- Équipements: ${features?.length ? features.join(", ") : "Non spécifiés"}

**Style demandé:** ${tone === "luxury" ? "Luxueux et prestigieux" : tone === "friendly" ? "Chaleureux et accueillant" : "Professionnel et informatif"}

Génère une description de 150-200 mots en français, engageante et optimisée pour les portails immobiliers. 
Mets en valeur les points forts du bien et son emplacement.
Ne commence pas par "Bienvenue" ou des formules trop génériques.
Réponds uniquement avec la description, sans commentaires additionnels.`;

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    const description = data.content[0].text;

    return new Response(
      JSON.stringify({ description }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
