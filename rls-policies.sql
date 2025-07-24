-- Enable RLS on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to read their own profile
CREATE POLICY "Allow individual user read access"
ON public.users
FOR SELECT
USING ((select auth.uid()) = id);

-- Create a policy to allow users to update their own profile
CREATE POLICY "Allow individual user update access"
ON public.users
FOR UPDATE
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

-- Enable RLS on the jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated users to create jobs
CREATE POLICY "Allow authenticated users to create jobs"
ON public.jobs
FOR INSERT
WITH CHECK ((select auth.role()) = 'authenticated'::text);

-- Create a policy to allow users to update their own jobs
CREATE POLICY "Allow users to update their own jobs"
ON public.jobs
FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- Create a policy to allow users to delete their own jobs
CREATE POLICY "Allow users to delete their own jobs"
ON public.jobs
FOR DELETE
USING ((select auth.uid()) = user_id);
