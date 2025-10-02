const DEFAULT_API_BASE = 'https://data.gouv.nc/api'

const ensureNoTrailingSlash = (value: string) => value.replace(/\/$/, '')

export const env = {
  get apiBase() {
    return ensureNoTrailingSlash(import.meta.env.VITE_API_BASE ?? DEFAULT_API_BASE)
  },
  get apiRecordsBase() {
    const base = this.apiBase
    return base.endsWith('/records/1.0') ? base : `${base}/records/1.0`
  },
  get useFallback() {
    return import.meta.env.VITE_USE_FALLBACK === 'true'
  },
}
