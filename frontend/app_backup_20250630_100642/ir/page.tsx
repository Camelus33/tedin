'use client';
import React from 'react';

// IR Sections
import IntroSection from '../../components/ir/IntroSection';
import MarketNeedSection from '../../components/ir/MarketNeedSection';
import ProblemSection from '../../components/ir/ProblemSection';
import SolutionSection from '../../components/ir/SolutionSection';
import TechnologySection from '../../components/ir/TechnologySection';
import BenefitsSection from '../../components/ir/BenefitsSection';
import UserScenarioSection from '../../components/ir/UserScenarioSection';
import WhyNowSection from '../../components/ir/WhyNowSection';
import MarketSizeSection from '../../components/ir/MarketSizeSection';
import CompetitorAnalysisSection from '../../components/ir/CompetitorAnalysisSection';
import BusinessModelSection from '../../components/ir/BusinessModelSection';
import GrowthStrategySection from '../../components/ir/GrowthStrategySection';
import FinancialsSection from '../../components/ir/FinancialsSection';
import TeamSection from '../../components/ir/TeamSection';
import HistorySection from '../../components/ir/HistorySection';

const IRPage = () => {
  return (
    <div className="bg-slate-950">
      <IntroSection />
      <MarketNeedSection />
      <ProblemSection />
      <SolutionSection />
      <TechnologySection />
      <BenefitsSection />
      <UserScenarioSection />
      <WhyNowSection />
      <MarketSizeSection />
      <CompetitorAnalysisSection />
      <BusinessModelSection />
      <GrowthStrategySection />
      <FinancialsSection />
      <TeamSection />
      <HistorySection />
    </div>
  );
};

export default IRPage;