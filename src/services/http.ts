const DEFAULT_TIMEOUT = 8000

export async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

  try {
    const response = await fetch(url, { ...init, signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    return (await response.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}
