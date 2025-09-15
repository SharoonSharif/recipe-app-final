import { createRootRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useSession, useUser, useDescope } from '@descope/react-sdk'
import { useEffect } from 'react'

export const Route = createRootRoute({
  component: () => {
    const { isAuthenticated, isSessionLoading } = useSession()
    const { user } = useUser()
    const { logout } = useDescope()
    const navigate = useNavigate()

    // Redirect to recipes if user is on home page and authenticated
    useEffect(() => {
      if (isAuthenticated && window.location.pathname === '/') {
        navigate({ to: '/recipes' })
      }
    }, [isAuthenticated, navigate])

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link to={isAuthenticated ? "/recipes" : "/"}>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 cursor-pointer">
                  Recipe Collection
                </h1>
              </Link>
              <div className="flex items-center gap-2 md:gap-4">
                {isSessionLoading ? (
                  <Button disabled size="sm">Loading...</Button>
                ) : isAuthenticated && user ? (
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className="text-xs md:text-sm text-gray-600 hidden sm:block">
                      {user.email}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => logout()}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link to="/login">
                    <Button size="sm">Login</Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-4 md:py-8">
          <Outlet />
        </main>
      </div>
    )
  },
})
