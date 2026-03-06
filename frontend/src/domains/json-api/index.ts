import type { JsonapiIncludedItem } from '@/generated/schemas'

export function findIncluded<T>(
  included: JsonapiIncludedItem[] | undefined,
  type: string,
  id: string | undefined,
): T | undefined {
  if (!included || !id) return

  return included.find((r) => r.type === type && r.id === id) as unknown as
    | T
    | undefined
}

export function buildIncludedMap<T>(
  included: JsonapiIncludedItem[] | undefined,
  type: string,
): Map<string, T> {
  return new Map(
    included
      ?.filter((r) => r.type === type)
      .map((r) => [r.id!, r as unknown as T]),
  )
}
