import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import type { QueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { Navigation } from '@/components/navigation'

type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen">
      {isAuthenticated ? <Navigation /> : null}
      <Outlet />
      <Toaster position="top-right" />
      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </div>
  )
}
