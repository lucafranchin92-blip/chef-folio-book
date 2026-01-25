-- Prevent users from modifying their assigned roles (defense in depth)
CREATE POLICY "Prevent users from updating roles"
ON public.user_roles
FOR UPDATE
USING (false);