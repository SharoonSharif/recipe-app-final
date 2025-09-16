import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { useSession, useUser } from '@descope/react-sdk'
import { useEffect, useState, useMemo } from 'react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddRecipeForm } from '@/components/AddRecipeForm'
import { RecipeDetail } from '@/components/RecipeDetail'
import { RecipeFilters } from '@/components/RecipeFilters'
import { StarRating } from '@/components/StarRating'
import { FavoriteButton } from '@/components/FavoriteButton'
import { Loader2, AlertCircle, RefreshCw, Heart } from 'lucide-react'

// Loading skeleton component
function RecipeCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </CardContent>
    </Card>
  )
}

// Error display component
function ErrorDisplay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}

function RecipesList() {
  const { isAuthenticated, isSessionLoading } = useSession()
  const { user } = useUser()
  const navigate = useNavigate()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [editingRecipe, setEditingRecipe] = useState<any>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [ingredientFilter, setIngredientFilter] = useState('')
  
  // New filter/sort states
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<string>('newest')

  // Form submission states
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Mutations for ratings and favorites
  const updateRating = useMutation(api.recipes.updateRecipeRating)
  const toggleFavorite = useMutation(api.recipes.toggleRecipeFavorite)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, isSessionLoading, navigate])

  // Get recipes with new filtering options
  const recipes = useQuery(api.recipes.getRecipes, 
    user ? { 
      userId: user.userId,
      favoritesOnly: showFavoritesOnly,
      sortBy: sortBy
    } : "skip"
  )

  // Filter recipes based on search criteria (client-side filtering)
  const filteredRecipes = useMemo(() => {
    if (!recipes) return []
    
    return recipes.filter(recipe => {
      const matchesSearch = searchTerm === '' || 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === '' || 
        recipe.category === selectedCategory
      
      const matchesIngredients = ingredientFilter === '' ||
        recipe.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(ingredientFilter.toLowerCase())
        )
      
      return matchesSearch && matchesCategory && matchesIngredients
    })
  }, [recipes, searchTerm, selectedCategory, ingredientFilter])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setIngredientFilter('')
    setShowFavoritesOnly(false)
    setSortBy('newest')
  }

  // Handle rating changes
  const handleRatingChange = async (recipeId: string, rating: number | undefined) => {
    try {
      await updateRating({ id: recipeId as any, rating })
    } catch (error) {
      console.error('Error updating rating:', error)
    }
  }

  // Handle favorite toggle
  const handleFavoriteToggle = async (recipeId: string, currentFavorite: boolean) => {
    try {
      await toggleFavorite({ id: recipeId as any, isFavorite: !currentFavorite })
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  // Handle form success
  const handleFormSuccess = () => {
    setSubmitError(null)
    setShowAddForm(false)
    setEditingRecipe(null)
  }

  // Retry function for error state
  const retryLoadingRecipes = () => {
    window.location.reload()
  }

  // Loading states
  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your session...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Redirecting to login...</span>
      </div>
    )
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
      <div>
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{submitError}</div>
              </div>
            </div>
          </div>
        )}
        <AddRecipeForm
          editingRecipe={editingRecipe}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowAddForm(false)
            setEditingRecipe(null)
            setSubmitError(null)
          }}
        />
      </div>
    )
  }

  // Handle loading state for recipes
  if (recipes === undefined) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Recipe Collection</h2>
          <Button disabled>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Handle error state
  if (recipes === null) {
    return (
      <ErrorDisplay 
        message="Failed to load your recipes. Please check your connection and try again."
        onRetry={retryLoadingRecipes}
      />
    )
  }

  const favoriteCount = recipes?.filter(r => r.isFavorite).length || 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Recipe Collection</h2>
        <Button onClick={() => setShowAddForm(true)}>
          Add Recipe
        </Button>
      </div>

      {recipes.length > 0 && (
        <>
          <RecipeFilters
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onIngredientChange={setIngredientFilter}
            onClearFilters={clearFilters}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            ingredientFilter={ingredientFilter}
            totalRecipes={recipes.length}
            filteredCount={filteredRecipes.length}
          />
          
          {/* NEW: Favorites and Sorting Controls */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorites Only ({favoriteCount})
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="newest">Newest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </>
      )}

      {recipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No recipes yet. Create your first one!</p>
          <Button onClick={() => setShowAddForm(true)}>
            Add Your First Recipe
          </Button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No recipes match your filters.</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <Card 
              key={recipe._id} 
              className="cursor-pointer hover:shadow-lg transition-shadow relative"
              onClick={() => setSelectedRecipe(recipe)}
            >
              {/* Favorite button - positioned absolutely */}
              <div className="absolute top-3 right-3 z-10">
                <FavoriteButton
                  isFavorite={recipe.isFavorite || false}
                  onToggle={(e) => {
                    e?.stopPropagation?.() // Prevent card click
                    handleFavoriteToggle(recipe._id, recipe.isFavorite || false)
                  }}
                />
              </div>

              <CardHeader className="pr-12">
                <CardTitle className="text-lg">{recipe.name}</CardTitle>
                
                {/* Rating display */}
                <div 
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with rating
                >
                  <StarRating
                    rating={recipe.rating}
                    onRatingChange={(rating) => handleRatingChange(recipe._id, rating)}
                    size="sm"
                  />
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Category: {recipe.category}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Prep time: {recipe.prepTime} minutes
                </p>
                {recipe.servings && (
                  <p className="text-sm text-gray-600 mb-2">
                    Serves: {recipe.servings}
                  </p>
                )}
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