import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMinutes: 15 },
  signup: { maxAttempts: 3, windowMinutes: 60 },
  password_reset: { maxAttempts: 3, windowMinutes: 60 },
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identifier, attemptType = "login" } = await req.json();

    if (!identifier) {
      return new Response(
        JSON.stringify({ error: "Identifier is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const config = RATE_LIMITS[attemptType as keyof typeof RATE_LIMITS] || RATE_LIMITS.login;
    const windowStart = new Date(Date.now() - config.windowMinutes * 60 * 1000).toISOString();

    // Count recent attempts
    const { count, error: countError } = await supabaseAdmin
      .from("auth_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("identifier", identifier.toLowerCase())
      .eq("attempt_type", attemptType)
      .gte("attempted_at", windowStart);

    if (countError) {
      console.error("Rate limit check error:", countError);
      // Allow the request if we can't check (fail open for availability)
      return new Response(
        JSON.stringify({ allowed: true, remaining: config.maxAttempts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const attemptCount = count || 0;
    const allowed = attemptCount < config.maxAttempts;
    const remaining = Math.max(0, config.maxAttempts - attemptCount);

    // If allowed, record this attempt
    if (allowed) {
      await supabaseAdmin.from("auth_rate_limits").insert({
        identifier: identifier.toLowerCase(),
        attempt_type: attemptType,
      });
    }

    // Periodically clean up old records (1% chance per request)
    if (Math.random() < 0.01) {
      await supabaseAdmin.rpc("cleanup_old_rate_limits");
    }

    return new Response(
      JSON.stringify({
        allowed,
        remaining: allowed ? remaining - 1 : 0,
        retryAfter: allowed ? null : config.windowMinutes * 60,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open - allow request if rate limiting fails
    return new Response(
      JSON.stringify({ allowed: true, remaining: 5 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
