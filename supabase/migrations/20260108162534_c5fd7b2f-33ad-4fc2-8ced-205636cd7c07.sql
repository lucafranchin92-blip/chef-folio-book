-- Create chef_profiles table
CREATE TABLE public.chef_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  image_url TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  price_range TEXT NOT NULL DEFAULT '$$',
  location TEXT NOT NULL,
  experience TEXT NOT NULL,
  description TEXT NOT NULL,
  cuisines TEXT[] NOT NULL DEFAULT '{}',
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chef_profiles ENABLE ROW LEVEL SECURITY;

-- Chefs can view their own profile
CREATE POLICY "Chefs can view their own profile"
ON public.chef_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Chefs can insert their own profile
CREATE POLICY "Chefs can insert their own profile"
ON public.chef_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'chef'));

-- Chefs can update their own profile
CREATE POLICY "Chefs can update their own profile"
ON public.chef_profiles
FOR UPDATE
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'chef'));

-- Everyone can view chef profiles (for marketplace)
CREATE POLICY "Everyone can view chef profiles"
ON public.chef_profiles
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_chef_profiles_updated_at
BEFORE UPDATE ON public.chef_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for chef images
INSERT INTO storage.buckets (id, name, public) VALUES ('chef-images', 'chef-images', true);

-- Storage policies for chef images
CREATE POLICY "Anyone can view chef images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'chef-images');

CREATE POLICY "Chefs can upload their images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'chef-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Chefs can update their images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'chef-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Chefs can delete their images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'chef-images' AND auth.uid()::text = (storage.foldername(name))[1]);