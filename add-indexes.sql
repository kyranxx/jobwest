-- This script adds indexes to foreign keys for better performance.
-- Run this in your Supabase SQL Editor to apply the changes.

-- Index for public.accounts table
CREATE INDEX ON public.accounts ("userId");

-- Index for public.ads table
CREATE INDEX ON public.ads (user_id);

-- Index for public.jobs table
CREATE INDEX ON public.jobs (user_id);

-- Index for public.sessions table
CREATE INDEX ON public.sessions ("userId");
