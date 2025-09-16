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
}

export function AddRecipeForm({ onSuccess, onCancel, editingRecipe }: AddRecipeFormProps) {
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
  
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    // Filter out empty ingredients
    const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.amount.trim())
    
    if (validIngredients.length === 0) {
      alert('Please add at least one ingredient')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const recipeData = {
        name: formData.name,
        ingredients: validIngredients,
        instructions: formData.instructions,
        prepTime: parseInt(formData.prepTime) || 0,
        category: formData.category,
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
    } finally {
      setIsSubmitting(false)
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Recipe Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., Grandma's Chocolate Chip Cookies"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Appetizer">Appetizer</option>
                <option value="Main Course">Main Course</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="prepTime">Prep Time (minutes)</Label>
            <Input
              id="prepTime"
              type="number"
              value={formData.prepTime}
              onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
              placeholder="30"
              className="max-w-xs"
            />
          </div>

          <IngredientInput
            ingredients={ingredients}
            onChange={setIngredients}
          />

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="1. Preheat oven to 350°F...&#10;2. Mix dry ingredients...&#10;3. Add wet ingredients..."
              rows={8}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (editingRecipe ? 'Updating Recipe...' : 'Adding Recipe...') 
                : (editingRecipe ? 'Update Recipe' : 'Add Recipe')
              }
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
