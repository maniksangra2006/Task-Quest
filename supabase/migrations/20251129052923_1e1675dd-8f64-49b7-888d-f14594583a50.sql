-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create avatars table
CREATE TABLE IF NOT EXISTS public.avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  unlock_requirement_type TEXT NOT NULL,
  unlock_requirement_value INTEGER NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on avatars
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view avatars
CREATE POLICY "Avatars are viewable by everyone"
ON public.avatars FOR SELECT
USING (true);

-- Create user_avatars table to track unlocked avatars
CREATE TABLE IF NOT EXISTS public.user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_id UUID NOT NULL REFERENCES public.avatars(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, avatar_id)
);

-- Enable RLS on user_avatars
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own unlocked avatars
CREATE POLICY "Users can view their own unlocked avatars"
ON public.user_avatars FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can unlock avatars
CREATE POLICY "Users can insert their own unlocked avatars"
ON public.user_avatars FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add combo fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_combo INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS highest_combo INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS selected_avatar_id UUID REFERENCES public.avatars(id);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Insert default avatars
INSERT INTO public.avatars (name, image_url, unlock_requirement_type, unlock_requirement_value, rarity) VALUES
('Starter', 'default-1', 'tasks_completed', 0, 'common'),
('Bronze Achiever', 'bronze-achiever', 'tasks_completed', 10, 'common'),
('Silver Star', 'silver-star', 'tasks_completed', 25, 'uncommon'),
('Gold Champion', 'gold-champion', 'tasks_completed', 50, 'rare'),
('Platinum Master', 'platinum-master', 'tasks_completed', 100, 'epic'),
('Streak Warrior', 'streak-warrior', 'current_streak', 7, 'uncommon'),
('Combo King', 'combo-king', 'highest_combo', 10, 'rare'),
('Point Collector', 'point-collector', 'total_points', 500, 'uncommon'),
('Elite Performer', 'elite-performer', 'total_points', 1000, 'epic'),
('Legendary Hero', 'legendary-hero', 'total_points', 2500, 'legendary');
