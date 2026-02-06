import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limit configuration
const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMinutes: 15 },
  signup: { maxAttempts: 3, windowMinutes: 60 },
  password_reset: { maxAttempts: 3, windowMinutes: 60 },
};

// IP-based rate limiting for the endpoint itself
const IP_RATE_LIMIT = {
  maxRequests: 30,
  windowMinutes: 1,
};

// In-memory store for IP rate limiting (resets on function cold start)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function getClientIP(req: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  // Fallback - not ideal but better than nothing
  return "unknown";
}

function checkIPRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);
  
  // Clean up expired records periodically
  if (Math.random() < 0.1) {
    for (const [key, value] of ipRequestCounts.entries()) {
      if (now > value.resetAt) {
        ipRequestCounts.delete(key);
      }
    }
  }
  
  if (!record || now > record.resetAt) {
    ipRequestCounts.set(ip, {
      count: 1,
      resetAt: now + IP_RATE_LIMIT.windowMinutes * 60 * 1000,
    });
    return { allowed: true };
  }
  
  if (record.count >= IP_RATE_LIMIT.maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }
  
  record.count++;
  return { allowed: true };
}

// Send lockout notification email
async function sendLockoutNotification(email: string, attemptType: string, lockoutMinutes: number) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration for notification");
      return;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-lockout-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ email, attemptType, lockoutMinutes }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send lockout notification:", errorText);
    }
  } catch (error) {
    console.error("Error sending lockout notification:", error);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // IP-based rate limiting
  const clientIP = getClientIP(req);
  const ipCheck = checkIPRateLimit(clientIP);
  
  if (!ipCheck.allowed) {
    return new Response(
      JSON.stringify({ 
        error: "Too many requests",
        retryAfter: ipCheck.retryAfter 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Retry-After": String(ipCheck.retryAfter || 60)
        } 
      }
    );
  }

  try {
    const { identifier, attemptType = "login" } = await req.json();

    if (!identifier) {
      return new Response(
        JSON.stringify({ error: "Identifier is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic email format validation to prevent abuse
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(identifier)) {
      return new Response(
        JSON.stringify({ error: "Invalid identifier format" }),
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
    } else {
      // Send lockout notification email (fire and forget)
      sendLockoutNotification(identifier.toLowerCase(), attemptType, config.windowMinutes);
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
