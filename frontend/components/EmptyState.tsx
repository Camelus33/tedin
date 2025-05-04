import React from 'react';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  color?: string;
  sampleTitle?: string;
  sampleDescription?: string;
  onSampleClick?: () => void;
  sampleButtonLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon, color, sampleTitle, sampleDescription, onSampleClick, sampleButtonLabel }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon ? (
      <div className="mb-4" style={{ color: color || '#a3a3a3' }}>{icon}</div>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7h4l2 3h10a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"
        />
      </svg>
    )}
    <p className="mt-4 text-gray-500 text-lg">{message}</p>
    {sampleTitle && (
      <div className="mt-6">
        <h3 className="text-base font-semibold mb-2" style={{ color }}>{sampleTitle}</h3>
        <p className="text-sm text-gray-400 mb-4">{sampleDescription}</p>
        {onSampleClick && (
          <button
            className="px-4 py-2 rounded bg-accent text-white hover:bg-green-500 hover:text-green-100 transition-colors font-medium"
            onClick={onSampleClick}
          >
            {sampleButtonLabel || '샘플로 시작하기'}
          </button>
        )}
      </div>
    )}
  </div>
);

export default EmptyState; 