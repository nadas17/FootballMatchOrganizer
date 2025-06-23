
-- Add team column to match_requests table
ALTER TABLE public.match_requests 
ADD COLUMN team TEXT CHECK (team IN ('A', 'B'));
