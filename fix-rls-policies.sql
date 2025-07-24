-- This script updates existing RLS policies for better performance.
-- Run this in your Supabase SQL Editor to apply the changes.

-- Fix for public.users table
ALTER POLICY "Allow individual user read access" ON public.users
  USING ((select auth.uid()) = id);

ALTER POLICY "Allow individual user update access" ON public.users
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Fix for public.jobs table
ALTER POLICY "Allow authenticated users to create jobs" ON public.jobs
  WITH CHECK ((select auth.role()) = 'authenticated'::text);

ALTER POLICY "Allow users to update their own jobs" ON public.jobs
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Allow users to delete their own jobs" ON public.jobs
  USING ((select auth.uid()) = user_id);
