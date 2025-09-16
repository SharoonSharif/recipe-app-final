import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  isFavorite?: boolean
  onToggle?: (e?: React.MouseEvent) => void // Allow optional event parameter
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function FavoriteButton({ 
  isFavorite = false, 
  onToggle, 
  size = 'md',
  disabled = false 
}: FavoriteButtonProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <button
      type="button"
      onClick={(e) => onToggle?.(e)} // Pass the event to onToggle
      disabled={disabled}
      className={cn(
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1',
        disabled 
          ? 'cursor-not-allowed opacity-50' 
          : 'cursor-pointer hover:scale-110 active:scale-95'
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          'transition-colors',
          isFavorite
            ? 'fill-red-500 text-red-500'
            : 'fill-none text-gray-400 hover:text-red-400'
        )}
      />
    </button>
  )
}