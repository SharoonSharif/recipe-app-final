import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Clock, Users, Tag } from 'lucide-react'

interface PublicRecipeViewProps {
  recipeId: string
}

function PublicRecipeView({ recipeId }: PublicRecipeViewProps) {
  const recipe = useQuery(api.recipes.getPublicRecipe, { id: recipeId as any })

  const handlePrint = () => {
    window.print()
  }

  // Loading state
  if (recipe === undefined) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  // Recipe not found or not public
  if (recipe === null) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
        <p className="text-gray-600 mb-4">
          This recipe is either private or doesn't exist.
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Browse Recipes
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8">
      {/* Header with print button - hidden in print */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-sm text-gray-500">Shared Recipe</h1>
          <p className="text-xs text-gray-400">myrecipecollection.app</p>
        </div>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Recipe
        </Button>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:pb-4">
          <CardTitle className="text-3xl print:text-4xl print:mb-2">{recipe.name}</CardTitle>
          
          {/* Recipe metadata */}
          <div className="flex flex-wrap gap-4 mt-4 print:mt-6">
            {recipe.prepTime > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 print:text-black">
                <Clock className="h-4 w-4" />
                <span>{recipe.prepTime} minutes</span>
              </div>
            )}
            
            {recipe.servings && (
              <div className="flex items-center gap-2 text-sm text-gray-600 print:text-black">
                <Users className="h-4 w-4" />
                <span>Serves {recipe.servings}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600 print:text-black">
              <Tag className="h-4 w-4" />
              <span>{recipe.category}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 print:space-y-6">
          {/* Ingredients Section */}
          <div className="print:break-inside-avoid">
            <h3 className="text-xl font-semibold mb-4 print:text-2xl print:mb-4 print:border-b print:border-gray-300 print:pb-2">
              Ingredients
            </h3>
            <div className="grid gap-2 print:gap-1">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-start print:py-1">
                  <span className="text-gray-400 mr-3 print:text-black print:mr-4">•</span>
                  <span className="print:text-base">
                    <strong className="print:text-black">
                      {ingredient.amount} {ingredient.unit}
                    </strong>{" "}
                    {ingredient.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="print:break-inside-avoid">
            <h3 className="text-xl font-semibold mb-4 print:text-2xl print:mb-4 print:border-b print:border-gray-300 print:pb-2">
              Instructions
            </h3>
            <div className="space-y-4 print:space-y-2">
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

          {/* Footer - only in print */}
          <div className="hidden print:block print:mt-8 print:pt-4 print:border-t print:border-gray-300">
            <p className="text-sm text-gray-600 print:text-black">
              Recipe shared from myrecipecollection.app
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RecipePageComponent() {
  const { id } = Route.useParams()
  return <PublicRecipeView recipeId={id} />
}

export const Route = createFileRoute('/recipe/$id')({
  component: RecipePageComponent,
})
