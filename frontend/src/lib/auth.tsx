import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { UserItem } from '@/generated/schemas'
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from '@/lib/auth-fetch'

type AuthSession = {
  email: string
  password: string
  subdomain: string
}

type AuthContextValue = {
  authSession: AuthSession | null
  currentUser: UserItem | null
  isAuthenticated: boolean
  isAdmin: boolean
  isManager: boolean
  isStaff: boolean
  login: (email: string, password: string, subdomain: string) => Promise<void>
  logout: () => void
  refreshCurrentUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authSession, setSession] = useState<AuthSession | null>(getAuthSession)
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null)

  const fetchCurrentUser = useCallback(
    async (session: AuthSession): Promise<UserItem> => {
      const credentials = btoa(`${session.email}:${session.password}`)
      // Use ransack filter to request only the current user - this works for all roles
      const filterParam = encodeURIComponent(session.email.toLowerCase())
      const response = await fetch(
        `/v1/${session.subdomain}/users?filter[email_eq]=${filterParam}`,
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            Accept: 'application/vnd.api+json',
          },
        },
      )

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const data = (await response.json()) as { data: UserItem[] }
      const me = data.data.find(
        (u) =>
          u.attributes?.email?.toLowerCase() === session.email.toLowerCase(),
      )
      if (!me) {
        throw new Error('User not found')
      }
      return me
    },
    [],
  )

  useEffect(() => {
    if (authSession) {
      fetchCurrentUser(authSession)
        .then(setCurrentUser)
        .catch(() => {
          clearAuthSession()
          setSession(null)
          setCurrentUser(null)
        })
    }
  }, [authSession, fetchCurrentUser])

  const login = useCallback(
    async (email: string, password: string, subdomain: string) => {
      const session: AuthSession = { email, password, subdomain }
      const user = await fetchCurrentUser(session)
      setAuthSession(session)
      setSession(session)
      setCurrentUser(user)
    },
    [fetchCurrentUser],
  )

  const logout = useCallback(() => {
    clearAuthSession()
    setSession(null)
    setCurrentUser(null)
  }, [])

  const refreshCurrentUser = useCallback(async () => {
    if (authSession) {
      const user = await fetchCurrentUser(authSession)
      setCurrentUser(user)
    }
  }, [authSession, fetchCurrentUser])

  const role = currentUser?.attributes?.role
  const isAdmin = role === 'admin'
  const isManager = role === 'manager'
  const isStaff = role === 'staff'

  return (
    <AuthContext
      value={{
        authSession,
        currentUser,
        isAuthenticated: authSession !== null,
        isAdmin,
        isManager,
        isStaff,
        login,
        logout,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
