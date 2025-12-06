-- Create page_views table to track visitor sessions
CREATE TABLE public.page_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_views table to track product visits
CREATE TABLE public.product_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_visitor_id ON public.page_views(visitor_id);
CREATE INDEX idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX idx_product_views_created_at ON public.product_views(created_at DESC);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow anonymous inserts for tracking
CREATE POLICY "Anyone can insert page views" 
ON public.page_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view page views" 
ON public.page_views 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert product views" 
ON public.product_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view product views" 
ON public.product_views 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));