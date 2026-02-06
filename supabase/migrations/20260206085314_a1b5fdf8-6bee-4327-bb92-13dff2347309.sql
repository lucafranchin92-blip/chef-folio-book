-- Drop the overly restrictive policy that blocks everyone
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;

-- The existing "Users can view their own profile" policy already handles access correctly:
-- - auth.uid() = user_id means only authenticated users can see their OWN profile
-- - Anonymous users have auth.uid() = NULL, so they can't match any user_id
-- No additional policy needed - the existing one is sufficient