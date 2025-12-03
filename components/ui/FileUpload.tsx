'use client'

import React, { useRef, useState } from 'react'
import { Tooltip } from './Tooltip'

interface FileUploadProps {
  label?: string
  error?: string
  tooltip?: string
  description?: string
  accept?: string
  multiple?: boolean
  required?: boolean
  onChange?: (files: File[]) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  tooltip,
  description,
  accept,
  multiple = false,
  required = false,
  onChange
}) => {
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
    onChange?.(selectedFiles)
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onChange?.(newFiles)
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="inline-flex items-center gap-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {tooltip && <Tooltip content={tooltip} />}
          </span>
        </label>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md p-6 text-center cursor-pointer hover:border-underground-teal transition`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-gray-600">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500 mt-1">
            {accept || 'Any file type'}
          </p>
        </div>
      </div>

      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded"
            >
              <span className="text-sm text-gray-700 truncate">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile(index)
                }}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
