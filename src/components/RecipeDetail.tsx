import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Ingredient {
  name: string
  amount: string
  unit: string
}

interface Recipe {
  _id: string
  name: string
  ingredients: Ingredient[]
  instructions: string
  prepTime: number
  category: string
  servings?: number
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
  const [scaleFactor, setScaleFactor] = useState<number>(1)

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe({ id: recipe._id as any })
        onBack()
      } catch (error) {
        console.error('Error deleting recipe:', error)
      }
    }
  }

  // Scale ingredient amounts
  const scaleAmount = (amount: string, factor: number): string => {
    // Handle fractions like "1/2", "1/4", etc.
    if (amount.includes('/')) {
      const [numerator, denominator] = amount.split('/').map(n => parseFloat(n.trim()))
      if (!isNaN(numerator) && !isNaN(denominator)) {
        const scaled = (numerator / denominator) * factor
        return formatAmount(scaled)
      }
    }
    
    // Handle regular numbers
    const num = parseFloat(amount)
    if (!isNaN(num)) {
      const scaled = num * factor
      return formatAmount(scaled)
    }
    
    // If we can't parse it, return original
    return amount
  }

  // Format amounts nicely
  const formatAmount = (num: number): string => {
    // Handle common fractions
    if (Math.abs(num - 0.25) < 0.01) return "1/4"
    if (Math.abs(num - 0.33) < 0.01) return "1/3"
    if (Math.abs(num - 0.5) < 0.01) return "1/2"
    if (Math.abs(num - 0.67) < 0.01) return "2/3"
    if (Math.abs(num - 0.75) < 0.01) return "3/4"
    
    // Round to reasonable precision
    if (num < 0.1) return num.toFixed(2)
    if (num < 1) return num.toFixed(1)
    if (num === Math.floor(num)) return num.toString()
    return num.toFixed(1)
  }

  const scaledIngredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    amount: scaleAmount(ingredient.amount, scaleFactor)
  }))

  const scaledServings = recipe.servings ? Math.round(recipe.servings * scaleFactor) : undefined

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
          <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
            <span>Category: {recipe.category}</span>
            <span>Prep Time: {recipe.prepTime} minutes</span>
            {recipe.servings && <span>Serves: {recipe.servings}</span>}
            <span>Added: {new Date(recipe.createdAt).toLocaleDateString()}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recipe Scaling Controls */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-4 flex-wrap">
              <Label htmlFor="scale" className="font-semibold">Scale Recipe:</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setScaleFactor(0.5)}
                  className={scaleFactor === 0.5 ? "bg-blue-100" : ""}
                >
                  ½x
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setScaleFactor(1)}
                  className={scaleFactor === 1 ? "bg-blue-100" : ""}
                >
                  1x
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setScaleFactor(2)}
                  className={scaleFactor === 2 ? "bg-blue-100" : ""}
                >
                  2x
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setScaleFactor(3)}
                  className={scaleFactor === 3 ? "bg-blue-100" : ""}
                >
                  3x
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="custom-scale" className="text-sm">Custom:</Label>
                <Input
                  id="custom-scale"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={scaleFactor}
                  onChange={(e) => setScaleFactor(parseFloat(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">x</span>
              </div>
            </div>
            {scaleFactor !== 1 && (
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <p>Recipe scaled to {scaleFactor}x the original size</p>
                {scaledServings && (
                  <p>Will serve approximately {scaledServings} people</p>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {scaledIngredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>
                    <strong className={scaleFactor !== 1 ? "text-blue-600" : ""}>
                      {ingredient.amount} {ingredient.unit}
                    </strong> {ingredient.name}
                    {scaleFactor !== 1 && (
                      <span className="text-xs text-gray-500 ml-2">
                        (was {recipe.ingredients[index].amount} {recipe.ingredients[index].unit})
                      </span>
                    )}
                  </span>
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
