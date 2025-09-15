import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface RecipeFiltersProps {
  onSearchChange: (search: string) => void
  onCategoryChange: (category: string) => void
  onIngredientChange: (ingredient: string) => void
  onClearFilters: () => void
  searchTerm: string
  selectedCategory: string
  ingredientFilter: string
  totalRecipes: number
  filteredCount: number
}

export function RecipeFilters({
  onSearchChange,
  onCategoryChange,
  onIngredientChange,
  onClearFilters,
  searchTerm,
  selectedCategory,
  ingredientFilter,
  totalRecipes,
  filteredCount
}: RecipeFiltersProps) {
  const hasActiveFilters = searchTerm || selectedCategory || ingredientFilter

  return (
    <Card className="mb-4 md:mb-6">
      <CardContent className="pt-4 md:pt-6">
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="search" className="text-sm">Search recipes</Label>
            <Input
              id="search"
              placeholder="Recipe name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="category" className="text-sm">Category</Label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
            >
              <option value="">All categories</option>
              <option value="Appetizer">Appetizer</option>
              <option value="Main Course">Main Course</option>
              <option value="Dessert">Dessert</option>
              <option value="Beverage">Beverage</option>
              <option value="Snack">Snack</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="ingredient" className="text-sm">Has ingredient</Label>
            <Input
              id="ingredient"
              placeholder="e.g., chicken, flour..."
              value={ingredientFilter}
              onChange={(e) => onIngredientChange(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="w-full h-10"
              disabled={!hasActiveFilters}
              size="sm"
            >
              Clear filters
            </Button>
          </div>
        </div>
        
        {hasActiveFilters && (
          <div className="mt-3 md:mt-4 text-sm text-gray-600">
            Showing {filteredCount} of {totalRecipes} recipes
          </div>
        )}
      </CardContent>
    </Card>
  )
}
