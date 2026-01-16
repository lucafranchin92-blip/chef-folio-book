-- Add DELETE policies to protect against unauthorized deletions

-- 1. booking_requests: Allow buyers to delete only their own PENDING requests
CREATE POLICY "Buyers can delete their own pending requests"
ON public.booking_requests
FOR DELETE
USING (auth.uid() = buyer_id AND status = 'pending');

-- 2. reviews: Prevent all deletions - reviews should be permanent for platform integrity
CREATE POLICY "Reviews cannot be deleted"
ON public.reviews
FOR DELETE
USING (false);

-- 3. chef_profiles: Prevent all deletions - profiles should be deactivated not deleted
CREATE POLICY "Chef profiles cannot be deleted"
ON public.chef_profiles
FOR DELETE
USING (false);

-- 4. profiles: Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);