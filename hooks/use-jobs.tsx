"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client"
import { useAuth } from "./use-auth"
import { siteConfig } from "@/lib/site"
import type { JobSummary } from "@/lib/types"

type JobsState = {
  jobs: JobSummary[]
  loading: boolean
  error: string | null
}

const JOBS_CACHE_DURATION = 5 * 60 * 1000
type JobsCacheEntry = {
  jobs: JobSummary[]
  fetchedAt: number
}

const jobsCache = new Map<string, JobsCacheEntry>()

export function useJobs() {
  const { user } = useAuth()

  const cachedEntry = user ? jobsCache.get(user.id) : null
  const [state, setState] = useState<JobsState>({
    jobs: cachedEntry?.jobs ?? [],
    loading: Boolean(user) && !cachedEntry,
    error: null
  })
  const supabase = getSupabaseBrowserClient()
  const mounted = useRef(true)

  const fetchJobs = useCallback(async (force = false) => {
    if (!user) {
      setState({ jobs: [], loading: false, error: null })
      return
    }

    const cachedEntry = jobsCache.get(user.id)
    if (!force && cachedEntry && Date.now() - cachedEntry.fetchedAt < JOBS_CACHE_DURATION) {
      setState({ jobs: cachedEntry.jobs, loading: false, error: null })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, location, created_at')
        .eq('user_id', user.id)
        .eq('portal_code', siteConfig.portalCode)
        .order('created_at', { ascending: false })

      if (!mounted.current) return

      if (error) {
        setState({ jobs: [], loading: false, error: error.message })
        return
      }

      const jobs: JobSummary[] = (data ?? []).map((job) => ({
        id: job.id,
        title: job.title,
        location: job.location ?? "",
        created_at: job.created_at ?? new Date().toISOString(),
      }))
      jobsCache.set(user.id, { jobs, fetchedAt: Date.now() })
      setState({ jobs, loading: false, error: null })
    } catch (err) {
      if (!mounted.current) return
      console.error('Failed to fetch jobs:', err)
      setState({ jobs: [], loading: false, error: 'Failed to load jobs' })
    }
  }, [user, supabase])

  const refetch = useCallback(() => fetchJobs(true), [fetchJobs])

  const invalidateCache = useCallback(() => {
    if (user) {
      jobsCache.delete(user.id)
    }
    fetchJobs(true)
  }, [fetchJobs, user])

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
