import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getAuthSession } from '@/lib/auth-fetch'

export const Route = createFileRoute('/_authenticated/users')({
  beforeLoad: () => {
    const session = getAuthSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: () => <Outlet />,
})
