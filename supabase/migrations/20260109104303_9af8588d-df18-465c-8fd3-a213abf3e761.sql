-- Create booking requests table
CREATE TABLE public.booking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id UUID NOT NULL REFERENCES public.chef_profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  chef_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own requests
CREATE POLICY "Buyers can view their own requests"
ON public.booking_requests
FOR SELECT
USING (auth.uid() = buyer_id);

-- Buyers can create requests
CREATE POLICY "Buyers can create requests"
ON public.booking_requests
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Chefs can view requests for their profile
CREATE POLICY "Chefs can view requests for their profile"
ON public.booking_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chef_profiles
    WHERE chef_profiles.id = booking_requests.chef_id
    AND chef_profiles.user_id = auth.uid()
  )
);

-- Chefs can update requests for their profile (accept/decline)
CREATE POLICY "Chefs can update requests for their profile"
ON public.booking_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.chef_profiles
    WHERE chef_profiles.id = booking_requests.chef_id
    AND chef_profiles.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_booking_requests_updated_at
BEFORE UPDATE ON public.booking_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();