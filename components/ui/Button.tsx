import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'px-6 py-3 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          style: { backgroundColor: '#A6E7DE', color: '#1C3450' },
          className: 'hover:opacity-80'
        }
      case 'secondary':
        return {
          style: { backgroundColor: '#1C3450', color: '#A6E7DE' },
          className: 'hover:opacity-90'
        }
      case 'outline':
        return {
          style: {
            borderColor: '#A6E7DE',
            color: '#1C3450',
            borderWidth: '2px'
          },
          className: 'hover:opacity-70'
        }
      default:
        return { style: {}, className: '' }
    }
  }

  const variantConfig = getVariantStyles()

  return (
    <button
      className={`${baseStyles} ${variantConfig.className} ${className}`}
      style={variantConfig.style}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
