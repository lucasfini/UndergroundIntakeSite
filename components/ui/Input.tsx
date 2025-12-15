import React from 'react'
import { Tooltip } from './Tooltip'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  tooltip?: string
}

export const Input: React.FC<InputProps> = ({ label, error, tooltip, className = '', disabled, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="inline-flex items-center gap-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
            {tooltip && <Tooltip content={tooltip} />}
            {disabled && (
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
            )}
          </span>
        </label>
      )}
      <input
        className={`w-full px-4 py-3 text-base border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md focus:outline-none transition ${
          disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
        } ${className}`}
        style={{
          ...(error ? {} : {
            '--focus-border-color': '#A6E7DE'
          } as React.CSSProperties)
        }}
        onFocus={(e) => {
          if (!error && !disabled) {
            e.target.style.borderColor = '#A6E7DE'
            e.target.style.boxShadow = '0 0 0 3px rgba(166, 231, 222, 0.1)'
          }
        }}
        onBlur={(e) => {
          if (!error && !disabled) {
            e.target.style.borderColor = '#d1d5db'
            e.target.style.boxShadow = 'none'
          }
        }}
        disabled={disabled}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
