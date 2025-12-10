"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client"
import { useAuth } from "./use-auth"

type Job = {
  id: string;
  title: string;
  location: string;
  created_at: string;
}

type JobsState = {
  jobs: Job[]
  loading: boolean
  error: string | null
}

// Cache for jobs data
let cachedJobs: Job[] | null = null
let lastJobsFetch = 0
const JOBS_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useJobs() {
  const { user } = useAuth()
  const [state, setState] = useState<JobsState>({
    jobs: cachedJobs || [],
    loading: !cachedJobs,
    error: null
  })
  const supabase = getSupabaseBrowserClient()
  const mounted = useRef(true)

  const fetchJobs = useCallback(async (force = false) => {
    if (!user) {
      setState({ jobs: [], loading: false, error: null })
      return
    }

    // Use cached data if available and recent
    if (!force && cachedJobs && Date.now() - lastJobsFetch < JOBS_CACHE_DURATION) {
      setState({ jobs: cachedJobs, loading: false, error: null })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, location, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!mounted.current) return

      if (error) {
        setState({ jobs: [], loading: false, error: error.message })
        return
      }

      const jobs = data as Job[]
      
      // Update cache
      cachedJobs = jobs
      lastJobsFetch = Date.now()
      
      setState({ jobs, loading: false, error: null })
    } catch (err) {
      if (!mounted.current) return
      console.error('Failed to fetch jobs:', err)
      setState({ jobs: [], loading: false, error: 'Failed to load jobs' })
    }
  }, [user, supabase])

  const refetch = useCallback(() => fetchJobs(true), [fetchJobs])

  const invalidateCache = useCallback(() => {
    cachedJobs = null
    lastJobsFetch = 0
    fetchJobs(true)
  }, [fetchJobs])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  return {
    ...state,
    refetch,
    invalidateCache
  }
}
