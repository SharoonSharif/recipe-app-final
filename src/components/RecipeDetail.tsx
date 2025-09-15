import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Recipe {
  _id: string
  name: string
  ingredients: string[]
  instructions: string
  prepTime: number
  category: string
  userId: string
  createdAt: number
}

interface RecipeDetailProps {
  recipe: Recipe
  onBack: () => void
  onEdit: () => void
}

export function RecipeDetail({ recipe, onBack, onEdit }: RecipeDetailProps) {
  const deleteRecipe = useMutation(api.recipes.deleteRecipe)

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe({ id: recipe._id as any })
        onBack() // Go back to list after delete
      } catch (error) {
        console.error('Error deleting recipe:', error)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={onBack}>
          ← Back to Recipes
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            Edit Recipe
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Recipe
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{recipe.name}</CardTitle>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Category: {recipe.category}</span>
            <span>Prep Time: {recipe.prepTime} minutes</span>
            <span>Added: {new Date(recipe.createdAt).toLocaleDateString()}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
            <ul className="space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Instructions</h3>
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {recipe.instructions}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
