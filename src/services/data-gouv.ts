import { env } from '../lib/env'
import { getJson } from './http'

interface DataGouvRecord<T> {
  fields: T
}

interface DataGouvResponse<T> {
  records: DataGouvRecord<T>[]
  nhits?: number
}

type ParamValue = string | number | Array<string | number>

type QueryParams = Record<string, ParamValue>

const DEFAULT_ROWS = 500

const appendParams = (url: URL, params: QueryParams = {}) => {
  Object.entries(params).forEach(([key, rawValue]) => {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue]
    values.forEach((value) => {
      url.searchParams.append(key, String(value))
    })
  })
}

export async function fetchDatasetRecords<T>(dataset: string, params: QueryParams = {}): Promise<T[]> {
  const rows = Number(params.rows ?? DEFAULT_ROWS)
  const sanitizedParams = { ...params }
  delete (sanitizedParams as Record<string, unknown>).rows

  let start = 0
  const results: T[] = []
  let totalHits: number | undefined

  do {
    const url = new URL(`${env.apiRecordsBase}/search/`)
    url.searchParams.set('dataset', dataset)
    url.searchParams.set('rows', String(rows))
    if (start > 0) {
      url.searchParams.set('start', String(start))
    }

    appendParams(url, sanitizedParams)

    const response = await getJson<DataGouvResponse<T>>(url.toString())
    const fields = response.records?.map((record) => record.fields) ?? []
    results.push(...fields)

    totalHits = response.nhits ?? totalHits
    start += rows

    if (!response.records || response.records.length < rows) {
      break
    }
  } while (typeof totalHits === 'number' && start < totalHits)

  return results
}
