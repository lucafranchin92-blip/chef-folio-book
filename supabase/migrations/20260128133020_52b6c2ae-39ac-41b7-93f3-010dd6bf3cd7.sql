-- Allow buyers to update their own requests ONLY while pending
CREATE POLICY "Buyers can update their own pending requests"
ON public.booking_requests
FOR UPDATE
USING (
  auth.uid() = buyer_id 
  AND status = 'pending'
);