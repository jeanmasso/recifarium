import { describe, expect, it } from 'vitest'

import { YEARS } from './models'

describe('YEARS constant', () => {
  it('contains expected year range', () => {
    expect(YEARS.at(0)).toBe(2012)
    expect(YEARS.at(-1)).toBe(2024)
    expect(new Set(YEARS).size).toBe(13)
  })
})
