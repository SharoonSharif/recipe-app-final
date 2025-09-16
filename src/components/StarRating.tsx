import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating?: number // Current rating (1-5)
  onRatingChange?: (rating: number | undefined) => void // Callback when rating changes
  readonly?: boolean // If true, stars are not clickable
  size?: 'sm' | 'md' | 'lg' // Size of stars
  showClear?: boolean // Show clear rating option
}

export function StarRating({ 
  rating = 0, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showClear = true 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const handleClick = (newRating: number) => {
    if (readonly || !onRatingChange) return
    
    // If clicking the same rating, clear it (if showClear is true)
    if (newRating === rating && showClear) {
      onRatingChange(undefined)
    } else {
      onRatingChange(newRating)
    }
  }

  const handleMouseEnter = (newRating: number) => {
    if (!readonly) {
      setHoverRating(newRating)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={cn(
            sizeClasses[size],
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform',
            'focus:outline-none focus:ring-2 focus:ring-blue-300 rounded'
          )}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              'transition-colors',
              star <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300 hover:text-yellow-300'
            )}
          />
        </button>
      ))}
      
      {/* Clear rating button */}
      {!readonly && showClear && rating && rating > 0 && (
        <button
          type="button"
          onClick={() => onRatingChange?.(undefined)}
          className="ml-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear
        </button>
      )}
      
      {/* Rating text for readonly mode */}
      {readonly && rating && rating > 0 && (
        <span className="ml-1 text-sm text-gray-600">
          {rating}/5
        </span>
      )}
    </div>
  )
}