import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { useUser } from '@descope/react-sdk'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IngredientInput } from '@/components/IngredientInput'
import { Loader2 } from 'lucide-react'

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

interface AddRecipeFormProps {
  onSuccess: () => void
  onCancel: () => void
  editingRecipe?: Recipe | null
  isSubmitting?: boolean
  onSubmit?: () => void
  onError?: (error: string) => void
}

export function AddRecipeForm({ 
  onSuccess, 
  onCancel, 
  editingRecipe,
  isSubmitting = false,
  onSubmit,
  onError 
}: AddRecipeFormProps) {
  const { user } = useUser()
  const createRecipe = useMutation(api.recipes.createRecipe)
  const updateRecipe = useMutation(api.recipes.updateRecipe)
  
  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    prepTime: '',
    category: 'Main Course',
    servings: ''
  })
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '', unit: 'cups' }
  ])
  
  const [localSubmitting, setLocalSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Use external or internal submitting state
  const submitting = isSubmitting || localSubmitting

  // Populate form when editing
  useEffect(() => {
    if (editingRecipe) {
      setFormData({
        name: editingRecipe.name,
        instructions: editingRecipe.instructions,
        prepTime: editingRecipe.prepTime.toString(),
        category: editingRecipe.category,
        servings: editingRecipe.servings?.toString() || ''
      })
      setIngredients(editingRecipe.ingredients.length > 0 ? editingRecipe.ingredients : [
        { name: '', amount: '', unit: 'cups' }
      ])
    }
  }, [editingRecipe])

  // Validation function
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Recipe name is required'
    }
    
    if (!formData.instructions.trim()) {
      errors.instructions = 'Instructions are required'
    }
    
    if (formData.prepTime && (isNaN(Number(formData.prepTime)) || Number(formData.prepTime) < 0)) {
      errors.prepTime = 'Prep time must be a positive number'
    }
    
    if (formData.servings && (isNaN(Number(formData.servings)) || Number(formData.servings) < 1)) {
      errors.servings = 'Servings must be a positive number'
    }
    
    const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.amount.trim())
    if (validIngredients.length === 0) {
      errors.ingredients = 'At least one ingredient is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    // Clear previous validation errors
    setValidationErrors({})
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    // Filter out empty ingredients
    const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.amount.trim())
    
    // Notify parent that submission started
    if (onSubmit) {
      onSubmit()
    } else {
      setLocalSubmitting(true)
    }
    
    try {
      const recipeData = {
        name: formData.name.trim(),
        ingredients: validIngredients,
        instructions: formData.instructions.trim(),
        prepTime: parseInt(formData.prepTime) || 0,
        category: formData.category,
        servings: formData.servings ? parseInt(formData.servings, 10) : undefined,
      }

      if (editingRecipe) {
        await updateRecipe({
          id: editingRecipe._id as any,
          ...recipeData
        })
      } else {
        await createRecipe({
          ...recipeData,
          userId: user.userId
        })
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error saving recipe:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save recipe. Please try again.'
      
      if (onError) {
        onError(errorMessage)
      } else {
        setValidationErrors({ submit: errorMessage })
      }
    } finally {
      if (!onSubmit) {
        setLocalSubmitting(false)
      }
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display submission error */}
          {validationErrors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{validationErrors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Recipe Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                  if (validationErrors.name) {
                    setValidationErrors(prev => ({ ...prev, name: '' }))
                  }
                }}
                required
                placeholder="e.g., Grandma's Chocolate Chip Cookies"
                className={validationErrors.name ? 'border-red-300' : ''}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={submitting}
              >
                <option value="Appetizer">Appetizer</option>
                <option value="Main Course">Main Course</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prepTime">Prep Time (minutes)</Label>
              <Input
                id="prepTime"
                type="number"
                min="0"
                value={formData.prepTime}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, prepTime: e.target.value }))
                  if (validationErrors.prepTime) {
                    setValidationErrors(prev => ({ ...prev, prepTime: '' }))
                  }
                }}
                placeholder="30"
                disabled={submitting}
                className={validationErrors.prepTime ? 'border-red-300' : ''}
              />
              {validationErrors.prepTime && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.prepTime}</p>
              )}
            </div>

            <div>
              <Label htmlFor="servings">Servings (optional)</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, servings: e.target.value }))
                  if (validationErrors.servings) {
                    setValidationErrors(prev => ({ ...prev, servings: '' }))
                  }
                }}
                placeholder="4"
                disabled={submitting}
                className={validationErrors.servings ? 'border-red-300' : ''}
              />
              {validationErrors.servings && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.servings}</p>
              )}
            </div>
          </div>

          <div>
            <IngredientInput
              ingredients={ingredients}
              onChange={(newIngredients) => {
                setIngredients(newIngredients)
                if (validationErrors.ingredients) {
                  setValidationErrors(prev => ({ ...prev, ingredients: '' }))
                }
              }}
              disabled={submitting}
            />
            {validationErrors.ingredients && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.ingredients}</p>
            )}
          </div>

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, instructions: e.target.value }))
                if (validationErrors.instructions) {
                  setValidationErrors(prev => ({ ...prev, instructions: '' }))
                }
              }}
              placeholder="1. Preheat oven to 350°F...&#10;2. Mix dry ingredients...&#10;3. Add wet ingredients..."
              rows={8}
              required
              disabled={submitting}
              className={validationErrors.instructions ? 'border-red-300' : ''}
            />
            {validationErrors.instructions && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.instructions}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {editingRecipe ? 'Updating Recipe...' : 'Adding Recipe...'}
                </>
              ) : (
                editingRecipe ? 'Update Recipe' : 'Add Recipe'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}