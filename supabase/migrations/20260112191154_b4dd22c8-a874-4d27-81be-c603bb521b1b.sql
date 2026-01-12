-- Add chef_reply column to reviews
ALTER TABLE public.reviews ADD COLUMN chef_reply TEXT;
ALTER TABLE public.reviews ADD COLUMN chef_reply_at TIMESTAMP WITH TIME ZONE;

-- Allow chefs to update reviews for their profile (to add replies)
CREATE POLICY "Chefs can reply to reviews for their profile"
ON public.reviews
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chef_profiles
    WHERE chef_profiles.id = reviews.chef_id
    AND chef_profiles.user_id = auth.uid()
  )
);