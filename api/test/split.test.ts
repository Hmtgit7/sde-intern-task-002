import { describe, expect, it } from 'vitest'
import { splitAmongMembers } from '../src/split'

const ids = (count: number) => Array.from({ length: count }, (_, index) => `m${index}`)
const amounts = (total: number, count: number) =>
  splitAmongMembers(total, ids(count)).map((share) => share.amountCents)
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

describe('splitAmongMembers', () => {
  it('splits evenly when the amount divides', () => {
    expect(amounts(3000, 3)).toEqual([1000, 1000, 1000])
  })

  it('gives the extra cents to the first members, one each', () => {
    expect(amounts(1000, 3)).toEqual([334, 333, 333])
    expect(amounts(1001, 3)).toEqual([334, 334, 333])
  })

  it('gives a zero share when there are fewer cents than members', () => {
    expect(amounts(2, 3)).toEqual([1, 1, 0])
    expect(amounts(1, 4)).toEqual([1, 0, 0, 0])
  })

  it('keeps the member order', () => {
    expect(splitAmongMembers(10, ['a', 'b', 'c']).map((share) => share.memberId)).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('always adds up to the total', () => {
    for (const total of [1, 2, 7, 99, 100, 1000, 100001, 999_999_937]) {
      for (const count of [1, 2, 3, 4, 7, 13]) {
        expect(sum(amounts(total, count))).toBe(total)
      }
    }
  })

  it('stays exact for the largest safe integer', () => {
    const total = Number.MAX_SAFE_INTEGER
    const result = amounts(total, 7)
    expect(sum(result)).toBe(total)
    expect(Math.max(...result) - Math.min(...result)).toBeLessThanOrEqual(1)
  })

  it('throws for zero members', () => {
    expect(() => splitAmongMembers(100, [])).toThrow()
  })
})
