-- Create feedback table for collecting user feedback
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'general')),
    comment TEXT NOT NULL,
    email TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to insert feedback (even non-authenticated users)
CREATE POLICY "Anyone can insert feedback" ON public.feedback
    FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users to view their own feedback
CREATE POLICY "Users can view own feedback" ON public.feedback
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow admins to view all feedback (you can adjust this based on your admin role setup)
CREATE POLICY "Admins can view all feedback" ON public.feedback
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_feedback_updated_at
    BEFORE UPDATE ON public.feedback
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Add comment to table for documentation
COMMENT ON TABLE public.feedback IS 'Stores user feedback including ratings, categories, and comments';
COMMENT ON COLUMN public.feedback.rating IS 'User rating from 1 to 5 stars';
COMMENT ON COLUMN public.feedback.category IS 'Feedback category: bug, feature, or general';
COMMENT ON COLUMN public.feedback.comment IS 'User feedback comment text';
COMMENT ON COLUMN public.feedback.email IS 'Optional email for follow-up';
COMMENT ON COLUMN public.feedback.user_id IS 'Reference to authenticated user if logged in';
COMMENT ON COLUMN public.feedback.page_url IS 'URL of the page where feedback was submitted from';