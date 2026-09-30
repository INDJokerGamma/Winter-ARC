-- Store one reflection per user and calendar day.
CREATE TABLE IF NOT EXISTS public.daily_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reflection_date DATE NOT NULL,
    productivity INTEGER NOT NULL CHECK (productivity BETWEEN 1 AND 5),
    energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 5),
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, reflection_date)
);

ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily reflections"
    ON public.daily_reflections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily reflections"
    ON public.daily_reflections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily reflections"
    ON public.daily_reflections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily reflections"
    ON public.daily_reflections FOR DELETE
    USING (auth.uid() = user_id);
