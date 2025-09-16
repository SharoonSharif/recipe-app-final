import { useState } from 'react'
import { Check, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonProps {
  recipeId: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function ShareButton({ 
  recipeId, 
  size = 'md',
  disabled = false 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = `${window.location.origin}/recipe/${recipeId}`
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2', 
    lg: 'text-base px-4 py-2'
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopyLink}
      disabled={disabled}
      className={sizeClasses[size]}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2 text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Link className="h-4 w-4 mr-2" />
          Share Recipe
        </>
      )}
    </Button>
  )
}
