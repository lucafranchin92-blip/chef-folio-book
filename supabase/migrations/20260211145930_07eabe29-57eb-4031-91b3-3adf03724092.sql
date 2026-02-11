
-- Re-create the INSERT policy that only allows role assignment if user has NO existing role
-- This prevents privilege escalation by blocking users from adding multiple roles
CREATE POLICY "Users can insert their own role once"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()
  )
);
