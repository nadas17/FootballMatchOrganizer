-- Fix security issue: restrict profiles SELECT to authenticated users only

-- Drop previous authenticated policy if exists (idempotent)
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Drop overly permissive public policy if still present
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Ensure RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create new SELECT policy for authenticated users
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);