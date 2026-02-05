import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import {
  render,
  resetMockAuth,
  screen,
  setMockAuth,
  waitFor,
} from '@/test/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/lib/auth'

const mockNavigate = vi.fn()

// Standalone LoginPage component for testing (mirrors the route component)
function LoginPage() {
  const { login } = useAuth()

  const [subdomain, setSubdomain] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email, password, subdomain)
      await mockNavigate({ to: '/schedules' })
    } catch {
      setError('Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">MiniStaffomatic</CardTitle>
          <CardDescription>Log in</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="demo"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@demo.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            <Button type="submit" disabled={isLoading} className="w-full">
              Log in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetMockAuth()
  })

  it('renders the login form with all fields', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText(/subdomain/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('displays the app name and login description', () => {
    render(<LoginPage />)

    expect(screen.getByText('MiniStaffomatic')).toBeInTheDocument()
    // "Log in" appears both in description and button, so we use getAllByText
    expect(screen.getAllByText('Log in')).toHaveLength(2)
  })

  it('allows filling in form fields', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const subdomainInput = screen.getByLabelText(/subdomain/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(subdomainInput, 'demo')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    expect(subdomainInput).toHaveValue('demo')
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('calls login and navigates on successful submission', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined)
    setMockAuth({ login: mockLogin })

    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/subdomain/i), 'demo')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'demo',
      )
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/schedules' })
    })
  })

  it('shows error message on failed login', async () => {
    const mockLogin = vi
      .fn()
      .mockRejectedValue(new Error('Invalid credentials'))
    setMockAuth({ login: mockLogin })

    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/subdomain/i), 'demo')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('disables submit button while loading', async () => {
    const mockLogin = vi.fn().mockImplementation(() => new Promise(() => {})) // Never resolves
    setMockAuth({ login: mockLogin })

    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/subdomain/i), 'demo')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })
})
