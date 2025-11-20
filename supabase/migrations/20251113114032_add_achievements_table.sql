-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    icon TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    difficulty TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_achievements table (tracks which achievements users have unlocked)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_achievements_difficulty ON public.achievements(difficulty);
CREATE INDEX IF NOT EXISTS idx_achievements_tags ON public.achievements USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- Enable Row Level Security
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements table
-- Everyone can view achievements
CREATE POLICY "Achievements are viewable by everyone"
    ON public.achievements FOR SELECT
    USING (true);

-- Only admins can insert/update/delete achievements
CREATE POLICY "Admins can insert achievements"
    ON public.achievements FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update achievements"
    ON public.achievements FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete achievements"
    ON public.achievements FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for user_achievements table
-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own achievements (unlock)
CREATE POLICY "Users can unlock their own achievements"
    ON public.user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own achievements
CREATE POLICY "Users can delete their own achievements"
    ON public.user_achievements FOR DELETE
    USING (auth.uid() = user_id);

-- Insert initial achievements data
INSERT INTO public.achievements (title, description, tags, icon, points, difficulty, time) VALUES
    ('ようこそ！この素晴らしき神ゲーへ', 'この世に生を受ける', ARRAY['life', 'growth'], '🌟', 0, 'unmeasurable', 'それ以上'),
    ('モラトリアムは終わりだ！！！', '初めて正社員または契約社員として企業に入社した時に取得。アルバイトは対象外', ARRAY['work', 'growth'], '💼', 30, 'normal', '一ヶ月程度'),
    ('俺がバチェラーだ！！！', '大学を卒業した時に取得', ARRAY['study', 'growth'], '🎓', 50, 'normal', '四年程度'),
    ('初めての恋人', '恋愛関係になった相手ができた時に取得', ARRAY['love', 'growth'], '💕', 20, 'unmeasurable', 'それ以上'),
    ('初めてのキスはレモンの味', '初めてキスをした時に取得', ARRAY['love', 'growth'], '💋', 10, 'unmeasurable', 'それ以上'),
    ('私たち...もう別れましょう...', '恋人と別れた時に取得', ARRAY['love', 'growth'], '💑', 10, 'unmeasurable', 'それ以上');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for achievements table
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.achievements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();



