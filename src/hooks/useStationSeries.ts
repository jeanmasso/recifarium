import { useEffect, useState } from 'react'

import type { TaxonSeries } from '../types/models'
import { fetchStationSeries } from '../services/data-service'

export function useStationSeries(stationId: string | null) {
  const [data, setData] = useState<TaxonSeries[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!stationId) {
      setData([])
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)
    setData([])

    fetchStationSeries(stationId)
      .then((series) => {
        if (!mounted) return
        setData(series)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!mounted) return
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setData([])
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [stationId])

  return { data, loading, error }
}
