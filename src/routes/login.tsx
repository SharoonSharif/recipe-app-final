import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Descope } from '@descope/react-sdk'
import { useSession } from '@descope/react-sdk'
import { useEffect } from 'react'

function LoginPage() {
  const { isAuthenticated } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/recipes' })
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        Login to Recipe Collection
      </h1>
      <Descope
        projectId={import.meta.env.VITE_DESCOPE_PROJECT_ID!}
        flowId="sign-up-or-in"
        onSuccess={() => navigate({ to: '/recipes' })}
        onError={(error) => console.error('Login error:', error)}
      />
    </div>
  )
}

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
