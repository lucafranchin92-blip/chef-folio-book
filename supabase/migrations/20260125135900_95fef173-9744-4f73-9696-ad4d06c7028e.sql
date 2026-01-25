-- Create table to track authentication attempts for rate limiting
CREATE TABLE public.auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- email or IP address
  attempt_type text NOT NULL DEFAULT 'login', -- login, signup, password_reset
  attempted_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_auth_rate_limits_identifier_time 
ON public.auth_rate_limits (identifier, attempted_at DESC);

-- Enable RLS but allow edge function access via service role
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access - only accessible via service role in edge function
CREATE POLICY "No public access to rate limits"
ON public.auth_rate_limits
FOR ALL
USING (false);

-- Create function to clean up old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.auth_rate_limits
  WHERE attempted_at < now() - interval '1 hour';
END;
$$;