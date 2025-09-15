import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { useSession, useUser } from '@descope/react-sdk'
import { useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddRecipeForm } from '@/components/AddRecipeForm'
import { RecipeDetail } from '@/components/RecipeDetail'

function RecipesList() {
  const { isAuthenticated, isSessionLoading } = useSession()
  const { user } = useUser()
  const navigate = useNavigate()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [editingRecipe, setEditingRecipe] = useState<any>(null)

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

  // Show recipe details
  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
        onEdit={() => {
          setEditingRecipe(selectedRecipe)
          setSelectedRecipe(null)
        }}
      />
    )
  }

  // Show add/edit form
  if (showAddForm || editingRecipe) {
    return (
      <AddRecipeForm
        editingRecipe={editingRecipe}
        onSuccess={() => {
          setShowAddForm(false)
          setEditingRecipe(null)
        }}
        onCancel={() => {
          setShowAddForm(false)
          setEditingRecipe(null)
        }}
      />
    )
  }

  if (!recipes) {
    return <div>Loading recipes...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Recipe Collection</h2>
        <Button onClick={() => setShowAddForm(true)}>
          Add Recipe
        </Button>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No recipes yet. Create your first one!</p>
          <Button onClick={() => setShowAddForm(true)}>
            Add Your First Recipe
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Card 
              key={recipe._id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{recipe.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Category: {recipe.category}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Prep time: {recipe.prepTime} minutes
                </p>
                <p className="text-sm text-gray-600">
                  {recipe.ingredients.length} ingredients
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/recipes')({
  component: RecipesList,
})
