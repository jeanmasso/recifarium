import { useEffect, useState } from 'react'

import type { Station } from '../types/models'
import { fetchStations } from '../services/data-service'

export function useStations() {
  const [data, setData] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true
    fetchStations()
      .then((stations) => {
        if (!mounted) return
        setData(stations)
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
  }, [])

  return { data, loading, error }
}
