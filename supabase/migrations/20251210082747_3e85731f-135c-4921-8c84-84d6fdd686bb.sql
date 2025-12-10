-- Create table to store device push tokens
CREATE TABLE public.push_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    device_token TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to store sent notifications history
CREATE TABLE public.push_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    sent_by UUID REFERENCES auth.users(id),
    recipients_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

-- Anyone can register their device token (public insert)
CREATE POLICY "Anyone can register device token"
ON public.push_tokens
FOR INSERT
WITH CHECK (true);

-- Only admins can view tokens
CREATE POLICY "Admins can view tokens"
ON public.push_tokens
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can manage notifications
CREATE POLICY "Admins can manage notifications"
ON public.push_notifications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_push_tokens_updated_at
BEFORE UPDATE ON public.push_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();