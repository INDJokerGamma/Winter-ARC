-- Persist the user's preferred goal arrangement.
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS display_order INTEGER;

CREATE INDEX IF NOT EXISTS goals_user_display_order_idx
ON public.goals (user_id, display_order);
