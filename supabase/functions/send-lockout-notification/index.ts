import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LockoutNotificationRequest {
  email: string;
  attemptType: "login" | "signup";
  lockoutMinutes: number;
}

// IP-based rate limiting for the endpoint itself
const IP_RATE_LIMIT = {
  maxRequests: 5,
  windowMinutes: 5,
};

// In-memory store for IP rate limiting
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
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

const handler = async (req: Request): Promise<Response> => {
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);
    const { email, attemptType, lockoutMinutes }: LockoutNotificationRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const attemptTypeLabel = attemptType === "login" ? "sign-in" : "sign-up";
    
    const emailResponse = await resend.emails.send({
      from: "Security <noreply@resend.dev>",
      to: [email],
      subject: "Security Alert: Account Temporarily Locked",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 48px; height: 48px; background-color: #fef2f2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🔒</span>
              </div>
            </div>
            
            <h1 style="color: #111827; font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 16px;">
              Account Temporarily Locked
            </h1>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              We detected multiple failed ${attemptTypeLabel} attempts on your account. For your security, we've temporarily locked access.
            </p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>Your account will be unlocked in ${lockoutMinutes} minutes.</strong>
              </p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              If this was you, please wait and try again later. If you've forgotten your password, you can reset it from the login page.
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              <strong>If this wasn't you</strong>, someone may be trying to access your account. We recommend:
            </p>
            
            <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; padding-left: 20px; margin-bottom: 24px;">
              <li>Changing your password immediately once access is restored</li>
              <li>Using a strong, unique password</li>
              <li>Reviewing any recent account activity</li>
            </ul>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              This is an automated security notification. Please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending lockout notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

Deno.serve(handler);
