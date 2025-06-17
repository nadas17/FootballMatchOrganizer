
-- Add position column to match_participants table
ALTER TABLE public.match_participants 
ADD COLUMN position TEXT CHECK (position IN ('goalkeeper', 'defense', 'midfield', 'attack'));

-- Add position column to match_requests table  
ALTER TABLE public.match_requests
ADD COLUMN position TEXT CHECK (position IN ('goalkeeper', 'defense', 'midfield', 'attack'));
