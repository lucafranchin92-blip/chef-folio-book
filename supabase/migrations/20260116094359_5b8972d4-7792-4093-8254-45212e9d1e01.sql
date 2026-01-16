-- Add DELETE policy to prevent users from deleting their own roles
-- This prevents privilege escalation by role deletion and re-addition
CREATE POLICY "Prevent users from deleting roles"
ON public.user_roles
FOR DELETE
USING (false);