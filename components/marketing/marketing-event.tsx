"use client"

import { useEffect, useRef } from "react"
import { trackMarketingEvent } from "@/lib/marketing-events"

type MarketingEventProps = {
  name: string
  params?: Record<string, unknown>
  enabled?: boolean
}

export function MarketingEvent({ name, params = {}, enabled = true }: MarketingEventProps) {
  const sentRef = useRef(false)
  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    if (!enabled || sentRef.current) return

    sentRef.current = true
    trackMarketingEvent(name, params)
  }, [enabled, name, params, paramsKey])

  return null
}
