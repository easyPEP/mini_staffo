import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  authFetch,
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from './auth-fetch'

describe('auth-fetch utilities', () => {
  const mockSession = {
    email: 'test@example.com',
    password: 'password123',
    subdomain: 'demo',
  }

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('getAuthSession', () => {
    it('returns null when no session is stored', () => {
      expect(getAuthSession()).toBeNull()
    })

    it('returns the stored session', () => {
      localStorage.setItem('mini_staffomatic_auth', JSON.stringify(mockSession))
      expect(getAuthSession()).toEqual(mockSession)
    })

    it('returns null for invalid JSON', () => {
      localStorage.setItem('mini_staffomatic_auth', 'invalid json')
      expect(getAuthSession()).toBeNull()
    })
  })

  describe('setAuthSession', () => {
    it('stores the session in localStorage', () => {
      setAuthSession(mockSession)
      const stored = localStorage.getItem('mini_staffomatic_auth')
      expect(JSON.parse(stored!)).toEqual(mockSession)
    })
  })

  describe('clearAuthSession', () => {
    it('removes the session from localStorage', () => {
      localStorage.setItem('mini_staffomatic_auth', JSON.stringify(mockSession))
      clearAuthSession()
      expect(localStorage.getItem('mini_staffomatic_auth')).toBeNull()
    })
  })

  describe('authFetch', () => {
    const mockFetch = vi.fn()

    beforeEach(() => {
      vi.stubGlobal('fetch', mockFetch)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('makes a request with correct headers', async () => {
      setAuthSession(mockSession)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      })

      await authFetch('/users')

      expect(mockFetch).toHaveBeenCalledWith('/v1/demo/users', {
        headers: expect.any(Headers),
      })

      const headers = mockFetch.mock.calls[0][1].headers as Headers
      expect(headers.get('Content-Type')).toBe('application/vnd.api+json')
      expect(headers.get('Accept')).toBe('application/vnd.api+json')
      expect(headers.get('Authorization')).toMatch(/^Basic /)
    })

    it('includes subdomain in the path', async () => {
      setAuthSession(mockSession)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      })

      await authFetch('/schedules')

      expect(mockFetch).toHaveBeenCalledWith(
        '/v1/demo/schedules',
        expect.any(Object),
      )
    })

    it('works without a session', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      })

      await authFetch('/public')

      expect(mockFetch).toHaveBeenCalledWith('/v1/public', expect.any(Object))

      const headers = mockFetch.mock.calls[0][1].headers as Headers
      expect(headers.get('Authorization')).toBeNull()
    })

    it('returns empty object for 204 responses', async () => {
      setAuthSession(mockSession)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      })

      const result = await authFetch('/users/1')

      expect(result).toEqual({})
    })

    it('parses JSON response for successful requests', async () => {
      setAuthSession(mockSession)
      const expectedData = { data: { id: '1', type: 'user' } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(expectedData),
      })

      const result = await authFetch('/users/1')

      expect(result).toEqual(expectedData)
    })

    it('throws error for non-OK responses', async () => {
      setAuthSession(mockSession)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(authFetch('/users')).rejects.toThrow(
        '500 Internal Server Error',
      )
    })

    it('clears session and redirects on 401', async () => {
      setAuthSession(mockSession)
      const mockLocation = { href: '' }
      vi.stubGlobal('location', mockLocation)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })

      await expect(authFetch('/users')).rejects.toThrow('401 Unauthorized')
      expect(localStorage.getItem('mini_staffomatic_auth')).toBeNull()
      expect(mockLocation.href).toBe('/login')
    })
  })
})
