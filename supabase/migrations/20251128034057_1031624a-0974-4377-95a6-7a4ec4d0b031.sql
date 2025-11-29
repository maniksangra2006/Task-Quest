-- Add categories to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Add spin wheel tracking
CREATE TABLE IF NOT EXISTS public.daily_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reward_type TEXT NOT NULL,
  reward_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, spin_date)
);

ALTER TABLE public.daily_spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own spins"
  ON public.daily_spins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spins"
  ON public.daily_spins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add profile avatar support
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;