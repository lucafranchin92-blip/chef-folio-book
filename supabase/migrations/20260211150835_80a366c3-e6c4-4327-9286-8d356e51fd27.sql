
-- Add explicit anonymous access denial to user_roles for defense in depth
CREATE POLICY "Block anonymous access to user roles"
ON public.user_roles
FOR ALL
TO anon
USING (false);
