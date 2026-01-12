-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id UUID NOT NULL REFERENCES public.chef_profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  booking_id UUID REFERENCES public.booking_requests(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Buyers can create reviews for completed bookings
CREATE POLICY "Buyers can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Everyone can view reviews
CREATE POLICY "Everyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Buyers can update their own reviews
CREATE POLICY "Buyers can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = buyer_id);

-- Function to update chef rating after review
CREATE OR REPLACE FUNCTION public.update_chef_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chef_profiles
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE chef_id = NEW.chef_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE chef_id = NEW.chef_id)
  WHERE id = NEW.chef_id;
  RETURN NEW;
END;
$$;

-- Trigger to auto-update ratings
CREATE TRIGGER update_chef_rating_on_review
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_chef_rating();

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;