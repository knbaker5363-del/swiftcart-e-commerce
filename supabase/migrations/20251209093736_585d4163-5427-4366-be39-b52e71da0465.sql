-- Add announcement bar settings
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS announcement_enabled boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS announcement_messages jsonb DEFAULT '[
  {"icon": "truck", "text": "توصيل مجاني للطلبات فوق 200₪"},
  {"icon": "gift", "text": "اشتري بقيمة 100₪ واحصل على هدية مجانية!"},
  {"icon": "sparkles", "text": "عروض حصرية يومياً - تابعنا!"}
]'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS announcement_bg_color text DEFAULT 'primary';

-- Add checkout feature badges settings
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS checkout_badges_enabled boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS checkout_badges jsonb DEFAULT '[
  {"icon": "truck", "label": "توصيل سريع", "enabled": true},
  {"icon": "shield", "label": "دفع آمن", "enabled": true},
  {"icon": "clock", "label": "24/7 دعم", "enabled": true},
  {"icon": "gift", "label": "هدايا مجانية", "enabled": true}
]'::jsonb;

-- Add gift display mode
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS gift_display_mode text DEFAULT 'button';

-- Add background animation control
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS background_animation_type text DEFAULT 'none';