/* eslint-disable import/first, import/order */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

// Define mock values before mocks
const mockUser = {
  id: '1',
  type: 'user' as const,
  attributes: {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'staff' as const,
    created_at: '2024-01-01T00:00:00Z',
  },
}

const mockAdminUser = {
  id: '2',
  type: 'user' as const,
  attributes: {
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin' as const,
    created_at: '2024-01-01T00:00:00Z',
  },
}

const mockManagerUser = {
  id: '3',
  type: 'user' as const,
  attributes: {
    email: 'manager@example.com',
    first_name: 'Manager',
    last_name: 'User',
    role: 'manager' as const,
    created_at: '2024-01-01T00:00:00Z',
  },
}

let currentMockUser:
  | typeof mockUser
  | typeof mockAdminUser
  | typeof mockManagerUser = mockUser
let mockLogoutFn = vi.fn()

const mockNavigate = vi.fn()

// Mocks must be hoisted before imports
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
}))

vi.mock('@/lib/auth', () => ({
  useAuth: () => {
    const role = currentMockUser.attributes.role as string
    return {
      currentUser: currentMockUser,
      logout: mockLogoutFn,
      isAdmin: role === 'admin',
      isManager: role === 'manager',
      isStaff: role === 'staff',
    }
  },
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}))

// Import after mocks
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigation } from './navigation'

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentMockUser = mockUser
    mockLogoutFn = vi.fn()
  })

  it('renders main navigation links', () => {
    renderWithProviders(<Navigation />)

    // i18n returns keys in test environment
    expect(screen.getByText('app.name')).toBeInTheDocument()
    expect(screen.getByText('nav.schedules')).toBeInTheDocument()
    expect(screen.getByText('nav.shifts')).toBeInTheDocument()
    expect(screen.getByText('nav.applications')).toBeInTheDocument()
  })

  it('hides Users link for regular employees', () => {
    currentMockUser = mockUser
    renderWithProviders(<Navigation />)

    expect(screen.queryByText('nav.users')).not.toBeInTheDocument()
  })

  it('shows Users link for admin users', () => {
    currentMockUser = mockAdminUser
    renderWithProviders(<Navigation />)

    expect(screen.getByText('nav.users')).toBeInTheDocument()
  })

  it('shows Users link for manager users', () => {
    currentMockUser = mockManagerUser
    renderWithProviders(<Navigation />)

    expect(screen.getByText('nav.users')).toBeInTheDocument()
  })

  it('displays user name in the dropdown trigger', () => {
    currentMockUser = mockUser
    renderWithProviders(<Navigation />)

    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('displays role badge', () => {
    currentMockUser = mockAdminUser
    renderWithProviders(<Navigation />)

    // Role translation key
    expect(screen.getByText('roles.admin')).toBeInTheDocument()
  })

  it('opens dropdown menu and shows menu items for regular user', async () => {
    const user = userEvent.setup()
    currentMockUser = mockUser
    renderWithProviders(<Navigation />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('nav.profile')).toBeInTheDocument()
    expect(screen.queryByText('nav.account')).not.toBeInTheDocument()
    expect(screen.getByText('auth.logout')).toBeInTheDocument()
  })

  it('shows account menu item for admin users', async () => {
    const user = userEvent.setup()
    currentMockUser = mockAdminUser
    renderWithProviders(<Navigation />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('nav.profile')).toBeInTheDocument()
    expect(screen.getByText('nav.account')).toBeInTheDocument()
    expect(screen.getByText('auth.logout')).toBeInTheDocument()
  })

  it('navigates to profile when clicking Profile menu item', async () => {
    const user = userEvent.setup()
    currentMockUser = mockUser
    renderWithProviders(<Navigation />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('nav.profile'))

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/profile' })
  })

  it('navigates to account when clicking Account menu item', async () => {
    const user = userEvent.setup()
    currentMockUser = mockAdminUser
    renderWithProviders(<Navigation />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('nav.account'))

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/account' })
  })

  it('calls logout and navigates to login when clicking Log out', async () => {
    const user = userEvent.setup()
    currentMockUser = mockUser
    renderWithProviders(<Navigation />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('auth.logout'))

    expect(mockLogoutFn).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' })
  })
})
