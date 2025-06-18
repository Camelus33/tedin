'use client';
import React from 'react';
import IntroSection from '../../components/ir/IntroSection';
import ProblemSection from '../../components/ir/ProblemSection';
import SolutionSection from '../../components/ir/SolutionSection';
import WhyNowSection from '../../components/ir/WhyNowSection';
import MarketSizeSection from '../../components/ir/MarketSizeSection';
import TechnologySection from '../../components/ir/TechnologySection';
import BusinessModelSection from '../../components/ir/BusinessModelSection';
import GrowthStrategySection from '../../components/ir/GrowthStrategySection';
import FinancialsSection from '../../components/ir/FinancialsSection';
import TeamSection from '../../components/ir/TeamSection';
// import FinancialsSection from '@/components/ir/FinancialsSection';

const IRPage = () => {
  return (
    <div className="bg-slate-950">
      {/* <h1>IR Page</h1> */}
      <IntroSection />
      <ProblemSection />
      <SolutionSection />
      <WhyNowSection />
      <MarketSizeSection />
      <TechnologySection />
      <BusinessModelSection />
      <GrowthStrategySection />
      <FinancialsSection />
      <TeamSection />
      {/* <FinancialsSection /> */}
      {/* <RoadmapSection /> */}
      {/* <ContactSection /> */}
    </div>
  );
};

export default IRPage;