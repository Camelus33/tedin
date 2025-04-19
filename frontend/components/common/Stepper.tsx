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
    <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-start`}> 
      {steps.map((step, idx) => {
        const isComplete = step.status === 'complete';
        const isActive = step.status === 'active';
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isComplete
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : isActive
                    ? 'border-primary-500 text-primary-500'
                    : 'border-neutral-300 text-neutral-600'
                }`}
              >
                {isComplete ? '✓' : idx + 1}
              </div>
              <span className="ml-2 text-sm text-neutral-700">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`${isHorizontal ? 'flex-1 h-px mx-4 my-0.5' : 'w-px my-4 mx-0.5'} bg-neutral-300`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
} 