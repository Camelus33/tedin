'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTextProps {
  text: string;
  lineLimit?: number;
}

const ExpandableText = ({ text, lineLimit = 3 }: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 텍스트가 200자 이상일 때만 '더 보기' 기능 활성화
  const needsTruncation = text.length > 200;

  if (!needsTruncation) {
    return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>;
  }

  return (
    <div>
      <p
        className="whitespace-pre-wrap leading-relaxed transition-all duration-300 ease-in-out"
        style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: isExpanded ? 'none' : lineLimit,
          overflow: 'hidden',
        }}
      >
        {text}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-sm font-semibold text-green-600 hover:text-green-700 flex items-center"
      >
        {isExpanded ? '간단히 보기' : '더 보기'}
        {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
      </button>
    </div>
  );
};

export default ExpandableText; 