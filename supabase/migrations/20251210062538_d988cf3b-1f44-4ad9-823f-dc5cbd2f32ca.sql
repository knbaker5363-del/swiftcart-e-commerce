-- Add expires_at field to special_offers table
ALTER TABLE public.special_offers 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;