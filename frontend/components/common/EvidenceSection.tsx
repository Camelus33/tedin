import React from 'react';

type Citation = {
  author: string;
  title: string;
  year: number;
  url?: string;
};

interface EvidenceSectionProps {
  description: string;
  citations: Citation[];
}

const EvidenceSection: React.FC<EvidenceSectionProps> = ({ description, citations }) => {
  return (
    <div className="bg-indigo-50 p-4 rounded-md border-l-4 border-indigo-500 mb-4">
      <p className="font-semibold text-indigo-800 mb-2">{description}</p>
      <ul className="list-disc list-inside text-sm text-gray-700">
        {citations.map((c, i) => (
          <li key={i}>
            {c.author} ({c.year}). <em>{c.title}</em>
            {c.url && (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline ml-1"
              >
                [Link]
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EvidenceSection; 