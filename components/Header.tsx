"use client"

import { Bell, User, LogOut, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface AzureSWAUser {
  identityProvider: string
  userId: string
  userDetails: string
  userRoles: string[]
  claims?: Array<{ typ: string; val: string }>
}

interface ClientPrincipal {
  clientPrincipal: AzureSWAUser | null
}

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [user, setUser] = useState<AzureSWAUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/.auth/me')
      if (response.ok) {
        const data: ClientPrincipal = await response.json()
        setUser(data.clientPrincipal)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    window.location.href = '/.auth/logout?post_logout_redirect_uri=/'
  }

  // Extract display name from user details or claims
  const getDisplayName = (): string => {
    if (!user) return 'Guest'

    // Try to get name from claims
    if (user.claims) {
      const nameClaim = user.claims.find(c =>
        c.typ === 'name' ||
        c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      )
      if (nameClaim) return nameClaim.val
    }

    // Fall back to userDetails (usually email)
    if (user.userDetails) {
      // If it's an email, extract the name part
      if (user.userDetails.includes('@')) {
        return user.userDetails.split('@')[0]
      }
      return user.userDetails
    }

    return 'User'
  }

  const getEmail = (): string => {
    if (!user) return ''

    // Try to get email from claims
    if (user.claims) {
      const emailClaim = user.claims.find(c =>
        c.typ === 'preferred_username' ||
        c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress' ||
        c.typ === 'emails'
      )
      if (emailClaim) return emailClaim.val
    }

    // Fall back to userDetails
    return user.userDetails || ''
  }

  const userName = getDisplayName()
  const userEmail = getEmail()

  return (
    <header className="bg-uva-navy text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-uva-orange rounded-lg flex items-center justify-center font-serif font-bold text-xl">
                B
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold">
                  Batten IT Dashboard
                </h1>
                <p className="text-xs text-white/70">
                  UVA Resource Management
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Notifications and User */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-uva-orange rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              {loading ? (
                <div className="flex items-center gap-2 p-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : user ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-uva-orange rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-semibold">{userName}</p>
                      <p className="text-xs text-white/70 max-w-[150px] truncate">{userEmail}</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-100 py-2 text-gray-800">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-uva-navy">{userName}</p>
                        <p className="text-xs text-gray-600 truncate">{userEmail}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          via {user.identityProvider === 'aad' ? 'Microsoft' : user.identityProvider}
                        </p>
                      </div>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors text-red-600"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <a
                  href="/.auth/login/aad"
                  className="flex items-center gap-2 px-4 py-2 bg-uva-orange hover:bg-uva-orange/90 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-semibold">Sign In</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
