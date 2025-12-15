import React from 'react'
import { Tooltip } from './Tooltip'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  tooltip?: string
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, tooltip, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="inline-flex items-center gap-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
            {tooltip && <Tooltip content={tooltip} />}
          </span>
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 text-base border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md focus:outline-none transition resize-y ${className}`}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = '#A6E7DE'
            e.target.style.boxShadow = '0 0 0 3px rgba(166, 231, 222, 0.1)'
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.target.style.borderColor = '#d1d5db'
            e.target.style.boxShadow = 'none'
          }
        }}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
