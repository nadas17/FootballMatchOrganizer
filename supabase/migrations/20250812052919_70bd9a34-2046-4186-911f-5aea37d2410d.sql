-- Restrict public access to profiles table
-- 1) Drop overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 2) Ensure RLS is enabled (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3) Create SELECT policy limited to authenticated users only
CREATE POLICY IF NOT EXISTS "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Keep existing insert/update self policies intact
-- No further changes required
