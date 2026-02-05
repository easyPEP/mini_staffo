import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuthSession } from '@/lib/auth-fetch'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const session = getAuthSession()
    if (session) {
      throw redirect({ to: '/schedules' })
    } else {
      throw redirect({ to: '/login' })
    }
  },
})
