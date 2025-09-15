import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { useSession, useUser } from '@descope/react-sdk'
import { useEffect } from 'react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function RecipesList() {
  const { isAuthenticated, isSessionLoading } = useSession()
  const { user } = useUser()
  const navigate = useNavigate()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, isSessionLoading, navigate])

  // Get recipes for the current user
  const recipes = useQuery(api.recipes.getRecipes, 
    user ? { userId: user.userId } : "skip"
  )

  if (isSessionLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>
  }

  if (!recipes) {
    return <div>Loading recipes...</div>
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Your Recipe Collection</h2>
        <p className="text-gray-500 mb-4">No recipes yet. Create your first one!</p>
        <p className="text-sm text-gray-400">
          Logged in as: {user?.email}
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Recipe Collection</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card key={recipe._id}>
            <CardHeader>
              <CardTitle>{recipe.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Category: {recipe.category}
              </p>
              <p className="text-sm text-gray-600">
                Prep time: {recipe.prepTime} minutes
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/recipes')({
  component: RecipesList,
})
