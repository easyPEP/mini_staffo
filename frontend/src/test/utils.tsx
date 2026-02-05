import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import type { RenderOptions } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { UserItem } from '@/generated/schemas'

type AuthContextValue = {
  authSession: { email: string; password: string; subdomain: string } | null
  currentUser: UserItem | null
  isAuthenticated: boolean
  login: (email: string, password: string, subdomain: string) => Promise<void>
  logout: () => void
  refreshCurrentUser: () => Promise<void>
}

export const mockUser: UserItem = {
  id: '1',
  type: 'user',
  attributes: {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'staff',
    created_at: '2024-01-01T00:00:00Z',
  },
}

export const mockAdminUser: UserItem = {
  id: '2',
  type: 'user',
  attributes: {
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
  },
}

export const mockManagerUser: UserItem = {
  id: '3',
  type: 'user',
  attributes: {
    email: 'manager@example.com',
    first_name: 'Manager',
    last_name: 'User',
    role: 'manager',
    created_at: '2024-01-01T00:00:00Z',
  },
}

const createMockAuthContext = (
  overrides: Partial<AuthContextValue> = {},
): AuthContextValue => ({
  authSession: {
    email: 'test@example.com',
    password: 'password',
    subdomain: 'test',
  },
  currentUser: mockUser,
  isAuthenticated: true,
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn(),
  refreshCurrentUser: vi.fn().mockResolvedValue(undefined),
  ...overrides,
})

// Mock auth context module
const mockAuthContextValue = createMockAuthContext()

vi.mock('@/lib/auth', () => ({
  useAuth: () => mockAuthContextValue,
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}))

export function setMockAuth(overrides: Partial<AuthContextValue>) {
  Object.assign(mockAuthContextValue, createMockAuthContext(overrides))
}

export function resetMockAuth() {
  Object.assign(mockAuthContextValue, createMockAuthContext())
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

type WrapperProps = {
  children: ReactNode
}

function createWrapper() {
  const queryClient = createTestQueryClient()

  return function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  authOverrides?: Partial<AuthContextValue>
}

function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
) {
  const { authOverrides, ...renderOptions } = options

  if (authOverrides) {
    setMockAuth(authOverrides)
  }

  return render(ui, {
    wrapper: createWrapper(),
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render }
export { createTestQueryClient }
