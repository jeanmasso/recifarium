import { useEffect, useState } from 'react'

import type { StationSummary, Year } from '../types/models'
import { fetchStationSummary } from '../services/data-service'

interface Options {
  stationId: string | null
  year: Year
}

export function useStationSummary({ stationId, year }: Options) {
  const [data, setData] = useState<StationSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!stationId) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    let mounted = true
    setLoading(true)
    setData(null)

    fetchStationSummary(stationId, year)
      .then((summary) => {
        if (!mounted) return
        setData(summary)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!mounted) return
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setData(null)
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [stationId, year])

  return { data, loading, error }
}
