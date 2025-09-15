import { useState } from 'react'
import { useMutation } from 'convex/react'
import { useUser } from '@descope/react-sdk'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AddRecipeFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AddRecipeForm({ onSuccess, onCancel }: AddRecipeFormProps) {
  const { user } = useUser()
  const createRecipe = useMutation(api.recipes.createRecipe)
  
  const [formData, setFormData] = useState({
    name: '',
    ingredients: '',
    instructions: '',
    prepTime: '',
    category: 'Main Course'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setIsSubmitting(true)
    
    try {
      await createRecipe({
        name: formData.name,
        ingredients: formData.ingredients.split('\n').filter(item => item.trim()),
        instructions: formData.instructions,
        prepTime: parseInt(formData.prepTime) || 0,
        category: formData.category,
        userId: user.userId
      })
      
      onSuccess()
    } catch (error) {
      console.error('Error creating recipe:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Recipe</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <Label htmlFor="prepTime">Prep Time (minutes)</Label>
            <Input
              id="prepTime"
              type="number"
              value={formData.prepTime}
              onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
              placeholder="30"
            />
          </div>

          <div>
            <Label htmlFor="ingredients">Ingredients (one per line)</Label>
            <Textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
              placeholder="2 cups flour&#10;1 cup sugar&#10;2 eggs"
              rows={6}
              required
            />
          </div>

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
              {isSubmitting ? 'Adding Recipe...' : 'Add Recipe'}
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
