'use client';
import React from 'react';
import IntroSection from '../../components/ir/IntroSection';
import MarketNeedSection from '../../components/ir/MarketNeedSection';
import ProblemSection from '../../components/ir/ProblemSection';
import CompetitorAnalysisSection from '../../components/ir/CompetitorAnalysisSection';
import SolutionSection from '../../components/ir/SolutionSection';
import UserScenarioSection from '../../components/ir/UserScenarioSection';
import BenefitsSection from '../../components/ir/BenefitsSection';
import WhyNowSection from '../../components/ir/WhyNowSection';
import MarketSizeSection from '../../components/ir/MarketSizeSection';
import TechnologySection from '../../components/ir/TechnologySection';
import BusinessModelSection from '../../components/ir/BusinessModelSection';
import GrowthStrategySection from '../../components/ir/GrowthStrategySection';
import FinancialsSection from '../../components/ir/FinancialsSection';
import TeamSection from '../../components/ir/TeamSection';
import HistorySection from '../../components/ir/HistorySection';
// import FinancialsSection from '@/components/ir/FinancialsSection';

const IRPage = () => {
  return (
    <div className="bg-slate-950">
      {/* <h1>IR Page</h1> */}
      <IntroSection />
      <MarketNeedSection />
      <ProblemSection />
      <CompetitorAnalysisSection />
      <SolutionSection />
      <UserScenarioSection />
      <BenefitsSection />
      <WhyNowSection />
      <MarketSizeSection />
      <TechnologySection />
      <BusinessModelSection />
      <GrowthStrategySection />
      <FinancialsSection />
      <TeamSection />
      <HistorySection />
      {/* <FinancialsSection /> */}
      {/* <RoadmapSection /> */}
      {/* <ContactSection /> */}
    </div>
  );
};

export default IRPage;