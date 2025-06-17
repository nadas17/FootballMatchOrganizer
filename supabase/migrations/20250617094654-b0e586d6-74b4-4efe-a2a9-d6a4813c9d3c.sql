
-- Add creator information to matches table
ALTER TABLE public.matches 
ADD COLUMN creator_id UUID,
ADD COLUMN creator_nickname TEXT;

-- Create match_requests table for handling join requests
CREATE TABLE public.match_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  participant_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for better performance
CREATE INDEX idx_match_requests_match_id ON public.match_requests(match_id);
CREATE INDEX idx_match_requests_status ON public.match_requests(status);

-- Enable Row Level Security
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read match requests (for now, since we don't have auth)
CREATE POLICY "Anyone can view match requests" 
  ON public.match_requests 
  FOR SELECT 
  USING (true);

-- Allow anyone to insert match requests
CREATE POLICY "Anyone can create match requests" 
  ON public.match_requests 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to update match requests (for approval/rejection)
CREATE POLICY "Anyone can update match requests" 
  ON public.match_requests 
  FOR UPDATE 
  USING (true);
