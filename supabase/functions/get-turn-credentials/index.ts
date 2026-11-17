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
    const TURN_TOKEN_ID = Deno.env.get("CLOUDFLARE_TURN_TOKEN_ID") || Deno.env.get("TURN_TOKEN_ID");
    const TURN_API_TOKEN = Deno.env.get("CLOUDFLARE_TURN_API_TOKEN") || Deno.env.get("TURN_API_TOKEN");

    if (!TURN_TOKEN_ID || !TURN_API_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Missing secrets: CLOUDFLARE_TURN_TOKEN_ID / CLOUDFLARE_TURN_API_TOKEN" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const response = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${TURN_TOKEN_ID}/credentials/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TURN_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ttl: 86400 }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Cloudflare API rejected request", status: response.status, details: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
