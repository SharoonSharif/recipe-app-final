import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Printer } from 'lucide-react'

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

  // Print function
  const handlePrint = () => {
    window.print()
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
      {/* Non-print header with buttons */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button variant="outline" onClick={onBack}>
          ← Back to Recipes
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Recipe
          </Button>
          <Button variant="outline" onClick={onEdit}>
            Edit Recipe
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Recipe
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:pb-4">
          <CardTitle className="text-3xl print:text-4xl print:mb-2">{recipe.name}</CardTitle>
          
          {/* Recipe metadata - optimized for print */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg print:bg-white print:p-0 print:grid-cols-4 print:gap-6 print:border-b print:border-gray-300 print:pb-4">
            <div>
              <span className="font-medium text-sm print:text-base">Prep Time:</span>
              <p className="text-gray-600 print:text-black">{recipe.prepTime} minutes</p>
            </div>
            <div>
              <span className="font-medium text-sm print:text-base">Category:</span>
              <p className="text-gray-600 print:text-black">{recipe.category}</p>
            </div>
            {scaledServings && (
              <div>
                <span className="font-medium text-sm print:text-base">Servings:</span>
                <p className="text-gray-600 print:text-black">{scaledServings}</p>
              </div>
            )}
            <div className="print:hidden">
              <span className="font-medium text-sm">Added:</span>
              <p className="text-gray-600">{new Date(recipe.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 print:space-y-8">
          {/* Recipe Scaling Controls - Hidden in print */}
          <div className="bg-blue-50 p-4 rounded-lg print:hidden">
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

          {/* Ingredients Section - Print optimized */}
          <div className="print:break-inside-avoid">
            <h3 className="text-xl font-semibold mb-4 print:text-2xl print:mb-6 print:border-b print:border-gray-300 print:pb-2">Ingredients</h3>
            <div className="grid gap-3 print:gap-2">
              {scaledIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-start print:py-1">
                  <span className="text-gray-400 mr-3 print:text-black print:mr-4">•</span>
                  <span className="print:text-base">
                    <strong className={`${scaleFactor !== 1 ? "text-blue-600 print:text-black" : "print:text-black"}`}>
                      {ingredient.amount} {ingredient.unit}
                    </strong>{" "}
                    {ingredient.name}
                    {scaleFactor !== 1 && (
                      <span className="text-xs text-gray-500 ml-2 print:hidden">
                        (was {recipe.ingredients[index].amount} {recipe.ingredients[index].unit})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section - Print optimized */}
          <div className="print:break-inside-avoid">
            <h3 className="text-xl font-semibold mb-4 print:text-2xl print:mb-6 print:border-b print:border-gray-300 print:pb-2">Instructions</h3>
            <div className="space-y-4 print:space-y-3">
              {recipe.instructions.split('\n').filter(step => step.trim()).map((step, index) => (
                <div key={index} className="flex items-start print:py-1">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full mr-3 min-w-[24px] text-center print:bg-gray-200 print:text-black print:text-base">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed print:text-black print:text-base print:leading-6">
                    {step.trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}