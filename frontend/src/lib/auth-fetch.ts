const AUTH_STORAGE_KEY = 'mini_staffomatic_auth'

type AuthSession = {
  email: string
  password: string
  subdomain: string
}

export function getAuthSession(): AuthSession | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as AuthSession
  } catch {
    return null
  }
}

export function setAuthSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const authFetch = async <T>(
  input: string,
  init: RequestInit = {},
): Promise<T> => {
  const session = getAuthSession()

  const headers = new Headers(init.headers || {})
  headers.set('Content-Type', 'application/vnd.api+json')
  headers.set('Accept', 'application/vnd.api+json')

  if (session) {
    const credentials = btoa(`${session.email}:${session.password}`)
    headers.set('Authorization', `Basic ${credentials}`)
  }

  const subdomain = session?.subdomain
  const path = subdomain ? `/v1/${subdomain}${input}` : `/v1${input}`

  const response = await fetch(path, {
    ...init,
    headers,
  })

  if (response.status === 204) {
    return {} as T
  }

  if (response.status === 401 && session) {
    clearAuthSession()
    window.location.href = '/login'
  }

  if (response.ok) {
    return (await response.json()) as T
  }

  throw new Error(`${response.status} ${response.statusText}`)
}
