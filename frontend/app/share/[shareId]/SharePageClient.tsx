'use client';

import LearningJourneyVisualization from '@/components/share/LearningJourneyVisualization';

// Define the props interface for type safety
interface SharePageClientProps {
  learningJourney: any; // Consider creating a more specific type for the journey data
  className?: string;
}

const SharePageClient = ({ learningJourney, className }: SharePageClientProps) => {
  // This component will only render on the client side,
  // preventing the visualization from being part of the initial server-rendered HTML.
  // This is ideal for AI crawlers that primarily parse static content.
  return (
    <section className="mb-10">
        <LearningJourneyVisualization 
            learningJourney={learningJourney}
            className={className}
        />
    </section>
  );
};

export default SharePageClient; 