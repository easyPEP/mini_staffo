import type { UserItemAttributes } from '@/generated/schemas'

export type UserType = UserItemAttributes

export function fullName(user: UserType): string {
  return [user.first_name, user.last_name].filter(Boolean).join(' ')
}
