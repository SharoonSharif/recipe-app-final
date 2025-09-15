import { useDescope, useSession, useUser } from '@descope/react-sdk'
import { Button } from '@/components/ui/button'

export function AuthButton() {
  const { isAuthenticated, isSessionLoading } = useSession()
  const { user } = useUser()
  const { logout } = useDescope()

  if (isSessionLoading) {
    return <Button disabled>Loading...</Button>
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Hello, {user.email}
        </span>
        <Button variant="outline" onClick={() => logout()}>
          Logout
        </Button>
      </div>
    )
  }

  return null
}
