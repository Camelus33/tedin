"use client";
import React from 'react';

export type StepStatus = 'pending' | 'active' | 'complete';

export interface StepItem {
  id: string;
  label: string;
  status: StepStatus;
}

type StepperProps = {
  steps: StepItem[];
  orientation?: 'horizontal' | 'vertical';
};

export default function Stepper({ steps, orientation = 'horizontal' }: StepperProps) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-start mt-4`}>
      {steps.map((step, idx) => {
        const isComplete = step.status === 'complete';
        const isActive = step.status === 'active';
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0 ${
                  isComplete
                    ? 'bg-cyan-500 border-cyan-500 text-gray-900'
                    : isActive
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-gray-600 text-gray-500'
                }`}
              >
                {isComplete ? '✓' : idx + 1}
              </div>
              <span className="ml-3 text-sm text-gray-300">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`${isHorizontal ? 'flex-1 h-px mx-2' : 'w-px h-4 mt-1 ml-3'} bg-gray-600`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
} 