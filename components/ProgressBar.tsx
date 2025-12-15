'use client'

import React from 'react'
import { Check, Clock, Settings, Eye, CheckCircle } from 'lucide-react'

export type ProjectStatus =
  | 'SUBMITTED'
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETE'

interface ProgressBarProps {
  currentStatus: ProjectStatus
  className?: string
}

const stages = [
  { key: 'SUBMITTED', label: 'Submitted', icon: Check },
  { key: 'QUEUED', label: 'In Queue', icon: Clock },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Settings },
  { key: 'REVIEW', label: 'Review', icon: Eye },
  { key: 'COMPLETE', label: 'Complete', icon: CheckCircle }
]

export default function ProgressBar({ currentStatus, className = '' }: ProgressBarProps) {
  const currentIndex = stages.findIndex(stage => stage.key === currentStatus)

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar for desktop */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10" />

          {/* Active progress line */}
          <div
            className="absolute top-5 left-0 h-1 bg-green-500 -z-10 transition-all duration-500"
            style={{
              width: currentIndex >= 0 ? `${(currentIndex / (stages.length - 1)) * 100}%` : '0%'
            }}
          />

          {/* Stage circles */}
          {stages.map((stage, index) => {
            const isComplete = index < currentIndex
            const isCurrent = index === currentIndex
            const isPending = index > currentIndex
            const Icon = stage.icon

            return (
              <div key={stage.key} className="flex flex-col items-center relative">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg
                    transition-all duration-300 border-2
                    ${isComplete ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-500 border-blue-500 text-white ring-4 ring-blue-200 scale-110' : ''}
                    ${isPending ? 'bg-white border-gray-300 text-gray-400' : ''}
                  `}
                >
                  {isComplete ? <Check size={20} /> : <Icon size={20} />}
                </div>
                <span
                  className={`
                    mt-2 text-xs sm:text-sm font-medium text-center
                    ${isCurrent ? 'text-blue-600 font-bold' : ''}
                    ${isComplete ? 'text-green-600' : ''}
                    ${isPending ? 'text-gray-400' : ''}
                  `}
                >
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress bar for mobile - vertical layout */}
      <div className="md:hidden space-y-4">
        {stages.map((stage, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex
          const isPending = index > currentIndex
          const Icon = stage.icon

          return (
            <div key={stage.key} className="flex items-start gap-4">
              {/* Icon and line */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg
                    transition-all duration-300 border-2 flex-shrink-0
                    ${isComplete ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-500 border-blue-500 text-white ring-4 ring-blue-200' : ''}
                    ${isPending ? 'bg-white border-gray-300 text-gray-400' : ''}
                  `}
                >
                  {isComplete ? <Check size={20} /> : <Icon size={20} />}
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={`
                      w-0.5 h-12 mt-2
                      ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>

              {/* Label */}
              <div className="pt-2">
                <span
                  className={`
                    text-base font-medium
                    ${isCurrent ? 'text-blue-600 font-bold' : ''}
                    ${isComplete ? 'text-green-600' : ''}
                    ${isPending ? 'text-gray-400' : ''}
                  `}
                >
                  {stage.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
