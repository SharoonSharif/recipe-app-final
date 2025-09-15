import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { X, Plus } from 'lucide-react'

interface Ingredient {
  name: string
  amount: string
  unit: string
}

interface IngredientInputProps {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

const commonUnits = [
  'cups', 'tbsp', 'tsp', 'oz', 'lbs', 'g', 'kg', 'ml', 'l',
  'pieces', 'slices', 'cloves', 'cans', 'bottles', 'packages'
]

export function IngredientInput({ ingredients, onChange }: IngredientInputProps) {
  const addIngredient = () => {
    onChange([...ingredients, { name: '', amount: '', unit: 'cups' }])
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = ingredients.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    )
    onChange(updated)
  }

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm md:text-base">Ingredients</Label>
        <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
          <Plus className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Add Ingredient</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
      
      {ingredients.map((ingredient, index) => (
        <Card key={index} className="p-3 md:p-4">
          <div className="grid gap-2">
            {/* Mobile: Stack vertically */}
            <div className="grid grid-cols-12 gap-2 md:hidden">
              <div className="col-span-4">
                <Label htmlFor={`amount-${index}`} className="text-xs">Amount</Label>
                <Input
                  id={`amount-${index}`}
                  placeholder="2"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-4">
                <Label htmlFor={`unit-${index}`} className="text-xs">Unit</Label>
                <select
                  id={`unit-${index}`}
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm mt-1"
                >
                  {commonUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-4 flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  className="h-10 w-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="md:hidden">
              <Label htmlFor={`name-mobile-${index}`} className="text-xs">Ingredient</Label>
              <Input
                id={`name-mobile-${index}`}
                placeholder="flour"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                required
                className="mt-1"
              />
            </div>

            {/* Desktop: Single row */}
            <div className="hidden md:grid md:grid-cols-12 gap-2 items-end">
              <div className="col-span-3">
                <Label htmlFor={`amount-desktop-${index}`} className="text-xs">Amount</Label>
                <Input
                  id={`amount-desktop-${index}`}
                  placeholder="2"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                />
              </div>
              
              <div className="col-span-3">
                <Label htmlFor={`unit-desktop-${index}`} className="text-xs">Unit</Label>
                <select
                  id={`unit-desktop-${index}`}
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {commonUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-5">
                <Label htmlFor={`name-desktop-${index}`} className="text-xs">Ingredient</Label>
                <Input
                  id={`name-desktop-${index}`}
                  placeholder="flour"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  required
                />
              </div>
              
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  className="h-10 w-10 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
      
      {ingredients.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <Button type="button" variant="outline" onClick={addIngredient}>
            Add your first ingredient
          </Button>
        </div>
      )}
    </div>
  )
}
