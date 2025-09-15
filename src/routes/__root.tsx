import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useSession, useUser, useDescope } from '@descope/react-sdk'

export const Route = createRootRoute({
  component: () => {
    const { isAuthenticated, isSessionLoading } = useSession()
    const { user } = useUser()
    const { logout } = useDescope()

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Recipe Collection</h1>
              <div className="flex items-center gap-2 md:gap-4">
                <Link to="/">
                  <Button variant="ghost" size="sm" className="text-sm md:text-base">Home</Button>
                </Link>
                {isAuthenticated && (
                  <Link to="/recipes">
                    <Button variant="ghost" size="sm" className="text-sm md:text-base">Recipes</Button>
                  </Link>
                )}
                
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
