-- Fix 1: Block anonymous/public access to profiles table
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
FOR SELECT 
TO anon
USING (false);

-- Fix 2: Make booking_id NOT NULL in reviews and add validation
-- First, delete any reviews without booking_id (if any exist)
DELETE FROM public.reviews WHERE booking_id IS NULL;

-- Then alter the column to be NOT NULL
ALTER TABLE public.reviews 
ALTER COLUMN booking_id SET NOT NULL;

-- Add RLS policy to verify booking belongs to buyer and is completed/accepted
CREATE POLICY "Buyers can only review their completed bookings" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  auth.uid() = buyer_id 
  AND EXISTS (
    SELECT 1 FROM public.booking_requests br
    WHERE br.id = booking_id
    AND br.buyer_id = auth.uid()
    AND br.status IN ('accepted', 'completed')
  )
);

-- Drop the old permissive insert policy and replace with the new one
DROP POLICY IF EXISTS "Buyers can create reviews" ON public.reviews;