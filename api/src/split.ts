// Splits a bill between members. Pure function: no database, easy to test.
//
// Every member gets floor(total / count). The leftover cents (total % count) go one by one
// to the first members, in the order of memberIds. Example: 1000 between 3 gives 334, 333, 333.
//
// We compute the remainder with % first and divide (total - remainder), which is an exact
// multiple of count. So the division is exact even for very large totals, and the shares
// always add up to totalCents.
export type ShareAmount = { memberId: string; amountCents: number }

export function splitAmongMembers(totalCents: number, memberIds: readonly string[]): ShareAmount[] {
  const count = memberIds.length
  if (count === 0) {
    throw new Error('Cannot split a bill between zero members')
  }

  const remainder = totalCents % count
  const base = (totalCents - remainder) / count

  return memberIds.map((memberId, index) => ({
    memberId,
    amountCents: index < remainder ? base + 1 : base,
  }))
}
