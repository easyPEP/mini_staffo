import type { ApplicationItemAttributesState } from '@/generated/schemas'

export function stateBadgeVariant(
  state: ApplicationItemAttributesState,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (state) {
    case 'assigned':
      return 'default'
    case 'applied':
      return 'outline'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}
